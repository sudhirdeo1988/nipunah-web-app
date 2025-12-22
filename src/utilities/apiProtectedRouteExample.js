/**
 * Example: Using API Utility with Bearer Token in Protected Routes
 * 
 * This file demonstrates best practices for making API calls in protected routes
 * with automatic Bearer token handling and 401 error management.
 */

import api from "./api";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/**
 * Example 1: Basic protected route call
 * Bearer token is automatically included from cookies
 */
export const fetchUserProfile = async () => {
  try {
    const profile = await api.get("/me");
    return profile;
  } catch (error) {
    if (error.isAuthError) {
      // Token expired or invalid - already cleared from cookies
      console.error("Authentication failed");
      throw error;
    }
    throw error;
  }
};

/**
 * Example 2: Protected route with 401 error handling
 * Includes custom callback for handling authentication failures
 */
export const useProtectedApiCall = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const fetchProtectedData = async () => {
    try {
      const data = await api.get("/protected-endpoint", {
        onAuthError: (response, errorData) => {
          // Custom handler called when 401 occurs
          console.warn("Token expired, logging out...", errorData);
          logout();
          router.push(ROUTES.PUBLIC.LOGIN);
        },
      });
      return data;
    } catch (error) {
      // Additional error handling
      if (error.isAuthError) {
        // Token was already cleared in onAuthError callback
        // But we can still handle it here if needed
        console.error("Authentication error:", error.message);
      }
      throw error;
    }
  };

  return { fetchProtectedData };
};

/**
 * Example 3: Using token from AuthContext directly
 * Useful when you want to use a token from context instead of cookies
 */
export const useApiWithContextToken = () => {
  const { token } = useAuth();

  const fetchDataWithContextToken = async () => {
    try {
      const data = await api.get("/endpoint", {
        token: token, // Override cookie token with context token
      });
      return data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  return { fetchDataWithContextToken };
};

/**
 * Example 4: Protected route with retry logic
 * Retries once if 401 occurs (useful for token refresh scenarios)
 */
export const fetchWithRetry = async (endpoint, retryCount = 0) => {
  try {
    const data = await api.get(endpoint);
    return data;
  } catch (error) {
    if (error.isAuthError && retryCount === 0) {
      // Could implement token refresh logic here
      // For now, just throw the error
      console.warn("Authentication failed, cannot retry");
    }
    throw error;
  }
};

/**
 * Example 5: Component using protected API calls
 */
export const ExampleProtectedComponent = () => {
  const { logout, isLoggedIn } = useAuth();
  const router = useRouter();

  const handleFetchData = async () => {
    try {
      // Bearer token automatically included
      const data = await api.get("/users", {
        params: { page: 1, limit: 10 },
        onAuthError: () => {
          // Handle logout and redirect
          logout();
          router.push(ROUTES.PUBLIC.LOGIN);
        },
      });
      console.log("Data:", data);
    } catch (error) {
      if (error.isAuthError) {
        // Already handled in onAuthError callback
        return;
      }
      console.error("Error fetching data:", error);
    }
  };

  // Component JSX would go here...
  return null;
};

/**
 * Example 6: Server-side API call (if needed)
 * Note: Server-side calls need token passed explicitly
 */
export const serverSideApiCall = async (token) => {
  try {
    const data = await api.get("/endpoint", {
      token: token, // Must pass token explicitly for server-side
    });
    return data;
  } catch (error) {
    console.error("Server-side API error:", error);
    throw error;
  }
};










