import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/**
 * Upstream endpoint: PATCH {API_BASE_URL}/auth/changePassword
 *
 * This route is a thin proxy:
 *   1. Validates the incoming JSON body.
 *   2. Resolves the Bearer token (Authorization header or auth cookie).
 *   3. Forwards the request as PATCH to the backend with the same body.
 *   4. Returns the upstream response verbatim.
 */
const UPSTREAM_PATH = "/auth/changePassword";

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
    const trimmed = cookie.trim();
    const eq = trimmed.indexOf("=");
    if (eq > 0) {
      const key = trimmed.substring(0, eq).trim();
      const value = trimmed.substring(eq + 1).trim();
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

function resolveBearerToken(request) {
  const auth = request.headers.get("authorization");
  if (auth && typeof auth === "string") {
    const m = auth.match(/^Bearer\s+(.+)$/i);
    const token = m?.[1]?.trim();
    if (token) return token;
  }
  const cookies = parseCookieHeader(request.headers.get("cookie") || "");
  for (const name of TOKEN_COOKIE_NAMES) {
    const v = cookies[name];
    if (v && String(v).trim()) return String(v).trim();
  }
  return null;
}

/**
 * Read upstream body safely. Some servers send plain text with a JSON
 * Content-Type header; reading as text first avoids JSON.parse crashes.
 */
async function readUpstreamBody(response) {
  const text = await response.text();
  const trimmed = text.trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed);
  } catch {
    return { message: trimmed };
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PATCH /api/auth/changePassword
 * Body: { oldPassword: string, newPassword: string }
 */
export async function PATCH(request) {
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

    const oldPassword = body?.oldPassword;
    const newPassword = body?.newPassword;

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { message: "oldPassword and newPassword are required." },
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

    const url = `${API_BASE_URL}${UPSTREAM_PATH}`;
    const upstreamResponse = await fetch(url, {
      method: "PATCH",
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

    const data = await readUpstreamBody(upstreamResponse);

    // 204/205 cannot carry a body; NextResponse.json with 204 throws in Node.
    // Normalize empty success responses to 200 + JSON so the client can parse.
    if (upstreamResponse.status === 204 || upstreamResponse.status === 205) {
      return NextResponse.json(
        {
          success: true,
          message:
            (typeof data?.message === "string" && data.message) ||
            "Password changed successfully.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(data, { status: upstreamResponse.status });
  } catch (error) {
    console.error("changePassword proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || "Failed to change password.",
      },
      { status: 500 }
    );
  }
}
