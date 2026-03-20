import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/**
 * POST /api/auth/reset-password
 * Body: { token: string, newPassword: string }
 * Proxy endpoint for password reset API to avoid CORS issues.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const url = `${API_BASE_URL}/auth/reset-password`;

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
    console.error("Reset password API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to reset password",
      },
      { status: 500 }
    );
  }
}

