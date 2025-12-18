/**
 * API Services - Example service layer using the API utility
 *
 * This file demonstrates how to create service functions that use the API utility.
 * You can create similar service files for different domains (users, companies, jobs, etc.)
 */

import api from "./api";

/**
 * User API Services
 */
export const userService = {
  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    return api.get("/me");
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    return api.get(`/users/${userId}`);
  },

  /**
   * Get all users with pagination
   */
  getUsers: async (params = {}) => {
    return api.get("/users", { params });
  },

  /**
   * Create a new user
   */
  createUser: async (userData) => {
    return api.post("/users", { body: userData });
  },

  /**
   * Update user
   */
  updateUser: async (userId, userData) => {
    return api.put(`/users/${userId}`, { body: userData });
  },

  /**
   * Delete user
   */
  deleteUser: async (userId) => {
    return api.delete(`/users/${userId}`);
  },
};

/**
 * Company API Services
 */
export const companyService = {
  /**
   * Get all companies with filters
   */
  getCompanies: async (params = {}) => {
    return api.get("/companies", { params });
  },

  /**
   * Get company by ID
   */
  getCompanyById: async (companyId) => {
    return api.get(`/companies/${companyId}`);
  },

  /**
   * Create a new company
   */
  createCompany: async (companyData) => {
    return api.post("/companies", { body: companyData });
  },

  /**
   * Update company
   */
  updateCompany: async (companyId, companyData) => {
    return api.patch(`/companies/${companyId}`, { body: companyData });
  },

  /**
   * Delete company
   */
  deleteCompany: async (companyId) => {
    return api.delete(`/companies/${companyId}`);
  },
};

/**
 * Job API Services
 */
export const jobService = {
  /**
   * Get all jobs with filters
   */
  getJobs: async (params = {}) => {
    return api.get("/jobs", { params });
  },

  /**
   * Get job by ID
   */
  getJobById: async (jobId) => {
    return api.get(`/jobs/${jobId}`);
  },

  /**
   * Create a new job
   */
  createJob: async (jobData) => {
    return api.post("/jobs", { body: jobData });
  },

  /**
   * Update job
   */
  updateJob: async (jobId, jobData) => {
    return api.patch(`/jobs/${jobId}`, { body: jobData });
  },

  /**
   * Delete job
   */
  deleteJob: async (jobId) => {
    return api.delete(`/jobs/${jobId}`);
  },
};

/**
 * Expert API Services
 *
 * Provides all CRUD operations for experts.
 * Supports pagination, sorting, and search functionality.
 */
export const expertService = {
  /**
   * Get all experts with pagination, sorting, and search
   *
   * API Endpoint: GET /experts?page=1&limit=10&sortBy=name&order=asc
   *
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.sortBy - Field to sort by (e.g., "name", "createdAt")
   * @param {string} params.order - Sort order: "asc" or "desc" (default: "asc")
   * @param {string} params.search - Search query string
   * @returns {Promise<Object>} Response with experts data and pagination info
   */
  getExperts: async (params = {}) => {
    return api.get("/experts", { params });
  },

  /**
   * Get expert by ID
   *
   * API Endpoint: GET /experts/{id}
   *
   * @param {number} expertId - ID of the expert
   * @returns {Promise<Object>} Expert data
   */
  getExpertById: async (expertId) => {
    return api.get(`/experts/${expertId}`);
  },

  /**
   * Create a new expert
   *
   * API Endpoint: POST /experts
   *
   * @param {Object} expertData - Expert data
   * @param {string} expertData.name - Name of the expert
   * @param {string} expertData.email - Email of the expert
   * @param {string} expertData.contact - Contact number
   * @param {string} expertData.country - Country
   * @returns {Promise<Object>} Created expert response
   */
  createExpert: async (expertData) => {
    return api.post("/experts", { body: expertData });
  },

  /**
   * Update expert
   *
   * API Endpoint: PUT /experts/{id}
   *
   * @param {number} expertId - ID of the expert to update
   * @param {Object} expertData - Updated expert data
   * @returns {Promise<Object>} Updated expert response
   */
  updateExpert: async (expertId, expertData) => {
    return api.put(`/experts/${expertId}`, { body: expertData });
  },

  /**
   * Delete expert
   *
   * API Endpoint: DELETE /experts/{id}
   *
   * @param {number} expertId - ID of the expert to delete
   * @returns {Promise<Object>} Deletion response
   */
  deleteExpert: async (expertId) => {
    return api.delete(`/experts/${expertId}`);
  },
};

