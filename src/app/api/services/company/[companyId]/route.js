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

export async function GET(request, { params }) {
  try {
    const companyId = params?.companyId;
    if (!companyId) {
      return NextResponse.json(
        { error: "Bad request", message: "companyId is required" },
        { status: 400 }
      );
    }

    const token =
      getBearerTokenFromAuthHeader(request.headers.get("authorization") || "") ||
      getBearerTokenFromCookieHeader(request.headers.get("cookie") || "");

    if (!isUsableToken(token)) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication token is required" },
        { status: 401 }
      );
    }

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    let response = await fetch(`${API_BASE_URL}/services/company/${companyId}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    // Fallback for backends that expose company filter on /services?companyId=
    if (response.status === 404) {
      response = await fetch(`${API_BASE_URL}/services?companyId=${companyId}`, {
        method: "GET",
        headers,
        cache: "no-store",
      });
    }

    const data = await readResponseBody(response);
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("GET /api/services/company/:companyId proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to fetch company services",
      },
      { status: 500 }
    );
  }
}

