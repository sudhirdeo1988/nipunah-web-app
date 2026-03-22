"use client";

import Cookies from "js-cookie";

const TOKEN_KEY = "access_token";
const EXPIRY_KEY = "access_token_expiry";
const USER_TYPE_KEY = "user_type";
/** User id from login success — same TTL as token */
export const USER_ID_COOKIE_KEY = "user_id";

/** Cookie names to try if primary access_token read fails (path/domain quirks, different backends) */
const TOKEN_COOKIE_FALLBACK_NAMES = [
  "access_token",
  "token",
  "auth_token",
  "authToken",
  "jwt",
  "id_token",
];

/**
 * Parse document.cookie into a plain object (fallback when js-cookie misses a value).
 */
function parseDocumentCookieMap() {
  if (typeof document === "undefined") return {};
  const map = {};
  const raw = document.cookie || "";
  raw.split(";").forEach((part) => {
    const eq = part.indexOf("=");
    if (eq <= 0) return;
    const key = part.slice(0, eq).trim();
    try {
      map[key] = decodeURIComponent(part.slice(eq + 1).trim());
    } catch {
      map[key] = part.slice(eq + 1).trim();
    }
  });
  return map;
}

/**
 * Decode JWT payload (middle segment). Not encryption — JWT payload is base64url JSON.
 * Used to read `exp` when access_token_expiry cookie is missing.
 */
function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Returns true if JWT is expired, false if still valid, null if not a JWT or no exp claim.
 */
function isJwtExpiredByPayload(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return null;
  return Date.now() / 1000 >= payload.exp;
}

/**
 * Read access_token from js-cookie and from document.cookie (some server-set cookies
 * are visible in document.cookie but not picked up by js-cookie due to path/domain).
 */
function readAccessTokenFromAllSources() {
  const fromJs = Cookies.get(TOKEN_KEY);
  if (fromJs) return fromJs;
  const docMap = parseDocumentCookieMap();
  return docMap[TOKEN_KEY] || null;
}

/** Timestamps >= this are Unix ms (13 digits in 2025–2030s, e.g. 1774267874816); below are Unix seconds. */
const EXPIRY_MS_VS_SECONDS_THRESHOLD = 1e12; // 1000000000000

/**
 * Normalize access_token_expiry to milliseconds for comparison with Date.now().
 * - **13-digit ms** (e.g. 1774267874816) → use as-is.
 * - App setToken() stores ms (~13 digits).
 * - Some backends send **seconds** (~10 digits, e.g. 1735689600) → multiply by 1000.
 */
function parseExpiryCookieValueToMs(raw) {
  if (raw === undefined || raw === null || raw === "") return NaN;
  const n = parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n) || n <= 0) return NaN;
  if (n >= EXPIRY_MS_VS_SECONDS_THRESHOLD) {
    return n; // already milliseconds (13-digit style)
  }
  return n * 1000; // seconds → ms
}

function readExpiryFromAllSources() {
  const raw =
    Cookies.get(EXPIRY_KEY) ||
    parseDocumentCookieMap()[EXPIRY_KEY];
  return parseExpiryCookieValueToMs(raw);
}

/**
 * True if this token should be treated as usable for the client.
 * - Uses access_token_expiry when present
 * - Else uses JWT exp claim when present
 * - Else accepts opaque token (e.g. server only set access_token) — API will 401 if invalid
 */
function isAccessTokenStillValid(token) {
  if (!token) return false;

  const expiryMs = readExpiryFromAllSources();
  if (!Number.isNaN(expiryMs) && expiryMs > 0) {
    return Date.now() <= expiryMs;
  }

  const jwtExpired = isJwtExpiredByPayload(token);
  if (jwtExpired === false) return true;
  if (jwtExpired === true) return false;

  // Opaque token or JWT without exp — no expiry cookie: still expose token (common for server-only access_token cookie)
  return true;
}

