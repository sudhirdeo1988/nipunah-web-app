import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";
import { verifyAndStripRegisterCaptcha } from "@/lib/registerCaptchaGuard";

/**
 * POST /api/users/register
 * Proxy endpoint for user registration API to avoid CORS issues
 * Public endpoint - no authentication required
 */
export async function POST(request) {
  try {
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

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || response.statusText };
      }
    }

    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
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
