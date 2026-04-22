import { NextResponse } from "next/server";
import { ROLE_MANAGEMENT_MOCK } from "@/constants/roleManagementMock";
import { API_BASE_URL } from "@/constants/api";
import { promises as fs } from "fs";
import path from "path";

let ROLE_PERMISSIONS_STATE = JSON.parse(JSON.stringify(ROLE_MANAGEMENT_MOCK));
const PERMISSIONS_ENDPOINT = `${API_BASE_URL}/roles/permissions`;
const ROLE_KEYS = Object.keys(ROLE_MANAGEMENT_MOCK);
const ROLE_PERMISSIONS_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "constants",
  "rolePermissions.data.json"
);

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

function sanitizeNavOrder(order) {
  const defaultOrder = [
    "nav_dashboard",
    "nav_categories",
    "nav_experts",
    "nav_users",
    "nav_companies",
    "nav_services",
    "nav_jobs",
    "nav_pricing",
    "nav_enquiries",
    "nav_equipments",
    "nav_role_management",
  ];
  if (!Array.isArray(order)) return defaultOrder;
  const valid = order.filter((key) => defaultOrder.includes(key));
  const missing = defaultOrder.filter((key) => !valid.includes(key));
  return [...valid, ...missing];
}

async function readFileState() {
  try {
    const raw = await fs.readFile(ROLE_PERMISSIONS_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const permissions = sanitizePayload(parsed?.permissions || parsed);
    if (!permissions) return null;
    return {
      permissions,
      navOrder: sanitizeNavOrder(parsed?.navOrder),
    };
  } catch {
    return null;
  }
}

async function writeFileState(permissions, navOrder) {
  const payload = {
    permissions,
    navOrder: sanitizeNavOrder(navOrder),
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(
    ROLE_PERMISSIONS_FILE_PATH,
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8"
  );
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
    const fromFile = await readFileState();
    if (fromFile?.permissions) {
      ROLE_PERMISSIONS_STATE = fromFile.permissions;
      return NextResponse.json({
        ...fromFile.permissions,
        __nav_order__: fromFile.navOrder,
      });
    }

    const upstream = await fetchUpstream("GET", null, request);
    const data = sanitizePayload(upstream);
    if (!data) throw new Error("Invalid permissions payload from upstream");
    ROLE_PERMISSIONS_STATE = data;
    await writeFileState(data, []);
    return NextResponse.json({ ...data, __nav_order__: sanitizeNavOrder([]) });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        ...ROLE_PERMISSIONS_STATE,
        __nav_order__: sanitizeNavOrder([]),
      });
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
  let navOrderFromRequest = [];
  try {
    const body = await request.json();
    normalizedFromRequest = sanitizePayload(body?.permissions || body);
    navOrderFromRequest = sanitizeNavOrder(body?.__nav_order__ || body?.navOrder || []);
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
    await writeFileState(saved, navOrderFromRequest);
    return NextResponse.json({
      success: true,
      data: {
        ...saved,
        __nav_order__: navOrderFromRequest,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      if (!normalizedFromRequest) {
        return NextResponse.json(
          { error: "Payload must be an object with role keys" },
          { status: 400 }
        );
      }
      ROLE_PERMISSIONS_STATE = normalizedFromRequest;
      await writeFileState(ROLE_PERMISSIONS_STATE, navOrderFromRequest);
      return NextResponse.json({
        success: true,
        data: {
          ...ROLE_PERMISSIONS_STATE,
          __nav_order__: navOrderFromRequest,
        },
      });
    }
    console.error("PUT /api/roles/permissions error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save permissions" },
      { status: 500 }
    );
  }
}
