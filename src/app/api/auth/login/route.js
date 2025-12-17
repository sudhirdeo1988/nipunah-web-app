import { NextResponse } from "next/server";

/**
 * POST /api/auth/login
 * Proxy endpoint for login API to avoid CORS issues
 */
export async function POST(request) {
  try {
    // Get the request body
    const body = await request.json();

    // Get API base URL from environment variable
    const apiBaseUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://64.227.184.238/api/";

    // Build the full URL
    const url = `${apiBaseUrl.replace(/\/$/, "")}/auth/login`;

    // Make the request to the external API
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    // Get response data
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

    // Return the response with the same status
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    // Handle errors
    console.error("Login API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to process login request",
      },
      { status: 500 }
    );
  }
}
