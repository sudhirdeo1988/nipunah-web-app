import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

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

export async function PATCH(request, { params }) {
  const { id } = params || {};
  try {
    if (!id) {
      return NextResponse.json({ message: "Pricing plan id is required." }, { status: 400 });
    }

    const token = resolveBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication token is required" },
        { status: 401 }
      );
    }

    const payload = await request.json().catch(() => ({}));
    const response = await fetch(`${API_BASE_URL}/pricing/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload || {}),
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
    console.error("PATCH /api/pricing/:id proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message || "Failed to update pricing plan" },
      { status: 500 }
    );
  }
}
