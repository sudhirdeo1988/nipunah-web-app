import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";
import { verifyAndStripRegisterCaptcha } from "@/lib/registerCaptchaGuard";

const CAPTCHA_FIELD_KEYS = new Set(["captchaToken", "recaptcha_token"]);

async function parseUpstreamResponse(response) {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text || response.statusText };
  }
}

/**
 * Forward multipart registration (includes binary profile photo) to upstream.
 * Captcha fields are verified here and stripped before the upstream call.
 */
async function handleMultipartRegister(request) {
  const incoming = await request.formData();
  const captchaToken = incoming.get("captchaToken") ?? incoming.get("recaptcha_token");

  const captcha = await verifyAndStripRegisterCaptcha({
    captchaToken:
      typeof captchaToken === "string" && captchaToken.trim()
        ? captchaToken.trim()
        : undefined,
  });
  if (!captcha.ok) {
    return captcha.response;
  }

  const outbound = new FormData();
  for (const [key, value] of incoming.entries()) {
    if (CAPTCHA_FIELD_KEYS.has(key)) continue;
    outbound.append(key, value);
  }

  const url = `${API_BASE_URL}/users/register`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: outbound,
  });

  const data = await parseUpstreamResponse(response);
  return NextResponse.json(data, {
    status: response.status,
    statusText: response.statusText,
  });
}

/**
 * Forward JSON registration payload to upstream (no file upload).
 */
async function handleJsonRegister(request) {
  const body = await request.json();
  const captcha = await verifyAndStripRegisterCaptcha(body);
  if (!captcha.ok) {
    return captcha.response;
  }

  const url = `${API_BASE_URL}/users/register`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(captcha.payload),
  });

  const data = await parseUpstreamResponse(response);
  return NextResponse.json(data, {
    status: response.status,
    statusText: response.statusText,
  });
}

/**
 * POST /api/users/register
 * Proxy endpoint for user registration API to avoid CORS issues
 * Public endpoint - no authentication required
 *
 * Supports:
 * - application/json (no profile photo)
 * - multipart/form-data (one or more binary profile_photo files + form fields)
 */
export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      return await handleMultipartRegister(request);
    }

    return await handleJsonRegister(request);
  } catch (error) {
    console.error("User registration API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to register user",
      },
      { status: 500 }
    );
  }
}
