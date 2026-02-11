import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/**
 * GET /api/jobs/getAllJobs
 * Proxy endpoint for fetching jobs list to avoid CORS issues
 * Automatically includes bearer token from cookies
 */
export async function GET(request) {
  console.log("\n🔷 =================================");
  console.log("🔷 GET ALL JOBS API ROUTE CALLED");
  console.log("🔷 =================================\n");

  try {
    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    let url = `${API_BASE_URL}/jobs`;

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

    console.log("🎯 Final API URL:", url);
    console.log("📋 Query params:", params);

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
    console.log("🌐 Making GET request to:", url);
    
    let response;
    try {
      response = await fetch(url, {
        method: "GET",
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
    console.log("✅ PROXY: Successfully forwarded response to client\n");

    // Return the response with the same status
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("\n❌ =================================");
    console.error("❌ GET ALL JOBS API PROXY ERROR");
    console.error("❌ =================================");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("❌ =================================\n");

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to fetch jobs",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
