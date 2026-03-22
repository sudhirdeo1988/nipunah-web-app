"use client";
import { getRolePermissionObject, normalizeRoleKey } from "@/constants/roleManagementMock";
import { clearToken, getUserIdFromCookie } from "./auth";

const STORAGE_KEY = "nipunah_user_session";

export function sanitizeAuthResponse(raw) {
  if (!raw || typeof raw !== "object") return null;
  const { status, token, access_token, ...rest } = raw;
  return rest;
}

export function saveUserSession(userObj) {
  if (typeof window === "undefined") return;
  try {
    const safe =
      userObj && typeof userObj === "object"
        ? (() => {
            const { token, access_token, status, ...rest } = userObj;
            return rest;
          })()
        : userObj ?? null;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
}

export function loadUserSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearUserSession() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function clearAllClientStorage() {
  if (typeof window === "undefined") return;

  try {
    clearToken(); // clears known auth cookies
  } catch {
    // ignore
  }

  try {
    window.localStorage.clear();
  } catch {
    // ignore
  }

  try {
    window.sessionStorage.clear();
  } catch {
    // ignore
  }

  // Best-effort clear all cookies (including non-auth app cookies)
  try {
    const cookies = document.cookie ? document.cookie.split(";") : [];
    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      if (!name) return;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  } catch {
    // ignore
  }
}

export function applyRolePermissionsToUser(userObj) {
  const base = userObj && typeof userObj === "object" ? userObj : {};
  const role = normalizeRoleKey(
    base?.role || base?.type || base?.userType || base?.user_type
  );
  const rolePermissions = getRolePermissionObject(role) || {};
  return {
    ...base,
    ...rolePermissions,
  };
}

export function getRoleFromStoredUser(userObj) {
  const role =
    userObj?.role ||
    userObj?.type ||
    userObj?.userType ||
    userObj?.user_type ||
    userObj?.role_name ||
    userObj?.data?.role ||
    userObj?.data?.type ||
    userObj?.user?.role ||
    userObj?.user?.type;
  return role ? String(role).toLowerCase() : null;
}

/**
 * GET /api/me — bootstrap id/role when localStorage session is incomplete (e.g. only token was persisted).
 */
export async function fetchCurrentUserMe() {
  const res = await fetch("/api/me", { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || "Failed to fetch current user";
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    if (res.status === 401) err.isAuthError = true;
    throw err;
  }
  let result =
    data?.data && typeof data.data === "object" ? data.data : data;
  if (result?.user && typeof result.user === "object") {
    result = result.user;
  }
  if (result && typeof result === "object") {
    const { token, access_token, status, ...rest } = result;
    return rest;
  }
  return result;
}

export function getIdFromStoredUser(userObj) {
  let id = null;
  if (userObj && typeof userObj === "object") {
    id =
      userObj.id ??
      userObj.user_id ??
      userObj.userId ??
      userObj.user?.id ??
      userObj.user?.user_id ??
      userObj.data?.id ??
      userObj.data?.user_id ??
      userObj.companyId ??
      userObj.expertId ??
      null;
  }
  if (id !== null && id !== undefined && id !== "") {
    return id;
  }
  return getUserIdFromCookie();
}

/**
 * When Redux/session user has no canonical `id` (null/undefined/"") but `user_id` cookie
 * exists (set at login), merge `id` onto the object so Redux + localStorage stay in sync.
 */
export function applyUserIdFromCookieIfMissing(userObj) {
  if (!userObj || typeof userObj !== "object") return userObj;
  const resolved = getIdFromStoredUser(userObj);
  if (resolved == null || resolved === "") return userObj;
  if (userObj.id != null && userObj.id !== "") return userObj;
  return { ...userObj, id: resolved };
}

/** Use for GET/PUT by id when caller did not pass an id — falls back to `user_id` cookie */
function resolveUserIdForApiCall(id) {
  if (id != null && id !== "") return id;
  return getUserIdFromCookie();
}

export async function fetchUserDetailsByRole({ role, id }) {
  const resolvedId = resolveUserIdForApiCall(id);
  if (!role || resolvedId == null || resolvedId === "") return null;
  const cleanRole = String(role).toLowerCase();
  const endpoint =
    cleanRole === "company"
      ? `/api/companies/${resolvedId}`
      : cleanRole === "expert"
      ? `/api/experts/${resolvedId}`
      : `/api/users/${resolvedId}`;

  const res = await fetch(endpoint, { credentials: "include" });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.message || data?.error || `Failed to fetch ${cleanRole} details.`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    if (res.status === 401) err.isAuthError = true;
    throw err;
  }

  // Some APIs return { data: {...} }. Prefer the inner object when present.
  let result =
    data?.data && typeof data.data === "object" ? data.data : data;

  // Some backends wrap inside role keys: { company: {...} }, { expert: {...} }, { user: {...} }
  if (result && typeof result === "object") {
    const roleKey =
      cleanRole === "company"
        ? "company"
        : cleanRole === "expert"
        ? "expert"
        : "user";
    if (result?.[roleKey] && typeof result[roleKey] === "object") {
      result = result[roleKey];
    }
  }

  // Ensure we never persist token-like keys from user details responses
  if (result && typeof result === "object") {
    // eslint-disable-next-line no-unused-vars
    const { token, access_token, status, ...rest } = result;
    return rest;
  }

  return result;
}

export async function updateUserDetailsByRole({ role, id, payload }) {
  const resolvedId = resolveUserIdForApiCall(id);
  if (!role || resolvedId == null || resolvedId === "") {
    throw new Error("Role and id are required for profile update.");
  }
  const cleanRole = String(role).toLowerCase();
  const endpoint =
    cleanRole === "company"
      ? `/api/companies/${resolvedId}`
      : cleanRole === "expert"
      ? `/api/experts/${resolvedId}`
      : `/api/users/${resolvedId}`;

  const res = await fetch(endpoint, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload || {}),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data?.message || data?.error || `Failed to update ${cleanRole} profile.`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

