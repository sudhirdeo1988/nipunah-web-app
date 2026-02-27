import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/**
 * POST /api/experts/become-expert
 * Submit "Become an expert" form (work experience, roles, skills, education).
 * Replace the fetch URL below with your backend endpoint when ready.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate minimal structure
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Invalid payload" },
        { status: 400 }
      );
    }

    // Optional: forward to your backend (uncomment and set endpoint)
    // const url = `${API_BASE_URL}/experts/become-expert`;
    // const cookieHeader = request.headers.get("cookie") || "";
    // const res = await fetch(url, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Accept: "application/json",
    //     ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    //   },
    //   body: JSON.stringify(body),
    // });
    // const data = await res.json().catch(() => ({}));
    // return NextResponse.json(data, { status: res.status });

    return NextResponse.json({
      success: true,
      message: "Application received successfully.",
    });
  } catch (error) {
    console.error("Become expert API error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to submit" },
      { status: 500 }
    );
  }
}
