/**
 * API Utility - Centralized API service for making HTTP requests
 *
 * This utility provides a consistent interface for all API calls in the application.
 * It handles authentication, error handling, and request/response transformation.
 *
 * Features:
 * - Automatic Bearer token injection for protected routes
 * - 401 error handling with automatic token cleanup
 * - Support for passing token directly
 * - Works in both client and server components
 */

import { getClientToken, clearToken } from "./auth";

/**
 * Get the API base URL from environment variables
 * Falls back to a default if not set
 */
const getApiBaseUrl = () => {
  const DEFAULT_API = "http://64.227.184.238/api/";

  if (typeof window !== "undefined") {
    // Client-side: use NEXT_PUBLIC_ prefixed env variable
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API;

    // Prevent using localhost for external API calls
    if (apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1")) {
      console.warn(
        `⚠️ Localhost detected in NEXT_PUBLIC_API_BASE_URL (${apiUrl}), using default: ${DEFAULT_API}`
      );
      return DEFAULT_API;
    }

    return apiUrl;
  }

  // Server-side: use regular env variable
  const apiUrl =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API;

  // Prevent using localhost for external API calls
  if (apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1")) {
    console.warn(
      `⚠️ Localhost detected in API_BASE_URL (${apiUrl}), using default: ${DEFAULT_API}`
    );
    return DEFAULT_API;
  }

  return apiUrl;
};

/**
 * Build full URL from endpoint
 * @param {string} endpoint - API endpoint (e.g., '/users', 'users', '/api/users')
 * @returns {string} Full URL
 */
const buildUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl().replace(/\/$/, ""); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Get default headers for API requests
 * @param {Object} options - Request options
 * @param {boolean} options.includeAuth - Whether to include auth token (default: true)
 * @param {string} options.token - Token to use directly (overrides cookie token)
 * @param {Object} options.customHeaders - Custom headers to include
 * @returns {Object} Headers object
 */
const getHeaders = ({
  includeAuth = true,
  token: providedToken = null,
  customHeaders = {},
} = {}) => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...customHeaders,
  };

  // Add authorization token if available and requested
  if (includeAuth) {
    // Use provided token first, then fall back to cookie token (client-side only)
    let token = providedToken;
    if (!token && typeof window !== "undefined") {
      token = getClientToken();
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Handle API response
 * @param {Response} response - Fetch response object
 * @param {Function} onAuthError - Callback for authentication errors (401)
 * @returns {Promise<Object>} Parsed response data
 */
const handleResponse = async (response, onAuthError = null) => {
  // Handle empty responses (204 No Content, etc.)
  if (response.status === 204 || response.statusText === "No Content") {
    return null;
  }

  // Try to parse JSON, fallback to text if not JSON
  const contentType = response.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text || response.statusText };
    }
  }

  // Handle non-2xx responses
  if (!response.ok) {
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear token from cookies if client-side
      if (typeof window !== "undefined") {
        clearToken();
      }

      // Call custom auth error handler if provided
      if (onAuthError && typeof onAuthError === "function") {
        onAuthError(response, data);
      }
    }

    const error = new Error(
      data.message ||
        data.error ||
        `HTTP ${response.status}: ${response.statusText}`
    );
    error.status = response.status;
    error.statusText = response.statusText;
    error.data = data;
    error.isAuthError = response.status === 401;
    throw error;
  }

  return data;
};

/**
 * Handle API errors
 * @param {Error} error - Error object
 * @throws {Error} Formatted error
 */
const handleError = (error) => {
  // Network errors
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    throw new Error(
      "Network error: Unable to connect to the server. Please check your internet connection."
    );
  }

  // Already formatted errors from handleResponse
  if (error.status) {
    throw error;
  }

  // Unknown errors
  throw new Error(
    error.message || "An unexpected error occurred. Please try again."
  );
};

/**
 * Make API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param {Object} options.body - Request body (will be JSON stringified)
 * @param {Object} options.params - Query parameters (will be URL encoded)
 * @param {boolean} options.includeAuth - Whether to include auth token (default: true)
 * @param {string} options.token - Token to use directly (overrides cookie token)
 * @param {Object} options.headers - Custom headers
 * @param {Function} options.onAuthError - Callback for 401 authentication errors
 * @returns {Promise<Object>} Response data
 */
