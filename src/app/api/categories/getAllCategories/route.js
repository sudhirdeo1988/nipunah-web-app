import { NextResponse } from "next/server";

/**
 * GET /api/categories/getAllCategories
 * Proxy endpoint for categories API to avoid CORS issues
 * Automatically includes bearer token from cookies
 */
export async function GET(request) {
  try {
    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Get API base URL from environment variable
    // In Next.js API routes, use NEXT_PUBLIC_ prefix for client-accessible vars
    // But for server-side only, we can use API_BASE_URL
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://64.227.184.238/api/";

    // Ensure we have a valid base URL (not localhost)
    if (!apiBaseUrl || apiBaseUrl.includes("localhost")) {
      console.error("Invalid API base URL:", apiBaseUrl);
      throw new Error("API base URL is not configured correctly");
    }

    // Build the full URL with query parameters
    const baseUrl = apiBaseUrl.replace(/\/$/, ""); // Remove trailing slash
    let url = `${baseUrl}/categories/getAllCategories`;

    // Add query parameters if they exist
    if (Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(
          ([_, value]) => value !== null && value !== undefined && value !== ""
        )
      ).toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Get access token from request cookies
    // Read cookies from the Cookie header
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
    console.log("API URL:", url);
    console.log("Cookie header present:", !!cookieHeader);
    console.log("Token found:", !!token);
    if (cookieHeader) {
      console.log(
        "All cookies:",
        cookieHeader.split(";").map((c) => c.trim().split("=")[0])
      );
    }

    // Prepare headers
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log("Authorization header added");
    } else {
      console.warn("No token found in cookies");
    }

    // Make the request to the external API
    const response = await fetch(url, {
      method: "GET",
      headers,
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
    console.error("Categories API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}

