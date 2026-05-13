/**
 * API Configuration Constants
 */

const DEFAULT_API_BASE_URL = "http://139.59.22.7:8080/api";

/**
 * External API Base URL (from `API_BASE_URL` in `.env`, see `.env.example`).
 * Server-side proxies under src/app/api/** use this value. No trailing slash.
 */
export const API_BASE_URL = (
  process.env.API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
).replace(/\/$/, "");
