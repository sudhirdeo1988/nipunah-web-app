import { NextResponse } from "next/server";

/**
 * POST /api/categories
 * Proxy endpoint for creating categories to avoid CORS issues
 * Automatically includes bearer token from cookies
 */
export async function POST(request) {
  console.log("\n🔷 =================================");
  console.log("🔷 CREATE CATEGORY API ROUTE CALLED");
  console.log("🔷 =================================\n");

  try {
    // Get request body
    const body = await request.json();

    // Get API base URL from environment variable
    // Always use the external API, never localhost
    const DEFAULT_API = "http://64.227.184.238/api/";

    let apiBaseUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      DEFAULT_API;

    // Prevent using localhost or any local addresses - use default external API instead
    if (
      apiBaseUrl.includes("localhost") ||
      apiBaseUrl.includes("127.0.0.1") ||
      apiBaseUrl.includes("0.0.0.0")
    ) {
      console.warn(
        `⚠️ Local address detected in API_BASE_URL (${apiBaseUrl}), forcing external API: ${DEFAULT_API}`
      );
      apiBaseUrl = DEFAULT_API;
    }

    // Build the full URL
    const baseUrl = apiBaseUrl.replace(/\/$/, ""); // Remove trailing slash
    const url = `${baseUrl}/category`;

    console.log("🌍 Environment Variables:");
    console.log("   - API_BASE_URL:", process.env.API_BASE_URL || "not set");
    console.log(
      "   - NEXT_PUBLIC_API_BASE_URL:",
      process.env.NEXT_PUBLIC_API_BASE_URL || "not set"
    );
    console.log("🎯 Final API URL:", url);
    console.log("📝 Request body:", JSON.stringify(body));

    // Get access token from request cookies
    const cookieHeader = request.headers.get("cookie") || "";
    let token = null;

    // Parse cookies from the cookie header
    if (cookieHeader) {
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
              acc[key] = value; // Use raw value if decoding fails
            }
          }
        }
        return acc;
      }, {});

      token = cookies["access_token"] || cookies.access_token || null;
    }

    // Log for debugging (remove in production)
    console.log("Create Category - Cookie header present:", !!cookieHeader);
    console.log("Create Category - Token found:", !!token);

    // Prepare headers
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log("🔐 Authorization header added with Bearer token");
      console.log("🪙 Token (first 20 chars):", token.substring(0, 20) + "...");
    } else {
      console.warn("❌ No token found in cookies");
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication token is required",
        },
        { status: 401 }
      );
    }

    // Make the request to the external API
    const response = await fetch(url, {
      method: "POST",
      headers,
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

    console.log("📡 External API response status:", response.status);
    console.log("✅ Success! Returning data to client\n");

    // Return the response with the same status
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    // Handle errors
    console.error("Create Category API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to create category",
      },
      { status: 500 }
    );
  }
}
