import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/** Next.js App Router: no static caching of proxy responses */
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
 * Upstream base URL. Prefer `process.env.API_BASE_URL` when set (same pattern as
 * `src/app/api/enquiries/route.js`).
 */
function getUpstreamApiBaseUrl() {
  const env = process.env.API_BASE_URL;
  if (typeof env === "string" && env.trim()) {
    return env.trim().replace(/\/$/, "");
  }
  return API_BASE_URL.replace(/\/$/, "");
}

/**
 * Optional override when the backend path differs from `/experts/become-expert`.
 * Example: `/users/become-expert` (normalized to start with `/`).
 */
function getBecomeExpertPath() {
  const raw = process.env.BECOME_EXPERT_BACKEND_PATH;
  if (typeof raw === "string" && raw.trim()) {
    const p = raw.trim();
    return p.startsWith("/") ? p : `/${p}`;
  }
  return "/experts/become-expert";
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

function getBearerTokenFromAuthHeader(authorizationHeader) {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token.trim() || null;
}

function resolveBearerToken(request) {
  const fromHeader = getBearerTokenFromAuthHeader(
    request.headers.get("authorization") || ""
  );
  if (fromHeader) return fromHeader;
  return getBearerTokenFromCookieHeader(request.headers.get("cookie") || "");
}

/**
 * Read upstream body without throwing (empty body + application/json is common).
 * Same resilience pattern as `src/app/api/jobs/route.js` POST handler.
 */
async function readUpstreamJsonBody(response) {
  const text = await response.text();
  if (!text || !text.trim()) {
    return response.ok ? {} : { message: response.statusText || "Empty response" };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

/**
 * POST /api/experts/become-expert
 * Proxies to upstream with Bearer auth + optional Cookie passthrough.
 */
export async function POST(request) {
  try {
    const token = resolveBearerToken(request);
    if (!token) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication token is required",
        },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request body",
          message: "Request body must be valid JSON",
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const base = getUpstreamApiBaseUrl();
    const path = getBecomeExpertPath();
    const url = `${base}${path}`;

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        cache: "no-store",
      });
    } catch (fetchError) {
      console.error("Become expert upstream fetch failed:", fetchError);
      return NextResponse.json(
        {
          error: "Upstream unavailable",
          message:
            fetchError?.message ||
            "Could not reach the backend. Check API_BASE_URL / network.",
        },
        { status: 502 }
      );
    }

    let data;
    try {
      data = await readUpstreamJsonBody(response);
    } catch (parseError) {
      console.error("Become expert response read error:", parseError);
      data = {
        error: "Failed to read upstream response",
        message: parseError?.message || "Unknown error",
        status: response.status,
      };
    }

    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("Become expert API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || "Failed to submit become expert request",
      },
      { status: 500 }
    );
  }
}
