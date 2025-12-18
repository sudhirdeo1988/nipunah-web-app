import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/**
 * POST /api/categories/[categoryId]/subcategories
 * Proxy endpoint for creating subcategories to avoid CORS issues
 * Automatically includes bearer token from cookies
 *
 * Expected Payload:
 * {
 *   "categoryId": number,
 *   "subcategoryName": "string"
 * }
 */
export async function POST(request, { params }) {
  console.log("\n🔷 =================================");
  console.log("🔷 CREATE SUBCATEGORY API ROUTE CALLED");
  console.log("🔷 =================================\n");

  try {
    // Get categoryId from URL params
    const { categoryId } = params;
    console.log("📂 Category ID:", categoryId);

    // Get request body
    const body = await request.json();
    console.log("📥 API ROUTE: Received request body:", {
      body,
      bodyKeys: Object.keys(body),
      hasCategoryId: !!body.categoryId,
      hasSubcategoryName: !!body.subcategoryName,
    });

    // Use API base URL from constants
    const url = `${API_BASE_URL}/categories/${categoryId}/subcategories`;

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
    console.log("Create Subcategory - Cookie header present:", !!cookieHeader);
    console.log("Create Subcategory - Token found:", !!token);

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
    console.error("Create Subcategory API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to create subcategory",
      },
      { status: 500 }
    );
  }
}