/**
 * Category API Services - SIMPLIFIED
 *
 * Simple, dedicated functions for category and subcategory operations.
 * Each function does exactly one thing with clear inputs and outputs.
 */
export const categoryService = {
  /**
   * Get all categories with pagination, sorting, and search
   *
   * API Endpoint: GET /api/categories/getAllCategories?page=1&limit=10&sortBy=name&order=asc
   * Note: Uses Next.js API route proxy to avoid CORS issues. Bearer token is automatically included from cookies.
   *
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.sortBy - Field to sort by (e.g., "name", "createdAt")
   * @param {string} params.order - Sort order: "asc" or "desc" (default: "asc")
   * @param {string} params.search - Search query string
   * @returns {Promise<Object>} Response with categories data and pagination info
   */
  getCategories: async (params = {}) => {
    // Use Next.js API route proxy to avoid CORS
    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();

    const url = `/api/categories/getAllCategories${
      queryString ? `?${queryString}` : ""
    }`;

    // Use direct fetch for Next.js API route (same origin, no CORS)
    // credentials: 'include' ensures cookies are sent with the request
    // Using relative URL - will automatically use the current domain
    const response = await fetch(url, {
      method: "GET",
      credentials: "include", // Include cookies in the request
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (categoryId) => {
    return api.get(`/categories/${categoryId}`);
  },

  /**
   * ============================================
   * SIMPLE CREATE FUNCTIONS
   * ============================================
   */

  /**
   * Create a main category
   *
   * @param {string} categoryName - Name of the category to create
   * @returns {Promise<Object>} Created category response
   *
   * @example
   * await createMainCategory("Electronics");
   */
  createMainCategory: async (categoryName) => {
    console.log("➕ Creating main category:", categoryName);

    if (!categoryName) {
      throw new Error("Category name is required");
    }

    // Construct payload
    const payload = { name: categoryName };

    console.log("📦 Creating category:", payload);

    // Call Next.js proxy route (handles CORS and bearer token)
    // Using relative URL - will automatically use the current domain
    const response = await fetch("/api/categories", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      // Try to extract error message from response
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use status text
        const text = await response.text().catch(() => "");
        if (text) {
          try {
            const parsed = JSON.parse(text);
            errorMessage = parsed.message || parsed.error || errorMessage;
          } catch {
            // Use status text as fallback
          }
        }
      }

      // Provide user-friendly messages for common status codes
      if (response.status === 404) {
        errorMessage =
          "Category endpoint not found. Please check the API configuration.";
      } else if (response.status === 401) {
        errorMessage = "Unauthorized. Please log in again.";
      } else if (response.status === 403) {
        errorMessage =
          "Forbidden. You don't have permission to create categories.";
      } else if (response.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      console.error("❌ Category creation failed:", {
        status: response.status,
        statusText: response.statusText,
        errorMessage,
      });

      throw new Error(errorMessage);
    }

    console.log("✅ Category created successfully");
    return await response.json();
  },

  /**
   * Create a subcategory
   *
   * @param {number} categoryId - Parent category ID
   * @param {string} subcategoryName - Name of the subcategory to create
   * @returns {Promise<Object>} Created subcategory response
   *
   * @example
   * await createNewSubCategory(5, "Laptops");
   */
  createNewSubCategory: async (categoryId, subcategoryName) => {
    console.log("➕ Creating subcategory:", { categoryId, subcategoryName });

    if (!categoryId) {
      throw new Error("Category ID is required");
    }

    if (!subcategoryName) {
      throw new Error("Subcategory name is required");
    }

    // Construct payload as required by API
    const payload = {
      categoryId: parseInt(categoryId, 10),
      subcategoryName: subcategoryName,
    };

    console.log("📦 Creating subcategory:", payload);

    // Call Next.js proxy route (handles CORS and bearer token)
    // Using relative URL - will automatically use the current domain
    const response = await fetch(
      `/api/categories/${categoryId}/subcategories`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      // Try to extract error message from response
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If JSON parsing fails, use status text
        const text = await response.text().catch(() => "");
        if (text) {
          try {
            const parsed = JSON.parse(text);
            errorMessage = parsed.message || parsed.error || errorMessage;
          } catch {
            // Use status text as fallback
          }
        }
      }

      // Provide user-friendly messages for common status codes
      if (response.status === 404) {
        errorMessage =
          "Subcategory endpoint not found. Please check the API configuration.";
      } else if (response.status === 401) {
        errorMessage = "Unauthorized. Please log in again.";
      } else if (response.status === 403) {
        errorMessage =
          "Forbidden. You don't have permission to create subcategories.";
      } else if (response.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      console.error("❌ Subcategory creation failed:", {
        status: response.status,
        statusText: response.statusText,
        errorMessage,
      });

      throw new Error(errorMessage);
    }

    console.log("✅ Subcategory created successfully");
    return await response.json();
  },

  /**
   * Create a new category
   *
   * API Endpoint: POST /api/categories
   * Note: Uses Next.js API route proxy to avoid CORS issues. Bearer token is automatically included from cookies.
   * External API: POST {API_BASE_URL}/category
   * Requires: Bearer token authentication
   *
   * @param {Object} categoryData - Category data
   * @param {string} categoryData.name - Name of the category
   * @returns {Promise<Object>} Created category response
   */
  createCategory: async (categoryData) => {
    // IMPORTANT: Use Next.js API route proxy (relative URL) to avoid CORS
    // This calls YOUR Next.js server, which then proxies to external API
    // DO NOT use the external API URL directly here - it will cause CORS!

    console.log("🔵 Creating category:", categoryData);

    // Use direct fetch for Next.js API route (same origin, no CORS)
    // credentials: 'include' ensures cookies are sent with the request
    // Using relative URL - will automatically use the current domain
    const response = await fetch("/api/categories", {
      method: "POST",
      credentials: "include", // Include cookies in the request
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  },

  /**
   * Update category
   *
   * API Endpoint: PUT /categories/{id}
   * Payload: { "name": "string" }
   *
   * @param {number} categoryId - ID of the category to update
   * @param {Object} categoryData - Updated category data
   * @param {string} categoryData.name - New name of the category
   * @returns {Promise<Object>} Updated category response
   */
  updateCategory: async (categoryId, categoryData) => {
    return api.put(`/categories/${categoryId}`, { body: categoryData });
  },

  /**
   * Delete category
   *
   * API Endpoint: DELETE /categories/{id}
   *
   * @param {number} categoryId - ID of the category to delete
   * @returns {Promise<Object>} Deletion response
   */
  deleteCategory: async (categoryId) => {
    return api.delete(`/categories/${categoryId}`);
  },

  /**
   * Get all subcategories for a category
   */
  getSubCategories: async (categoryId, params = {}) => {
    return api.get(`/categories/${categoryId}/subcategories`, { params });
  },

  /**
   * Get subcategory by ID
   */
  getSubCategoryById: async (categoryId, subCategoryId) => {
    return api.get(`/categories/${categoryId}/subcategories/${subCategoryId}`);
  },

  /**
   * Create a new subcategory for a category
   *
   * API Endpoint: POST /api/categories/{categoryId}/subcategories
   * Note: Uses Next.js API route proxy to avoid CORS issues. Bearer token is automatically included from cookies.
   * External API: POST {API_BASE_URL}/categories/{categoryId}/subcategories
   * Requires: Bearer token authentication
   *
   * Payload Structure:
   * {
   *   "categoryId": number,
   *   "subcategoryName": "string"
   * }
   *
   * @param {number} categoryId - ID of the parent category
   * @param {Object} subCategoryData - Subcategory data
   * @param {string} subCategoryData.subcategoryName - Name of the subcategory (can also accept 'name' for backwards compatibility)
   * @returns {Promise<Object>} Created subcategory response
   */
  createSubCategory: async (categoryId, subCategoryData) => {
    // IMPORTANT: Use Next.js API route proxy (relative URL) to avoid CORS
    // This calls YOUR Next.js server, which then proxies to external API
    // DO NOT use the external API URL directly here - it will cause CORS!

    // Debug: Log what we received
    console.log("🔍 createSubCategory received:", {
      categoryId,
      subCategoryData,
      keys: Object.keys(subCategoryData),
    });

    // Construct the correct payload structure
    // Support multiple field name variations for backwards compatibility
    const subcategoryName =
      subCategoryData.subcategoryName ||
      subCategoryData.subCategoryName || // Check capital C version
      subCategoryData.name ||
      "";

    console.log("🔍 Extracted subcategoryName:", subcategoryName);

    if (!subcategoryName) {
      console.error(
        "❌ ERROR: No subcategory name found in data:",
        subCategoryData
      );
      throw new Error("Subcategory name is required");
    }

    const payload = {
      categoryId: parseInt(categoryId, 10),
      subcategoryName: subcategoryName,
    };

    console.log("🔵 Creating subcategory via proxy");
    console.log("📦 Constructed Payload:", JSON.stringify(payload));
    console.log("📊 Payload Details:", {
      hasSubcategoryName: !!payload.subcategoryName,
      hasCategoryId: !!payload.categoryId,
      rawSubCategoryData: subCategoryData,
    });

    // Use direct fetch for Next.js API route (same origin, no CORS)
    // credentials: 'include' ensures cookies are sent with the request
    // Using relative URL - will automatically use the current domain
    const response = await fetch(
      `/api/categories/${categoryId}/subcategories`,
      {
        method: "POST",
        credentials: "include", // Include cookies in the request
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  },

  /**
   * Update subcategory
   *
   * API Endpoint: PUT /subcategories/{id}
   * Payload: { "name": "string" }
   *
   * @param {number} categoryId - ID of the parent category (for reference, not used in endpoint)
   * @param {number} subCategoryId - ID of the subcategory to update
   * @param {Object} subCategoryData - Updated subcategory data
   * @param {string} subCategoryData.name - New name of the subcategory
   * @returns {Promise<Object>} Updated subcategory response
   */
  updateSubCategory: async (categoryId, subCategoryId, subCategoryData) => {
    // Note: Endpoint is PUT /subcategories/{id} (not nested under categories)
    return api.put(`/subcategories/${subCategoryId}`, {
      body: subCategoryData,
    });
  },

  /**
   * Delete subcategory
   */
  deleteSubCategory: async (categoryId, subCategoryId) => {
    return api.delete(
      `/categories/${categoryId}/subcategories/${subCategoryId}`
    );
  },
};

/**
 * Auth API Services
 */
export const authService = {
  /**
   * Login user
   */
  login: async (credentials) => {
    return api.post("/auth/login", {
      body: credentials,
      includeAuth: false, // Login endpoint doesn't need auth token
    });
  },

  /**
   * Register user
   */
  register: async (userData) => {
    return api.post("/auth/register", {
      body: userData,
      includeAuth: false, // Registration doesn't need auth token
    });
  },

  /**
   * Register company
   */
  registerCompany: async (companyData) => {
    return api.post("/auth/register/company", {
      body: companyData,
      includeAuth: false,
    });
  },

  /**
   * Logout user
   */
  logout: async () => {
    return api.post("/auth/logout");
  },

  /**
   * Refresh token
   */
  refreshToken: async (refreshToken) => {
    return api.post("/auth/refresh", {
      body: { refreshToken },
      includeAuth: false,
    });
  },
};
