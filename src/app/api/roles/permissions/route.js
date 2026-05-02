import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";
import {
  ROLE_KEYS,
  normalizeRolesPermissions,
  extractRolePermissions,
} from "@/utilities/rolePermissionsMapper";

const PERMISSIONS_ENDPOINT = `${API_BASE_URL}/roles/permissions`;
function getBearerTokenFromAuthorizationHeader(request) {
  const auth = request.headers.get("authorization");
  if (!auth || typeof auth !== "string") return null;
  const matched = auth.match(/^Bearer\s+(.+)$/i);
  return matched?.[1]?.trim() || null;
}

function getBearerTokenFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const trimmed = cookie.trim();
    const equalIndex = trimmed.indexOf("=");
    if (equalIndex > 0) {
      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();
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
  return cookies["access_token"] || cookies.access_token || null;
}

function resolveBearerToken(request) {
  return (
    getBearerTokenFromAuthorizationHeader(request) ||
    getBearerTokenFromCookieHeader(request.headers.get("cookie") || "")
  );
}

function getForwardHeaders(token) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchUpstream(method, payload, token) {
  const response = await fetch(PERMISSIONS_ENDPOINT, {
    method,
    headers: getForwardHeaders(token),
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
    const token = resolveBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication token is required" },
        { status: 401 }
      );
    }

    const upstream = await fetchUpstream("GET", null, token);
    const data = normalizeRolesPermissions(upstream);
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/roles/permissions failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load role permissions" },
      { status: error?.status || 500 }
    );
  }
}

/**
 * PUT /api/roles/permissions
 * Body: flat role-permissions map; forwarded as per-role PUT.
 */
export async function PUT(request) {
  try {
    const token = resolveBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication token is required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const normalized = normalizeRolesPermissions(body?.permissions || body);

    const headers = getForwardHeaders(token);
    const updates = await Promise.all(
      ROLE_KEYS.map(async (role) => {
        const res = await fetch(`${PERMISSIONS_ENDPOINT}/${role}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(normalized[role] || {}),
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const err = new Error(
            data?.error || data?.message || `Failed to update ${role} permissions`
          );
          err.status = res.status;
          throw err;
        }
        return [role, data];
      })
    );

    const merged = updates.reduce((acc, [role, payload]) => {
      acc[role] = extractRolePermissions(role, payload);
      return acc;
    }, {});

    return NextResponse.json({ success: true, data: merged });
  } catch (error) {
    console.error("PUT /api/roles/permissions failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save role permissions" },
      { status: error?.status || 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const token = resolveBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication token is required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const normalized = normalizeRolesPermissions(body?.permissions || body);

    const headers = getForwardHeaders(token);
    const updates = await Promise.all(
      ROLE_KEYS.map(async (role) => {
        const res = await fetch(`${PERMISSIONS_ENDPOINT}/${role}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(normalized[role] || {}),
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const err = new Error(
            data?.error || data?.message || `Failed to patch ${role} permissions`
          );
          err.status = res.status;
          throw err;
        }
        return [role, data];
      })
    );

    const merged = updates.reduce((acc, [role, payload]) => {
      acc[role] = extractRolePermissions(role, payload);
      return acc;
    }, {});

    return NextResponse.json({ success: true, data: merged });
  } catch (error) {
    console.error("PATCH /api/roles/permissions failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to patch role permissions" },
      { status: error?.status || 500 }
    );
  }
}
