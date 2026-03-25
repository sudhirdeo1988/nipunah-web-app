import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

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
 * POST /api/enquiries/:id/respond
 * Proxy to ${API_BASE_URL}/enquiries/:id/respond
 */
export async function POST(request, { params }) {
  const { id } = params || {};
  try {
    if (!id) {
      return NextResponse.json({ message: "Enquiry id is required." }, { status: 400 });
    }

    const body = await request.json();
    const responseText = body?.response ?? body?.responseText ?? body?.message;

    if (!responseText || !String(responseText).trim()) {
      return NextResponse.json(
        { message: "Response is required." },
        { status: 400 }
      );
    }

    const token = resolveBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication token is required" },
        { status: 401 }
      );
    }

    const url = `${API_BASE_URL}/enquiries/${id}/respond`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        response: String(responseText),
      }),
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
    console.error("POST /api/enquiries/:id/respond proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message || "Failed to send response" },
      { status: 500 }
    );
  }
}

