import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/**
 * Backend path after API_BASE_URL (e.g. http://host/api).
 * Default matches other auth routes: /auth/login, /auth/forgot-password, /auth/reset-password.
 * If your server only exposes POST /api/change-password, set:
 *   CHANGE_PASSWORD_BACKEND_PATH=/change-password
 */
const CHANGE_PASSWORD_BACKEND_PATH =
  process.env.CHANGE_PASSWORD_BACKEND_PATH || "/auth/change-password";

/** Same fallbacks as client auth.js */
const TOKEN_COOKIE_NAMES = [
  "access_token",
  "token",
  "auth_token",
  "authToken",
  "jwt",
  "id_token",
];

function parseCookieHeader(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce((acc, cookie) => {
    const trimmedCookie = cookie.trim();
    const equalIndex = trimmedCookie.indexOf("=");
    if (equalIndex > 0) {
      const key = trimmedCookie.substring(0, equalIndex).trim();
      const value = trimmedCookie.substring(equalIndex + 1).trim();
      if (key && value) {
        try {
          acc[key] = decodeURIComponent(value);
        } catch {
          acc[key] = value;
        }
      }
    }
    return acc;
  }, {});
}

function getBearerFromAuthorizationHeader(request) {
  const auth = request.headers.get("authorization");
  if (!auth || typeof auth !== "string") return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

function getBearerFromCookies(cookieHeader) {
  const cookies = parseCookieHeader(cookieHeader);
  for (const name of TOKEN_COOKIE_NAMES) {
    const v = cookies[name];
    if (v && String(v).trim()) return String(v).trim();
  }
  return null;
}

function resolveBearerToken(request) {
  return (
    getBearerFromAuthorizationHeader(request) ||
    getBearerFromCookies(request.headers.get("cookie") || "")
  );
}

/**
 * Some APIs send plain text (e.g. "Password changed successfully") but still set
 * Content-Type: application/json — response.json() then throws. Always read text first.
 */
async function parseUpstreamResponseBody(response) {
  const text = await response.text();
  const trimmed = text.trim();
  if (!trimmed) {
    return {};
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return { message: trimmed };
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/auth/change-password — verify route is mounted (avoids confusing 404 in browser)
 */
export async function GET() {
  const upstream = `${API_BASE_URL}${CHANGE_PASSWORD_BACKEND_PATH.startsWith("/") ? "" : "/"}${CHANGE_PASSWORD_BACKEND_PATH}`;
  return NextResponse.json(
    {
      ok: true,
      nextRoute: "/api/auth/change-password",
      method: "POST",
      body: { oldPassword: "string", newPassword: "string" },
      auth: "Authorization: Bearer <token> or access_token cookie",
      upstream,
    },
    { status: 200 }
  );
}

/**
 * POST /api/auth/change-password
 * Proxies to backend change-password with Bearer token.
 */
export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Request body must be valid JSON." },
        { status: 400 }
      );
    }
    const oldPassword = body?.oldPassword ?? body?.currentPassword;
    const newPassword = body?.newPassword;

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { message: "Old password and new password are required." },
        { status: 400 }
      );
    }

    const token = resolveBearerToken(request);
    if (!token) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication token is required. Please sign in again.",
        },
        { status: 401 }
      );
    }

    const path = CHANGE_PASSWORD_BACKEND_PATH.startsWith("/")
      ? CHANGE_PASSWORD_BACKEND_PATH
      : `/${CHANGE_PASSWORD_BACKEND_PATH}`;
    const url = `${API_BASE_URL}${path}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassword: String(oldPassword),
        newPassword: String(newPassword),
      }),
    });

    const data = await parseUpstreamResponseBody(response);

    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("Change password API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to change password",
      },
      { status: 500 }
    );
  }
}
