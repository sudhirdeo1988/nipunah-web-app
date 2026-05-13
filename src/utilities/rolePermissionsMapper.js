import { ROLE_MANAGEMENT_MOCK } from "@/constants/roleManagementMock";

export const ROLE_KEYS = Object.keys(ROLE_MANAGEMENT_MOCK);

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** True when `obj` looks like `{ admin: { … }, user: { … }, … }`, not arbitrary `data` blobs. */
function isRolesPermissionsMap(obj) {
  if (!isObject(obj)) return false;
  return ROLE_KEYS.some((roleKey) => isObject(obj[roleKey]));
}

export function sanitizeRolePermissions(roleKey, payload) {
  const base = ROLE_MANAGEMENT_MOCK[roleKey] || {};
  const source = isObject(payload) ? payload : {};
  return Object.keys(base).reduce((acc, key) => {
    acc[key] = source[key] === undefined ? Boolean(base[key]) : Boolean(source[key]);
    return acc;
  }, {});
}

function pickCandidate(payload, selectors = []) {
  for (const selector of selectors) {
    const value = selector(payload);
    if (isObject(value)) return value;
  }
  return null;
}

function pickRolesPermissionsMap(payload) {
  const selectors = [
    (x) => x?.data?.permissions,
    (x) => x?.permissions,
    (x) => x?.data?.roles,
    (x) => x?.roles,
    (x) => x?.data,
    (x) => x,
  ];
  for (const selector of selectors) {
    const value = selector(payload);
    if (isRolesPermissionsMap(value)) return value;
  }
  return null;
}

export function normalizeRolesPermissions(payload) {
  const candidate = pickRolesPermissionsMap(payload);

  return ROLE_KEYS.reduce((acc, roleKey) => {
    const rolePayload = isObject(candidate?.[roleKey]) ? candidate[roleKey] : null;
    acc[roleKey] = sanitizeRolePermissions(roleKey, rolePayload);
    return acc;
  }, {});
}

export function extractRolePermissions(roleKey, payload) {
  const candidate = pickCandidate(payload, [
    (x) => x?.data?.permissions?.[roleKey],
    (x) => x?.permissions?.[roleKey],
    (x) => x?.data?.roles?.[roleKey],
    (x) => x?.roles?.[roleKey],
    (x) => x?.data?.[roleKey],
    (x) => x?.[roleKey],
    (x) => x?.data?.permissions,
    (x) => x?.permissions,
    (x) => x?.data,
    (x) => x,
  ]);
  return sanitizeRolePermissions(roleKey, candidate);
}
