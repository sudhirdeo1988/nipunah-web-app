import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/**
 * GET /api/pricing
 * Proxy endpoint for pricing plans.
 * Query params:
 * - currency (e.g. USD, INR)
 * - cycle (e.g. monthly, yearly)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    let url = `${API_BASE_URL}/pricing`;

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

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
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
    console.error("Pricing API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to fetch pricing",
      },
      { status: 500 }
    );
  }
}
