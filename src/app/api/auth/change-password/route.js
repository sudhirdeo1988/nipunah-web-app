import { NextResponse } from "next/server";

/**
 * POST /api/auth/change-password
 * Body: { currentPassword: string, newPassword: string }
 * Replace this implementation with your backend endpoint (e.g. call API_BASE_URL/auth/change-password).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body ?? {};

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current password and new password are required." },
        { status: 400 }
      );
    }

    // TODO: Replace with your API call, e.g.:
    // const url = `${API_BASE_URL}/auth/change-password`;
    // const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    // return NextResponse.json(await response.json(), { status: response.status });

    return NextResponse.json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to change password." },
      { status: 500 }
    );
  }
}
