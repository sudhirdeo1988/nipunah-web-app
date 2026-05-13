import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/** Next.js App Router: always run on the server; no static caching of proxy responses */
export const dynamic = "force-dynamic";

function getBearerTokenFromAuthorizationHeader(request) {
  const auth = request.headers.get("authorization");
  if (!auth || typeof auth !== "string") return null;
  const matched = auth.match(/^Bearer\s+(.+)$/i);
  return matched?.[1]?.trim() || null;
}

function getBearerTokenFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const trimmed = cookie.trim();
    const equalIndex = trimmed.indexOf("=");
    if (equalIndex > 0) {
      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();
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
 * GET /api/pricing/getPricingDetails?currency={currency}&billingCycle={cycle}
 *
 * Proxies to upstream `${API_BASE_URL}/pricing/getPricingDetails` with the
 * same query string, preserving currency + billingCycle. Both params are
 * forwarded as-is so the upstream stays the single source of truth for
 * defaults / casing.
 *
 * Accepts legacy `cycle` alias for `billingCycle` so older callers don't
 * silently drop the param.
 */
export async function GET(request) {
  try {
    const token = resolveBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication token is required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const currency = (searchParams.get("currency") || "").trim();
    const billingCycle = (
      searchParams.get("billingCycle") ||
      searchParams.get("cycle") ||
      ""
    ).trim();

    const upstreamParams = new URLSearchParams();
    if (currency) upstreamParams.set("currency", currency);
    if (billingCycle) upstreamParams.set("billingCycle", billingCycle);

    const queryString = upstreamParams.toString();
    const url = `${API_BASE_URL}/pricing/getPricingDetails${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, {
        status: response.status,
        statusText: response.statusText,
      });
    }

    const text = await response.text();
    return NextResponse.json(
      { message: text || response.statusText },
      { status: response.status, statusText: response.statusText }
    );
  } catch (error) {
    console.error("GET /api/pricing/getPricingDetails proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to fetch pricing details",
      },
      { status: 500 }
    );
  }
}
