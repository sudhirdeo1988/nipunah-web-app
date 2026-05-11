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

// Header-first, cookies as fallback. Previous implementation overwrote the
// Authorization-header token with a (likely missing) cookie value in DELETE,
// which broke deletes for clients that only sent the bearer header.
function resolveToken(request) {
  return (
    getBearerTokenFromAuthHeader(request.headers.get("authorization") || "") ||
    getBearerTokenFromCookieHeader(request.headers.get("cookie") || "")
  );
}

function requireToken(request) {
  const token = resolveToken(request);
  if (!isUsableToken(token)) {
    return {
      token: null,
      error: NextResponse.json(
        { error: "Unauthorized", message: "Authentication token is required" },
        { status: 401 }
      ),
    };
  }
  return { token, error: null };
}

async function forwardJsonResponse(response) {
  const data = await readResponseBody(response);
  return NextResponse.json(data, {
    status: response.status,
    statusText: response.statusText,
  });
}

/**
 * GET /api/equipments/[equipmentId]
 */
export async function GET(request, { params }) {
  try {
    const { equipmentId } = params;
    const { token, error } = requireToken(request);
    if (error) return error;

    const response = await fetch(`${API_BASE_URL}/equipments/${equipmentId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    return forwardJsonResponse(response);
  } catch (error) {
    console.error("GET /api/equipments/[equipmentId] proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to fetch equipment",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/equipments/[equipmentId]
 */
export async function PUT(request, { params }) {
  try {
    const { equipmentId } = params;
    const body = await request.json();
    const { token, error } = requireToken(request);
    if (error) return error;

    const response = await fetch(`${API_BASE_URL}/equipments/${equipmentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return forwardJsonResponse(response);
  } catch (error) {
    console.error("PUT /api/equipments/[equipmentId] proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to update equipment",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/equipments/[equipmentId]
 */
export async function PATCH(request, { params }) {
  try {
    const { equipmentId } = params;
    const body = await request.json();
    const { token, error } = requireToken(request);
    if (error) return error;

    const response = await fetch(`${API_BASE_URL}/equipments/${equipmentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return forwardJsonResponse(response);
  } catch (error) {
    console.error("PATCH /api/equipments/[equipmentId] proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to update equipment",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/equipments/[equipmentId]
 */
export async function DELETE(request, { params }) {
  try {
    const { equipmentId } = params;
    const { token, error } = requireToken(request);
    if (error) return error;

    const response = await fetch(`${API_BASE_URL}/equipments/${equipmentId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    return forwardJsonResponse(response);
  } catch (error) {
    console.error("DELETE /api/equipments/[equipmentId] proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to delete equipment",
      },
      { status: 500 }
    );
  }
}
