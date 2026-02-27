import { NextResponse } from "next/server";
import { ROLE_MANAGEMENT_MOCK } from "@/constants/roleManagementMock";

/**
 * GET /api/roles/permissions
 * Returns array of all roles with their permissions: [{ role: { key, label }, modules }, ...]
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
 * Body: [{ role: { key, label }, modules }, ...] (array of all roles)
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const list = Array.isArray(body) ? body : body?.data;
    if (!list?.length) {
      return NextResponse.json(
        { error: "Payload must be an array of role configs" },
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
