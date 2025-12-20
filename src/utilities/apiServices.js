/**
 * API Services - Example service layer using the API utility
 *
 * This file demonstrates how to create service functions that use the API utility.
 * You can create similar service files for different domains (users, companies, jobs, etc.)
 */

import api from "./api";
import axiosInstance from "./axiosInstance";

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
 *
 * IMPORTANT: All category/subcategory APIs are SECURE and require:
 * - Bearer token authentication (automatically included via axiosInstance)
 * - User must be logged in
 * - Token is automatically retrieved from cookies and added to Authorization header
 */
export const categoryService = {
  /**
   * Get all categories with pagination, sorting, and search
   *
   * API Endpoint: GET /categories/getAllCategories?page=1&limit=10&sortBy=name&order=asc
   * Requires: Bearer token authentication (automatically included via axiosInstance)
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
    // Call external API directly using axios
    // Axios automatically handles query parameters and cookies
    try {
      const response = await axiosInstance.get("/categories/getAllCategories", {
        params: params,
      });
      return response;
    } catch (error) {
      // Error is already handled by axios interceptor
      throw error;
    }
  },

  /**
   * Get category by ID
   *
   * API Endpoint: GET /categories/{id}
   * Requires: Bearer token authentication
   *
   * @param {number} categoryId - ID of the category to retrieve
   * @returns {Promise<Object>} Category data
   */
  getCategoryById: async (categoryId) => {
    try {
      const response = await axiosInstance.get(`/categories/${categoryId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * ============================================
   * SIMPLE CREATE FUNCTIONS
   * ============================================
   */

  /**
   * Create a main category
   *
   * API Endpoint: POST /category
   * Requires: Bearer token authentication (automatically included via axiosInstance)
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

    try {
      // Call external API directly using axios
      const response = await axiosInstance.post("/category", payload);
      console.log("✅ Category created successfully");
      return response;
    } catch (error) {
      // Error is already handled by axios interceptor with user-friendly messages
      // Add specific error handling for category creation if needed
      if (error.status === 404) {
        error.message =
          "Category endpoint not found. Please check the API configuration.";
      }
      throw error;
    }
  },

  /**
   * Create a subcategory
   *
   * API Endpoint: POST /categories/{categoryId}/subcategories
   * Requires: Bearer token authentication (automatically included via axiosInstance)
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

    try {
      // Call external API directly using axios
      const response = await axiosInstance.post(
        `/categories/${categoryId}/subcategories`,
        payload
      );
      console.log("✅ Subcategory created successfully");
      return response;
    } catch (error) {
      // Error is already handled by axios interceptor with user-friendly messages
      // Add specific error handling for subcategory creation if needed
      if (error.status === 404) {
        error.message =
          "Subcategory endpoint not found. Please check the API configuration.";
      }
      throw error;
    }
  },

  /**
   * Update category
   *
   * API Endpoint: PUT /categories/{id}
   * Payload: { "name": "string" }
   * Requires: Bearer token authentication
   *
   * @param {number} categoryId - ID of the category to update
   * @param {Object} categoryData - Updated category data
   * @param {string} categoryData.name - New name of the category
   * @returns {Promise<Object>} Updated category response
   */
  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await axiosInstance.put(
        `/categories/${categoryId}`,
        categoryData
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete category
   *
   * API Endpoint: DELETE /categories/{id}
   * Requires: Bearer token authentication
   *
   * @param {number} categoryId - ID of the category to delete
   * @returns {Promise<Object>} Deletion response
   */
  deleteCategory: async (categoryId) => {
    try {
      const response = await axiosInstance.delete(`/categories/${categoryId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all subcategories for a category
   *
   * API Endpoint: GET /categories/{categoryId}/subcategories
   * Requires: Bearer token authentication
   *
   * @param {number} categoryId - ID of the parent category
   * @param {Object} params - Query parameters (pagination, sorting, etc.)
   * @returns {Promise<Object>} Subcategories data
   */
  getSubCategories: async (categoryId, params = {}) => {
    try {
      const response = await axiosInstance.get(
        `/categories/${categoryId}/subcategories`,
        { params }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get subcategory by ID
   *
   * API Endpoint: GET /categories/{categoryId}/subcategories/{subCategoryId}
   * Requires: Bearer token authentication
   *
   * @param {number} categoryId - ID of the parent category
   * @param {number} subCategoryId - ID of the subcategory to retrieve
   * @returns {Promise<Object>} Subcategory data
   */
  getSubCategoryById: async (categoryId, subCategoryId) => {
    try {
      const response = await axiosInstance.get(
        `/categories/${categoryId}/subcategories/${subCategoryId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update subcategory
   *
   * API Endpoint: PUT /subcategories/{id} or PUT /categories/{categoryId}/subcategories/{subCategoryId}
   * Payload: { "name": "string" }
   * Requires: Bearer token authentication
   *
   * @param {number} categoryId - ID of the parent category
   * @param {number} subCategoryId - ID of the subcategory to update
   * @param {Object} subCategoryData - Updated subcategory data
   * @param {string} subCategoryData.name - New name of the subcategory
   * @returns {Promise<Object>} Updated subcategory response
   */
  updateSubCategory: async (categoryId, subCategoryId, subCategoryData) => {
    try {
      // Try nested endpoint first, fallback to flat endpoint if needed
      const response = await axiosInstance.put(
        `/categories/${categoryId}/subcategories/${subCategoryId}`,
        subCategoryData
      );
      return response;
    } catch (error) {
      // If nested endpoint fails, try flat endpoint
      if (error.status === 404) {
        try {
          const response = await axiosInstance.put(
            `/subcategories/${subCategoryId}`,
            subCategoryData
          );
          return response;
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      throw error;
    }
  },

  /**
   * Delete subcategory
   *
   * API Endpoint: DELETE /categories/{categoryId}/subcategories/{subCategoryId}
   * Requires: Bearer token authentication
   *
   * @param {number} categoryId - ID of the parent category
   * @param {number} subCategoryId - ID of the subcategory to delete
   * @returns {Promise<Object>} Deletion response
   */
  deleteSubCategory: async (categoryId, subCategoryId) => {
    try {
      const response = await axiosInstance.delete(
        `/categories/${categoryId}/subcategories/${subCategoryId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
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
