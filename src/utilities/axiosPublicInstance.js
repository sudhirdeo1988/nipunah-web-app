/**
 * Axios Public Instance Configuration
 *
 * Separate axios instance for public API endpoints that don't require authentication
 * This instance does NOT send credentials to avoid CORS issues with servers
 * that don't support Access-Control-Allow-Credentials: true
 *
 * Use this instance for:
 * - User registration
 * - Company registration
 * - Public endpoints that don't require auth
 */

import axios from "axios";
import { API_BASE_URL } from "@/constants/api";

/**
 * Create axios instance for public endpoints (no credentials)
 *
 * withCredentials: false - Prevents CORS issues with servers that don't support credentials
 */
const axiosPublicInstance = axios.create({
  baseURL: "/api",
  timeout: 30000, // 30 seconds
  withCredentials: false, // Don't send credentials for public endpoints
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Request interceptor - No auth token needed for public endpoints
 */
axiosPublicInstance.interceptors.request.use(
  (config) => {
    // Public endpoints don't need authentication
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
axiosPublicInstance.interceptors.response.use(
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
        errorMessage = "Unauthorized. Please check your credentials.";
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

export default axiosPublicInstance;
