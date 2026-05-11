import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/** Next.js App Router: always run on the server; no static caching of proxy responses */
export const dynamic = "force-dynamic";

const TOKEN_COOKIE_KEYS = [
  "access_token",
  "token",
  "auth_token",
  "authToken",
  "jwt",
  "id_token",
];

/**
 * Upstream base URL. Prefers process.env.API_BASE_URL if set, falls back to
 * the constant. Trailing slash is stripped so URL joining is predictable.
 */
function getUpstreamApiBaseUrl() {
  const env = process.env.API_BASE_URL;
  if (typeof env === "string" && env.trim()) {
    return env.trim().replace(/\/$/, "");
  }
  return API_BASE_URL.replace(/\/$/, "");
}

function getBearerTokenFromAuthorizationHeader(request) {
  const auth = request.headers.get("authorization");
  if (!auth || typeof auth !== "string") return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

function getBearerTokenFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
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

  for (const key of TOKEN_COOKIE_KEYS) {
    if (cookies[key]) return cookies[key];
  }
  return null;
}

function isUsableToken(token) {
  if (!token || typeof token !== "string") return false;
  const normalized = token.trim().toLowerCase();
  if (!normalized) return false;
  return !["undefined", "null", "nan"].includes(normalized);
}

function resolveBearerToken(request) {
  return (
    getBearerTokenFromAuthorizationHeader(request) ||
    getBearerTokenFromCookieHeader(request.headers.get("cookie") || "")
  );
}

/**
 * Parse upstream body without throwing — malformed JSON from upstream must
 * not become a 500 from this proxy.
 */
async function readUpstreamBody(response) {
  const raw = await response.text();
  if (!raw) return { message: response.statusText || "Empty response" };
  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw };
  }
}

/**
 * GET /api/enquiries/threads
 *
 * Direct passthrough to upstream `${API_BASE_URL}/enquiries/threads`.
 *
 * Query params are forwarded as-is after dropping null/undefined/empty values
 * so a stray `?foo=` doesn't reach upstream.
 *
 * Auth: requires a bearer token (Authorization header, falling back to any of
 * the standard auth cookie keys). Returns 401 otherwise.
 *
 * Typical usage:
 *   GET /api/enquiries/threads?companyId=<id>
 */
export async function GET(request) {
  const base = getUpstreamApiBaseUrl();
  try {
    const { searchParams } = new URL(request.url);
    const cleanedParams = Array.from(searchParams.entries()).filter(
      ([_, value]) => value !== null && value !== undefined && value !== ""
    );

    let url = `${base}/enquiries/threads`;
    if (cleanedParams.length > 0) {
      const queryString = new URLSearchParams(cleanedParams).toString();
      if (queryString) url += `?${queryString}`;
    }

    const token = resolveBearerToken(request);
    if (!isUsableToken(token)) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication token is required" },
        { status: 401 }
      );
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await readUpstreamBody(response);

    if (!response.ok) {
      console.error(
        "GET /api/enquiries/threads upstream non-OK:",
        response.status,
        data
      );
    }

    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("GET /api/enquiries/threads proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to fetch enquiry threads",
      },
      { status: 500 }
    );
  }
}
