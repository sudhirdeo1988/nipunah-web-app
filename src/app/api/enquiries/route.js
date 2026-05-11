import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/** Next.js App Router: always run on the server; no static caching of proxy responses */
export const dynamic = "force-dynamic";

/**
 * Upstream base (default from constants). Set API_BASE_URL in .env for deployments
 * so this route always proxies to your backend — no client-side direct calls needed.
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

  return cookies["access_token"] || cookies.access_token || null;
}

function resolveBearerToken(request) {
  return (
    getBearerTokenFromAuthorizationHeader(request) ||
    getBearerTokenFromCookieHeader(request.headers.get("cookie") || "")
  );
}

/**
 * Parse upstream body without throwing — malformed JSON must not become a 500 from this proxy.
 */
async function readUpstreamBody(response) {
  const raw = await response.text();
  if (!raw) {
    return { message: response.statusText || "Empty response" };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw };
  }
}

/**
 * GET /api/enquiries
 *
 * Legacy backward-compat handler. The canonical thread-listing endpoint is now
 * GET /api/enquiries/threads (see src/app/api/enquiries/threads/route.js).
 * All app code calls the canonical path via `enquiryService.getEnquiries`.
 *
 * This handler is left in place to avoid breaking any external/older caller
 * that may still hit /api/enquiries directly; it forwards to the same upstream
 * (`${upstream}/enquiries/threads`) with the query params preserved.
 */
export async function GET(request) {
  const base = getUpstreamApiBaseUrl();
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    let url = `${base}/enquiries/threads`;
    if (Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(
          ([_, value]) => value !== null && value !== undefined && value !== ""
        )
      ).toString();
      if (queryString) url += `?${queryString}`;
    }

    const token = resolveBearerToken(request);
    if (!token) {
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
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("GET /api/enquiries proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to fetch enquiries",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/enquiries
 * Proxies to ${upstream}/enquiries (create enquiry).
 * Client: axios POST /api/enquiries with JSON body — always goes through this handler.
 */
export async function POST(request) {
  const base = getUpstreamApiBaseUrl();
  try {
    const token = resolveBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication token is required" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const normalizedBody =
      body && typeof body === "object" && !Array.isArray(body)
        ? {
            ...body,
            enquiry_from:
              body.enquiry_from === undefined || body.enquiry_from === null
                ? body.enquiry_from
                : String(body.enquiry_from),
            enquiry_to:
              body.enquiry_to === undefined || body.enquiry_to === null
                ? body.enquiry_to
                : String(body.enquiry_to),
          }
        : {};

    const url = `${base}/enquiries`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(normalizedBody),
    });

    const data = await readUpstreamBody(response);
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("POST /api/enquiries proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to create enquiry",
      },
      { status: 500 }
    );
  }
}
