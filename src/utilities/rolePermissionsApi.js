"use client";

import { normalizeRolesPermissions } from "@/utilities/rolePermissionsMapper";

const ROLE_PERMISSIONS_ENDPOINT = "/api/roles/permissions";

let rolePermissionsCache = null;
let rolePermissionsInFlight = null;

export function clearRolePermissionsCache() {
  rolePermissionsCache = null;
  rolePermissionsInFlight = null;
}

export async function fetchRolePermissions({ forceRefresh = false } = {}) {
  if (!forceRefresh && rolePermissionsCache) {
    return rolePermissionsCache;
  }

  if (!forceRefresh && rolePermissionsInFlight) {
    return rolePermissionsInFlight;
  }

  rolePermissionsInFlight = fetch(ROLE_PERMISSIONS_ENDPOINT, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  })
    .then(async (res) => {
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(
          payload?.error || payload?.message || "Failed to load permissions"
        );
        err.status = res.status;
        err.data = payload;
        throw err;
      }
      const normalized = normalizeRolesPermissions(payload);
      rolePermissionsCache = normalized;
      return normalized;
    })
    .finally(() => {
      rolePermissionsInFlight = null;
    });

  return rolePermissionsInFlight;
}
