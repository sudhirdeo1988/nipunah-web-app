import { NextResponse } from "next/server";
import { ROLE_MANAGEMENT_MOCK } from "@/constants/roleManagementMock";

/**
 * GET /api/roles/permissions
 * Returns flat role-permissions map:
 * { admin: { key: boolean }, user: { ... }, expert: { ... }, company: { ... } }
 */
export async function GET() {
  try {
    const data = ROLE_MANAGEMENT_MOCK;
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/roles/permissions error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load permissions" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/roles/permissions
 * Body: flat role-permissions map
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Payload must be an object with role keys" },
        { status: 400 }
      );
    }
    // When you have a backend: POST/PUT to your API with the full array
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/roles/permissions error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save permissions" },
      { status: 500 }
    );
  }
}
