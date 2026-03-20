import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

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

/**
 * GET /api/companies/{id}
 * Proxy endpoint to fetch a company by id (auth required via cookie token)
 */
export async function GET(request, { params }) {
  try {
    const { id } = params || {};
    const url = `${API_BASE_URL}/companies/${id}`;

    const cookieHeader = request.headers.get("cookie") || "";
    const token = getBearerTokenFromCookieHeader(cookieHeader);

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

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
    console.error("Get company by id proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to fetch company",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/companies/{id}
 * Proxy endpoint to update a company by id (auth required via cookie token)
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params || {};
    const url = `${API_BASE_URL}/companies/${id}`;
    const body = await request.json();

    const cookieHeader = request.headers.get("cookie") || "";
    const token = getBearerTokenFromCookieHeader(cookieHeader);

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

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
    console.error("Update company by id proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to update company",
      },
      { status: 500 }
    );
  }
}