/**
 * Fallback: read token from raw cookies + alternate names; validate via expiry cookie or JWT exp.
 */
export function getClientTokenFromCookiesFallback() {
  const docMap = parseDocumentCookieMap();
  const fromJs = TOKEN_COOKIE_FALLBACK_NAMES.map((name) => Cookies.get(name)).filter(Boolean);
  const fromDoc = TOKEN_COOKIE_FALLBACK_NAMES.map((name) => docMap[name]).filter(Boolean);

  const candidates = [...new Set([...fromJs, ...fromDoc])];
  for (const token of candidates) {
    if (!token || typeof token !== "string") continue;
    if (isAccessTokenStillValid(token)) {
      return token;
    }
  }

  return null;
}

/**
 * @param {string} token
 * @param {number} expiresIn seconds
 * @param {string|null} [userType]
 * @param {string|number|null} [userId] — from login success response
 */
export const setToken = (
  token,
  expiresIn = 86400,
  userType = null,
  userId = null
) => {
  const expiry = Date.now() + expiresIn * 1000;
  const cookieOpts = { expires: new Date(expiry) };
  Cookies.set(TOKEN_KEY, token, cookieOpts);
  Cookies.set(EXPIRY_KEY, expiry.toString(), cookieOpts);
  if (userType) {
    Cookies.set(USER_TYPE_KEY, userType, cookieOpts);
  }
  if (userId !== null && userId !== undefined && String(userId).trim() !== "") {
    Cookies.set(USER_ID_COOKIE_KEY, String(userId), cookieOpts);
  } else {
    Cookies.remove(USER_ID_COOKIE_KEY);
  }
};

/** Read user id set at login (fallback when localStorage has no id). */
export function getUserIdFromCookie() {
  const fromJs = Cookies.get(USER_ID_COOKIE_KEY);
  if (fromJs !== undefined && fromJs !== null && fromJs !== "") {
    return fromJs;
  }
  const docMap = parseDocumentCookieMap();
  const raw = docMap[USER_ID_COOKIE_KEY];
  if (raw !== undefined && raw !== null && raw !== "") {
    return raw;
  }
  return null;
}

export const clearToken = () => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(EXPIRY_KEY);
  Cookies.remove(USER_TYPE_KEY);
  Cookies.remove(USER_ID_COOKIE_KEY);
};

export const getUserType = () => {
  return Cookies.get(USER_TYPE_KEY);
};

/**
 * @deprecated Use useRole hook from Redux instead
 * These functions are kept for backward compatibility
 * but should be replaced with Redux-based role checking
 */
export const isAdmin = () => {
  const userType = getUserType();
  return userType === "admin" || userType === "Admin";
};

export const isCompany = () => {
  const userType = getUserType();
  return userType === "company" || userType === "Company";
};

export const isExpert = () => {
  const userType = getUserType();
  return userType === "expert" || userType === "Expert";
};

export const isUser = () => {
  const userType = getUserType();
  return userType === "user" || userType === "User";
};

export const getClientToken = () => {
  // Primary: access_token — do NOT require access_token_expiry (often only JWT cookie is set)
  const token = readAccessTokenFromAllSources();

  if (token && isAccessTokenStillValid(token)) {
    return token;
  }

  if (token && !isAccessTokenStillValid(token)) {
    clearToken();
    return null;
  }

  // Alternate cookie names + document.cookie scan
  const fallback = getClientTokenFromCookiesFallback();
  if (fallback) {
    return fallback;
  }

  return null;
};

export const userTypes = [
  {
    id: 1,
    label: "User",
    value: "user",
    icon: "",
  },
  {
    id: 2,
    label: "Expert",
    value: "expert",
    icon: "",
  },
  {
    id: 3,
    label: "Company",
    value: "company",
    icon: "",
  },
  {
    id: 4,
    label: "Admin",
    value: "admin",
    icon: "",
  },
];
