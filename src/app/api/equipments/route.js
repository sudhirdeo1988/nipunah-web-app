import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

const TOKEN_COOKIE_KEYS = [
  "access_token",
  "token",
  "auth_token",
  "authToken",
  "jwt",
  "id_token",
];

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

function isUsableToken(token) {
  if (!token || typeof token !== "string") return false;
  const normalized = token.trim().toLowerCase();
  if (!normalized) return false;
  return !["undefined", "null", "nan"].includes(normalized);
}

async function readResponseBody(response) {
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

function resolveToken(request) {
  return (
    getBearerTokenFromAuthHeader(request.headers.get("authorization") || "") ||
    getBearerTokenFromCookieHeader(request.headers.get("cookie") || "")
  );
}

/**
 * GET /api/equipments
 * Auth-required proxy for ${API_BASE_URL}/equipments. Query params forwarded
 * after dropping null/undefined/empty and sentinel "all" values.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const cleanedParams = Object.entries(rawParams).filter(([key, value]) => {
      if (value === null || value === undefined || value === "") return false;
      if (typeof value === "string" && value.toLowerCase() === "all") return false;
      return true;
    });

    let url = `${API_BASE_URL}/equipments`;
    if (cleanedParams.length > 0) {
      const queryString = new URLSearchParams(cleanedParams).toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const token = resolveToken(request);
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

    const data = await readResponseBody(response);
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("GET /api/equipments proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to fetch equipments",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/equipments
 * Auth-required proxy for creating equipment.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const token = resolveToken(request);
    if (!isUsableToken(token)) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication token is required" },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/equipments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await readResponseBody(response);
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("POST /api/equipments proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to create equipment",
      },
      { status: 500 }
    );
  }
}
