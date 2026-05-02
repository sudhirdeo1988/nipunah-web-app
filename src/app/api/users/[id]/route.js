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

function resolveBearerToken(request) {
  const tokenFromHeader = getBearerTokenFromAuthHeader(
    request.headers.get("authorization") || ""
  );
  if (tokenFromHeader) return tokenFromHeader;

  const cookieHeader = request.headers.get("cookie") || "";
  return getBearerTokenFromCookieHeader(cookieHeader);
}

function unauthorizedResponse() {
  return NextResponse.json(
    {
      error: "Unauthorized",
      message: "Authentication token is required",
    },
    { status: 401 }
  );
}

/**
 * GET /api/users/{id}
 * Proxy endpoint to fetch a user by id (auth required via cookie token)
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams || {};
    const url = `${API_BASE_URL}/users/${id}`;

    const token = resolveBearerToken(request);
    if (!token) return unauthorizedResponse();

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url, { method: "GET", headers });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || response.statusText };
      }
    }

    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("Get user by id proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to fetch user",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/{id}
 * Proxy endpoint to update a user by id (auth required via cookie token)
 */
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams || {};
    const url = `${API_BASE_URL}/users/${id}`;
    const body = await request.json();

    const token = resolveBearerToken(request);
    if (!token) return unauthorizedResponse();

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || response.statusText };
      }
    }

    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("Update user by id proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to update user",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/{id}
 * Proxy endpoint to delete a user (auth required via cookie token)
 */
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams || {};
    const url = `${API_BASE_URL}/users/${id}`;

    const token = resolveBearerToken(request);
    if (!token) return unauthorizedResponse();

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url, { method: "DELETE", headers });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text || response.statusText };
      }
    }

    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("Delete user proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to delete user",
      },
      { status: 500 }
    );
  }
}
