import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/**
 * PUT /api/jobs/{jobId}
 * Proxy endpoint for updating jobs to avoid CORS issues
 * Automatically includes bearer token from cookies
 */
export async function PUT(request, { params }) {
  console.log("\n🔷 =================================");
  console.log("🔷 UPDATE JOB API ROUTE CALLED");
  console.log("🔷 =================================\n");

  try {
    const { jobId } = params;
    console.log("✏️ Job ID to update:", jobId);

    // Get request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return NextResponse.json(
        {
          error: "Invalid request body",
          message: "Request body must be valid JSON",
          details: parseError.message,
        },
        { status: 400 }
      );
    }

    // Use API base URL from constants
    const url = `${API_BASE_URL}/jobs/${jobId}`;

    console.log("🎯 Final API URL:", url);
    console.log("📝 Request body:", JSON.stringify(body, null, 2));

    // Get access token from request cookies
    const cookieHeader = request.headers.get("cookie") || "";
    let token = null;

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
              acc[key] = value;
            }
          }
        }
        return acc;
      }, {});

      token = cookies["access_token"] || cookies.access_token || null;
    }

    console.log("Update Job - Cookie header present:", !!cookieHeader);
    console.log("Update Job - Token found:", !!token);

    // Prepare headers
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log("🔐 Authorization header added with Bearer token");
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
    console.log("🌐 Making PUT request to:", url);
    
    let response;
    try {
      response = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
      console.log("📥 Fetch response received, status:", response.status);
    } catch (fetchError) {
      console.error("❌ Fetch request failed:", fetchError);
      throw new Error(`Failed to connect to external API: ${fetchError.message}`);
    }

    // Get response data
    const contentType = response.headers.get("content-type");
    let data;

    try {
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
    } catch (parseError) {
      console.error("❌ Failed to parse response:", parseError);
      data = {
        error: "Failed to parse response",
        message: response.statusText || "Unknown error",
        status: response.status,
      };
    }

    console.log("📡 PROXY: External API response status:", response.status);
    console.log("📡 PROXY: External API response data:", JSON.stringify(data, null, 2));
    console.log("✅ PROXY: Successfully forwarded response to client\n");

    // Return the response with the same status
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("\n❌ =================================");
    console.error("❌ UPDATE JOB API PROXY ERROR");
    console.error("❌ =================================");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("❌ =================================\n");

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to update job",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/jobs/{jobId}
 * Proxy endpoint for deleting jobs to avoid CORS issues
 * Automatically includes bearer token from cookies
 */
export async function DELETE(request, { params }) {
  console.log("\n🔷 =================================");
  console.log("🔷 DELETE JOB API ROUTE CALLED");
  console.log("🔷 =================================\n");

  try {
    const { jobId } = params;
    console.log("🗑️ Job ID to delete:", jobId);

    // Use API base URL from constants
    const url = `${API_BASE_URL}/jobs/${jobId}`;

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
              acc[key] = value;
            }
          }
        }
        return acc;
      }, {});

      token = cookies["access_token"] || cookies.access_token || null;
    }

    console.log("Delete Job - Cookie header present:", !!cookieHeader);
    console.log("Delete Job - Token found:", !!token);

    // Prepare headers
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log("🔐 Authorization header added with Bearer token");
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
    console.log("🌐 Making DELETE request to:", url);
    
    let response;
    try {
      response = await fetch(url, {
        method: "DELETE",
        headers,
      });
      console.log("📥 Fetch response received, status:", response.status);
    } catch (fetchError) {
      console.error("❌ Fetch request failed:", fetchError);
      throw new Error(`Failed to connect to external API: ${fetchError.message}`);
    }

    // Get response data
    const contentType = response.headers.get("content-type");
    let data;

    try {
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
    } catch (parseError) {
      console.error("❌ Failed to parse response:", parseError);
      data = {
        error: "Failed to parse response",
        message: response.statusText || "Unknown error",
        status: response.status,
      };
    }

    console.log("📡 PROXY: External API response status:", response.status);
    console.log("📡 PROXY: External API response data:", JSON.stringify(data, null, 2));
    console.log("✅ PROXY: Successfully forwarded response to client\n");

    // Return the response with the same status
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("\n❌ =================================");
    console.error("❌ DELETE JOB API PROXY ERROR");
    console.error("❌ =================================");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("❌ =================================\n");

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to delete job",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
