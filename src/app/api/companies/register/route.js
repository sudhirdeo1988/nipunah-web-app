import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/**
 * POST /api/companies/register
 * Proxy endpoint for company registration API to avoid CORS issues
 * Public endpoint - no authentication required
 *
 * Same pattern as /api/categories/getAllCategories and /api/experts/register:
 * Client calls this Next.js route; route forwards to external API.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const url = `${API_BASE_URL}/companies/register`;

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
    console.error("Companies register API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to register company",
      },
      { status: 500 }
    );
  }
}
