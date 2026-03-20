import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/**
 * POST /api/auth/forgot-password
 * Body: { email: string, username: string }
 * Proxy endpoint for forgot password API to avoid CORS issues.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const url = `${API_BASE_URL}/auth/forgot-password`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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
    console.error("Forgot password API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to process forgot password request",
      },
      { status: 500 }
    );
  }
}