const apiRequest = async (endpoint, options = {}) => {
  const {
    method = "GET",
    body = null,
    params = null,
    includeAuth = true,
    token = null,
    headers: customHeaders = {},
    onAuthError = null,
  } = options;

  try {
    // Build URL with query parameters
    let url = buildUrl(endpoint);

    // Debug: Log the URL being called (remove in production)
    if (typeof window !== "undefined") {
      console.log(`🌐 API Call: ${method} ${url}`);
    }
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        // Only add parameter if it has a meaningful value
        // Exclude: null, undefined, empty strings, and whitespace-only strings
        if (
          value !== null &&
          value !== undefined &&
          value !== "" &&
          String(value).trim() !== ""
        ) {
          searchParams.append(key, String(value));
        }
      });
      // Only add query string if there are actual parameters
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Prepare request options
    const requestOptions = {
      method: method.toUpperCase(),
      headers: getHeaders({ includeAuth, token, customHeaders }),
    };

    // Add body for POST, PUT, PATCH requests
    if (body && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
      requestOptions.body = JSON.stringify(body);
    }

    // Make the request
    const response = await fetch(url, requestOptions);
    return await handleResponse(response, onAuthError);
  } catch (error) {
    handleError(error);
    throw error; // Re-throw after handling
  }
};

/**
 * API Service - Main export with convenience methods
 */
const api = {
  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @param {Object} options.params - Query parameters
   * @param {boolean} options.includeAuth - Include auth token (default: true)
   * @param {string} options.token - Token to use directly (overrides cookie token)
   * @param {Object} options.headers - Custom headers
   * @param {Function} options.onAuthError - Callback for 401 errors
   * @returns {Promise<Object>} Response data
   */
  get: (endpoint, options = {}) => {
    return apiRequest(endpoint, { ...options, method: "GET" });
  },

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @param {Object} options.body - Request body
   * @param {Object} options.params - Query parameters
   * @param {boolean} options.includeAuth - Include auth token (default: true)
   * @param {string} options.token - Token to use directly (overrides cookie token)
   * @param {Object} options.headers - Custom headers
   * @param {Function} options.onAuthError - Callback for 401 errors
   * @returns {Promise<Object>} Response data
   */
  post: (endpoint, options = {}) => {
    return apiRequest(endpoint, { ...options, method: "POST" });
  },

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @param {Object} options.body - Request body
   * @param {Object} options.params - Query parameters
   * @param {boolean} options.includeAuth - Include auth token (default: true)
   * @param {string} options.token - Token to use directly (overrides cookie token)
   * @param {Object} options.headers - Custom headers
   * @param {Function} options.onAuthError - Callback for 401 errors
   * @returns {Promise<Object>} Response data
   */
  put: (endpoint, options = {}) => {
    return apiRequest(endpoint, { ...options, method: "PUT" });
  },

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @param {Object} options.body - Request body
   * @param {Object} options.params - Query parameters
   * @param {boolean} options.includeAuth - Include auth token (default: true)
   * @param {string} options.token - Token to use directly (overrides cookie token)
   * @param {Object} options.headers - Custom headers
   * @param {Function} options.onAuthError - Callback for 401 errors
   * @returns {Promise<Object>} Response data
   */
  patch: (endpoint, options = {}) => {
    return apiRequest(endpoint, { ...options, method: "PATCH" });
  },

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @param {Object} options.params - Query parameters
   * @param {boolean} options.includeAuth - Include auth token (default: true)
   * @param {string} options.token - Token to use directly (overrides cookie token)
   * @param {Object} options.headers - Custom headers
   * @param {Function} options.onAuthError - Callback for 401 errors
   * @returns {Promise<Object>} Response data
   */
  delete: (endpoint, options = {}) => {
    return apiRequest(endpoint, { ...options, method: "DELETE" });
  },

  /**
   * Raw request method for custom use cases
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  request: apiRequest,

  /**
   * Get API base URL
   * @returns {string} Base URL
   */
  getBaseUrl: getApiBaseUrl,
};

export default api;
