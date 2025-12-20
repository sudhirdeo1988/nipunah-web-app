/**
 * Axios Instance Configuration
 *
 * Centralized axios instance with default configuration
 * for making API requests
 *
 * IMPORTANT: CORS cannot be enabled from frontend!
 * - If external API allows CORS: Use API_BASE_URL directly
 * - If external API blocks CORS: Use Next.js proxy routes (/api/*)
 *
 * Current setup: Direct external API calls (will fail if CORS not allowed)
 * To use proxy: Change baseURL to window.location.origin and update endpoints
 */

import axios from "axios";
import { API_BASE_URL } from "@/constants/api";
import { getClientToken } from "./auth";

/**
 * Create axios instance with default configuration
 *
 * baseURL: Uses relative URL "/api" to leverage Netlify redirects
 * Netlify redirects /api/* to http://64.227.184.238/api/:splat
 * This avoids mixed content issues (HTTPS -> HTTP) and CORS problems
 *
 * For local development: Netlify redirects work via netlify.toml
 * For production: Netlify edge functions handle the redirect
 */
const axiosInstance = axios.create({
  // baseURL: API_BASE_URL,
  baseURL: "/api", // Use relative URL to trigger Netlify redirects
  timeout: 30000, // 30 seconds
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Request interceptor - Add auth token if available
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Add bearer token from cookies for external API calls
    if (typeof window !== "undefined") {
      const token = getClientToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Return data directly (axios wraps it in response.data)
    return response.data;
  },
  (error) => {
    // Handle axios errors
    if (error.response) {
      // Server responded with error status
      const { status, statusText, data } = error.response;

      let errorMessage =
        data?.message || data?.error || statusText || "An error occurred";

      // Provide user-friendly messages for common status codes
      if (status === 404) {
        errorMessage =
          "Resource not found. Please check the API configuration.";
      } else if (status === 401) {
        errorMessage = "Unauthorized. Please log in again.";
      } else if (status === 403) {
        errorMessage =
          "Forbidden. You don't have permission to perform this action.";
      } else if (status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      // Create a new error with the message
      const customError = new Error(errorMessage);
      customError.status = status;
      customError.statusText = statusText;
      customError.data = data;

      console.error(`❌ API Error (${status}):`, {
        status,
        statusText,
        errorMessage,
        data,
      });

      return Promise.reject(customError);
    } else if (error.request) {
      // Request was made but no response received
      console.error("❌ Network Error:", error.message);
      return Promise.reject(
        new Error(
          "Network error: Unable to connect to the server. Please check your internet connection."
        )
      );
    } else {
      // Something else happened
      console.error("❌ Request Error:", error.message);
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;
