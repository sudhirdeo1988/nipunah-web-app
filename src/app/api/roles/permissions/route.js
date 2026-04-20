import { NextResponse } from "next/server";
import { ROLE_MANAGEMENT_MOCK } from "@/constants/roleManagementMock";
import { API_BASE_URL } from "@/constants/api";

let ROLE_PERMISSIONS_STATE = JSON.parse(JSON.stringify(ROLE_MANAGEMENT_MOCK));
const PERMISSIONS_ENDPOINT = `${API_BASE_URL}/roles/permissions`;
const ROLE_KEYS = Object.keys(ROLE_MANAGEMENT_MOCK);

function sanitizePayload(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const normalized = {};
  ROLE_KEYS.forEach((roleKey) => {
    const source =
      input[roleKey] && typeof input[roleKey] === "object" && !Array.isArray(input[roleKey])
        ? input[roleKey]
        : {};
    const base = ROLE_MANAGEMENT_MOCK[roleKey] || {};
    normalized[roleKey] = Object.keys(base).reduce((acc, key) => {
      acc[key] = source[key] === undefined ? Boolean(base[key]) : Boolean(source[key]);
      return acc;
    }, {});
  });
  return normalized;
}

async function fetchUpstream(method, payload, request) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const authHeader = request?.headers?.get("authorization");
  const cookieHeader = request?.headers?.get("cookie");
  if (authHeader) headers.Authorization = authHeader;
  if (cookieHeader) headers.Cookie = cookieHeader;

  const response = await fetch(PERMISSIONS_ENDPOINT, {
    method,
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data?.error || data?.message || "Upstream request failed");
    err.status = response.status;
    throw err;
  }
  return data;
}

/**
 * GET /api/roles/permissions
 * Returns flat role-permissions map:
 * { admin: { key: boolean }, user: { ... }, expert: { ... }, company: { ... } }
 */
export async function GET(request) {
  try {
    const upstream = await fetchUpstream("GET", null, request);
    const data = sanitizePayload(upstream);
    if (!data) throw new Error("Invalid permissions payload from upstream");
    ROLE_PERMISSIONS_STATE = data;
    return NextResponse.json(data);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(ROLE_PERMISSIONS_STATE);
    }
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
  let normalizedFromRequest = null;
  try {
    const body = await request.json();
    normalizedFromRequest = sanitizePayload(body);
    if (!normalizedFromRequest) {
      return NextResponse.json(
        { error: "Payload must be an object with role keys" },
        { status: 400 }
      );
    }
    const upstream = await fetchUpstream("PUT", normalizedFromRequest, request);
    const saved = sanitizePayload(
      upstream?.data?.permissions || upstream?.data || upstream || normalizedFromRequest
    );
    if (!saved) throw new Error("Invalid permissions save response from upstream");
    ROLE_PERMISSIONS_STATE = saved;
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      if (!normalizedFromRequest) {
        return NextResponse.json(
          { error: "Payload must be an object with role keys" },
          { status: 400 }
        );
      }
      ROLE_PERMISSIONS_STATE = normalizedFromRequest;
      return NextResponse.json({ success: true, data: ROLE_PERMISSIONS_STATE });
    }
    console.error("PUT /api/roles/permissions error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save permissions" },
      { status: 500 }
    );
  }
}
