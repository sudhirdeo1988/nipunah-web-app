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
  // Guard against accidental stringified invalid values from cookies/headers.
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

/**
 * GET /api/equipments/getAllEquipments
 *
 * Public proxy for the equipment listing.
 *
 * Auth: optional. If a bearer token is present (Authorization header or any of the
 * cookie keys in TOKEN_COOKIE_KEYS), it's forwarded. Anonymous public visitors are
 * allowed — the upstream API decides what to return without a token.
 *
 * Query params: forwarded as-is, with null/undefined/empty values filtered out, and
 * sentinel filter values like "all" stripped (those mean "no filter").
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    // Drop empty values AND sentinel "all" values (e.g. availableFor=all means "no filter")
    const cleanedParams = Object.entries(rawParams).filter(([key, value]) => {
      if (value === null || value === undefined || value === "") return false;
      if (typeof value === "string" && value.toLowerCase() === "all") return false;
      return true;
    });

    let url = `${API_BASE_URL}/equipments/getAllEquipments`;
    if (cleanedParams.length > 0) {
      const queryString = new URLSearchParams(cleanedParams).toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const token =
      getBearerTokenFromAuthHeader(request.headers.get("authorization") || "") ||
      getBearerTokenFromCookieHeader(request.headers.get("cookie") || "");

    const headers = {
      Accept: "application/json",
    };
    if (isUsableToken(token)) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await readResponseBody(response);

    if (!response.ok) {
      console.error(
        "GET /api/equipments/getAllEquipments upstream non-OK:",
        response.status,
        data
      );
    }

    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("GET /api/equipments/getAllEquipments proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to fetch equipments",
      },
      { status: 500 }
    );
  }
}
