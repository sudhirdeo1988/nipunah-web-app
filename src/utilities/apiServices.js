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
 * Category API Services
 *
 * Provides all CRUD operations for categories and subcategories.
 * Supports pagination, sorting, and search functionality.
 */
export const categoryService = {
  /**
   * Get all categories with pagination, sorting, and search
   *
   * API Endpoint: GET /categories?page=1&limit=10&sortBy=name&order=asc
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
    return api.get("/categories", { params });
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (categoryId) => {
    return api.get(`/categories/${categoryId}`);
  },

  /**
   * Create a new category
   *
   * API Endpoint: POST /category
   *
   * @param {Object} categoryData - Category data
   * @param {string} categoryData.name - Name of the category
   * @returns {Promise<Object>} Created category response
   */
  createCategory: async (categoryData) => {
    return api.post("/category", { body: categoryData });
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
   */
  createSubCategory: async (categoryId, subCategoryData) => {
    return api.post(`/categories/${categoryId}/subcategories`, {
      body: subCategoryData,
    });
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
