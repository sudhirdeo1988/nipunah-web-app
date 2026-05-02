import { NextResponse } from "next/server";
import { ROLE_MANAGEMENT_MOCK } from "@/constants/roleManagementMock";
import { API_BASE_URL } from "@/constants/api";
import {
  extractRolePermissions,
  sanitizeRolePermissions
} from "@/utilities/rolePermissionsMapper";

const ROLE_KEYS = Object.keys(ROLE_MANAGEMENT_MOCK);

function normalizeRoleParam(roleParam) {
  const key = String(roleParam || "").toLowerCase();
  return ROLE_KEYS.includes(key) ? key : null;
}

function sanitizeRolePayload(role, payload) {
  return sanitizeRolePermissions(role, payload);
}

function getForwardHeaders(request) {
  const token = resolveBearerToken(request);
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

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

async function updateRolePermissions(request, params, method) {
  try {
    const token = resolveBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication token is required" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const role = normalizeRoleParam(resolvedParams?.role);
    if (!role) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const incoming = body?.permissions || body;
    const hasRoleMapPayload =
      incoming &&
      typeof incoming === "object" &&
      !Array.isArray(incoming) &&
      ROLE_KEYS.some(
        (roleKey) =>
          incoming[roleKey] &&
          typeof incoming[roleKey] === "object" &&
          !Array.isArray(incoming[roleKey])
      );
    const outgoingPayload = hasRoleMapPayload
      ? incoming
      : extractRolePermissions(role, incoming);
    const endpoint = `${API_BASE_URL}/roles/permissions/${role}`;
    const response = await fetch(endpoint, {
      method,
      headers: getForwardHeaders(request),
      body: JSON.stringify(outgoingPayload),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || data?.message || `Failed to ${method} role permissions` },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: extractRolePermissions(role, data),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || `Failed to update role permissions` },
      { status: error?.status || 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const token = resolveBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication token is required" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const role = normalizeRoleParam(resolvedParams?.role);
    if (!role) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const endpoint = `${API_BASE_URL}/roles/permissions/${role}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: getForwardHeaders(request),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || data?.message || "Failed to load role permissions" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: extractRolePermissions(role, data),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Failed to load role permissions" },
      { status: error?.status || 500 }
    );
  }
}

export async function PUT(request, { params }) {
  return updateRolePermissions(request, params, "PUT");
}

export async function PATCH(request, { params }) {
  return updateRolePermissions(request, params, "PATCH");
}
