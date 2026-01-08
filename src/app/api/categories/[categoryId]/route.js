import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/**
 * PUT /api/categories/[categoryId]
 * Proxy endpoint for updating categories to avoid CORS issues
 * Automatically includes bearer token from cookies
 *
 * Expected Payload:
 * {
 *   "name": "string"
 * }
 */
export async function PUT(request, { params }) {
  console.log("\n🔷 =================================");
  console.log("🔷 UPDATE CATEGORY API ROUTE CALLED");
  console.log("🔷 =================================\n");

  try {
    // Get categoryId from URL params
    const { categoryId } = params;
    console.log("📂 Category ID:", categoryId);

    // Get request body
    const body = await request.json();
    console.log("📥 API ROUTE: Received request body:", body);

    // Use API base URL from constants
    const url = `${API_BASE_URL}/categories/${categoryId}`;

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

    if (!token) {
      console.error("❌ No access token found in cookies");
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Access token not found. Please log in again.",
        },
        { status: 401 }
      );
    }

    console.log("🔑 Token found:", token ? "Yes" : "No");

    // Make the request to the external API
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
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

    console.log("✅ API Response Status:", response.status);
    console.log("✅ API Response Data:", data);

    // Return the response with the same status
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    // Handle errors
    console.error("❌ Update Category API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to process update category request",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[categoryId]
 * Proxy endpoint for deleting categories to avoid CORS issues
 * Automatically includes bearer token from cookies
 */
export async function DELETE(request, { params }) {
  console.log("\n🔷 =================================");
  console.log("🔷 DELETE CATEGORY API ROUTE CALLED");
  console.log("🔷 =================================\n");

  try {
    // Get categoryId from URL params
    const { categoryId } = params;
    console.log("📂 Category ID:", categoryId);

    // Use API base URL from constants
    const url = `${API_BASE_URL}/categories/${categoryId}`;

    console.log("🎯 Final API URL:", url);

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

    if (!token) {
      console.error("❌ No access token found in cookies");
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Access token not found. Please log in again.",
        },
        { status: 401 }
      );
    }

    console.log("🔑 Token found:", token ? "Yes" : "No");

    // Make the request to the external API
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
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

    console.log("✅ API Response Status:", response.status);
    console.log("✅ API Response Data:", data);

    // Return the response with the same status
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    // Handle errors
    console.error("❌ Delete Category API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to process delete category request",
      },
      { status: 500 }
    );
  }
}

