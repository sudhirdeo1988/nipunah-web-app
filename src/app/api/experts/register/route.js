import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/**
 * POST /api/experts/register
 * Proxy endpoint for expert registration API to avoid CORS issues
 * Public endpoint - no authentication required
 */
export async function POST(request) {
  console.log("\n🔷 =================================");
  console.log("🔷 EXPERT REGISTRATION API ROUTE CALLED");
  console.log("🔷 =================================\n");

  try {
    // Get the request body
    const body = await request.json();

    // Use API base URL from constants
    const url = `${API_BASE_URL}/experts/register`;

    console.log("🎯 Final API URL:", url);
    console.log("📝 Request body:", JSON.stringify(body, null, 2));

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

    console.log("📡 External API response status:", response.status);
    console.log("✅ Success! Returning data to client\n");

    // Return the response with the same status
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    // Handle errors
    console.error("Expert Registration API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to register expert",
      },
      { status: 500 }
    );
  }
}

