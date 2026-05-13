/**
 * API Services - Example service layer using the API utility
 *
 * This file demonstrates how to create service functions that use the API utility.
 * You can create similar service files for different domains (users, companies, jobs, etc.)
 */

import api from "./api";
import axiosInstance from "./axiosInstance";

// Note: jobService uses axiosInstance to leverage Next.js proxy routes (/api/jobs)
// which handle CORS and authentication automatically

/**
 * User API Services
 */
export const userService = {
  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    return axiosInstance.get("/me");
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    return api.get(`/users/${userId}`);
  },

  /**
   * Get all users with pagination
   * Uses Next.js proxy GET /api/users/getAllUsers -> ${API_BASE_URL}/users/getAllUsers
   */
  getUsers: async (params = {}) => {
    return axiosInstance.get("/users/getAllUsers", { params });
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
   * Delete user (via Next.js proxy /api/users/:id)
   */
  deleteUser: async (userId) => {
    return axiosInstance.delete(`/users/${userId}`);
  },
};

/**
 * Company API Services
 */
export const companyService = {
  /**
   * Get all companies with filters
   * Next.js proxy: GET /api/companies/getAllCompanies -> ${API_BASE_URL}/companies/getAllCompanies
   */
  getCompanies: async (params = {}) => {
    return axiosInstance.get("/companies/getAllCompanies", { params });
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
   * Delete company (via Next.js proxy DELETE /api/companies/:id)
   */
  deleteCompany: async (companyId) => {
    return axiosInstance.delete(`/companies/${companyId}`);
  },
};

/**
 * Enquiry API Services
 */
export const enquiryService = {
  /**
   * Create enquiry (e.g. user -> company)
   * Uses Next.js proxy only: axios baseURL "/api" → POST /api/enquiries → upstream /enquiries
   */
  createEnquiry: async (payload) => {
    const safePayload =
      payload && typeof payload === "object"
        ? {
            ...payload,
            enquiry_from:
              payload.enquiry_from === undefined || payload.enquiry_from === null
                ? payload.enquiry_from
                : String(payload.enquiry_from),
            enquiry_to:
              payload.enquiry_to === undefined || payload.enquiry_to === null
                ? payload.enquiry_to
                : String(payload.enquiry_to),
          }
        : payload;
    return axiosInstance.post("/enquiries", safePayload);
  },

  /**
   * List enquiry threads for a company.
   * GET /api/enquiries/threads?companyId=… → upstream /enquiries/threads
   */
  getEnquiries: async (params = {}) => {
    return axiosInstance.get("/enquiries/threads", { params });
  },

  /**
   * Get enquiry details + thread
   * Proxy route: /api/enquiries/:id -> ${API_BASE_URL}/enquiries/:id
   */
  getEnquiryById: async (enquiryId) => {
    return axiosInstance.get(`/enquiries/${enquiryId}`);
  },

  /**
   * Delete enquiry
   * Proxy route: /api/enquiries/:id -> ${API_BASE_URL}/enquiries/:id
   */
  deleteEnquiry: async (enquiryId) => {
    return axiosInstance.delete(`/enquiries/${enquiryId}`);
  },

  /**
   * Respond to enquiry
   * Proxy route: /api/enquiries/:id/respond -> ${API_BASE_URL}/enquiries/:id/respond
   */
  respondToEnquiry: async (enquiryId, payload) => {
    const safePayload =
      payload && typeof payload === "object"
        ? {
            ...payload,
            enquiry_from:
              payload.enquiry_from === undefined || payload.enquiry_from === null
                ? payload.enquiry_from
                : String(payload.enquiry_from),
            enquiry_to:
              payload.enquiry_to === undefined || payload.enquiry_to === null
                ? payload.enquiry_to
                : String(payload.enquiry_to),
          }
        : {};
    return axiosInstance.post(`/enquiries/${enquiryId}/respond`, safePayload);
  },
};

/**
 * Pricing API Services
 */
export const pricingService = {
  /**
   * Get current pricing configuration
   * Endpoint: GET /api/pricing/getPricingDetails?currency={currency}&billingCycle={cycle}
   *
   * Accepts `{ currency, billingCycle }`; both default to undefined so the
   * upstream can fall back to its own defaults when omitted.
   */
  getPricing: async ({ currency, billingCycle } = {}) => {
    const params = {};
    if (currency) params.currency = currency;
    if (billingCycle) params.billingCycle = billingCycle;
    return axiosInstance.get("/pricing/getPricingDetails", { params });
  },

  /**
   * Update a pricing plan by id
   * Endpoint: PATCH /api/pricing/:planId
   */
  updatePricingPlan: async (planId, payload) => {
    return axiosInstance.patch(`/pricing/${planId}`, payload || {});
  },
};

/**
 * Service API Services
 */
export const serviceService = {
  /**
   * Get all services (admin)
   * Endpoint: GET /api/services
   */
  getAllServices: async (params = {}) => {
    return axiosInstance.get("/services", { params });
  },

  /**
   * Get services by company id
   * Endpoint: GET /api/services/company/{companyId}
   */
  getServicesByCompany: async (companyId, params = {}) => {
    return axiosInstance.get(`/services/company/${companyId}`, { params });
  },

  /**
   * Create service
   * Endpoint: POST /api/services
   */
  createService: async (payload) => {
    return axiosInstance.post("/services", payload || {});
  },

  /**
   * Update service
   * Endpoint: PUT /api/services/{service_id}
   */
  updateService: async (serviceId, payload) => {
    return axiosInstance.put(`/services/${serviceId}`, payload || {});
  },

  /**
   * Delete service
   * Endpoint: DELETE /api/services/{service_id}
   */
  deleteService: async (serviceId) => {
    return axiosInstance.delete(`/services/${serviceId}`);
  },
};

/**
 * Job API Services
 *
 * Uses Next.js proxy routes (/api/jobs) to avoid CORS issues.
 * The proxy route automatically includes bearer token from cookies.
 */
export const jobService = {
  /**
   * Get all jobs with filters
   *
   * API Endpoint: GET /api/jobs
   * Proxy route: /api/jobs -> ${API_BASE_URL}/jobs
   *
   * @param {Object} params - Query parameters for filtering jobs (page, limit, search, etc.)
   * @returns {Promise<Object>} Response with jobs data
   */
  getJobs: async (params = {}) => {
    try {
      console.log("📝 Fetching jobs via proxy route /api/jobs");
      console.log("📋 Query params:", params);
      const response = await axiosInstance.get("/jobs", { params });
      console.log("✅ Jobs fetched successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error fetching jobs:", error);
      throw error;
    }
  },

  /**
   * Get job by ID
   *
   * API Endpoint: GET /api/jobs/{jobId}
   * Proxy route: /api/jobs/{jobId} -> ${API_BASE_URL}/jobs/{jobId}
   *
   * @param {number|string} jobId - ID of the job
   * @returns {Promise<Object>} Job data
   */
  getJobById: async (jobId) => {
    try {
      const response = await axiosInstance.get(`/jobs/${jobId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new job
   *
   * API Endpoint: POST /api/jobs
   * Proxy route: /api/jobs -> ${API_BASE_URL}/jobs
   * Requires: Bearer token authentication (automatically included via proxy route)
   *
   * @param {Object} jobData - Job data payload
   * @param {string} jobData.title - Job title
   * @param {Object} jobData.posted_by - Company information
   * @param {string} jobData.experience_required - Experience requirement
   * @param {Object} jobData.salary_range - Salary range with min and max
   * @param {Object} jobData.location - Location details
   * @param {string} jobData.description - Job description
   * @param {string} jobData.employment_type - Employment type
   * @param {string[]} jobData.skills_required - Required skills array
   * @param {number} jobData.application_deadline - Application deadline timestamp
   * @param {string} jobData.status - Job status (pending/approved/blocked)
   * @param {boolean} jobData.isActive - Whether job is active
   * @returns {Promise<Object>} Created job response
   *
   * @example
   * await jobService.createJob({
   *   title: "Senior Software Engineer",
   *   posted_by: { company_id: 1, company_name: "TechCorp", company_short_name: "TC" },
   *   experience_required: "5-8 years",
   *   salary_range: { min: "$120,000", max: "$150,000" },
   *   location: { city: "San Francisco", state: "California", pincode: "94102" },
   *   description: "Full-stack development role",
   *   employment_type: "Full-time",
   *   skills_required: ["React", "Node.js"],
   *   application_deadline: 1708214400000,
   *   status: "pending",
   *   isActive: true
   * });
   */
  createJob: async (jobData) => {
    try {
      console.log("📝 Client: Calling Next.js proxy route /api/jobs");
      console.log("📦 Client: Job payload:", JSON.stringify(jobData, null, 2));
      console.log("🔄 Client: Request will be proxied to external API server-side");
      
      // Call proxy route which handles CORS and authentication
      // axiosInstance has baseURL: "/api", so "/jobs" becomes "/api/jobs"
      // This hits the Next.js API route at /src/app/api/jobs/route.js
      const response = await axiosInstance.post("/jobs", jobData);
      
      console.log("✅ Client: Job created successfully via proxy:", response);
      return response;
    } catch (error) {
      console.error("❌ Client: Error creating job:", error);
      throw error;
    }
  },

  /**
   * Update job
   *
   * API Endpoint: PUT /api/jobs/{jobId}
   * Proxy route: /api/jobs/{jobId} -> ${API_BASE_URL}/jobs/{jobId}
   *
   * @param {number|string} jobId - ID of the job to update
   * @param {Object} jobData - Updated job data (same format as createJob)
   * @returns {Promise<Object>} Updated job response
   */
  updateJob: async (jobId, jobData) => {
    try {
      console.log("✏️ Updating job via proxy route /api/jobs/" + jobId);
      console.log("📦 Job payload:", JSON.stringify(jobData, null, 2));
      const response = await axiosInstance.put(`/jobs/${jobId}`, jobData);
      console.log("✅ Job updated successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error updating job:", error);
      throw error;
    }
  },

  /**
   * Delete job
   *
   * API Endpoint: DELETE /api/jobs/{jobId}
   * Proxy route: /api/jobs/{jobId} -> ${API_BASE_URL}/jobs/{jobId}
   *
   * @param {number|string} jobId - ID of the job to delete
   * @returns {Promise<Object>} Deletion response
   */
  deleteJob: async (jobId) => {
    try {
      console.log("🗑️ Deleting job via proxy route /api/jobs/" + jobId);
      const response = await axiosInstance.delete(`/jobs/${jobId}`);
      console.log("✅ Job deleted successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error deleting job:", error);
      throw error;
    }
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
   * API Endpoint: GET /experts/getAllExperts?page=1&limit=10&sortBy=name&order=asc
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
    try {
      const response = await axiosInstance.get("/experts/getAllExperts", {
        params: params,
      });
      return response;
    } catch (error) {
      // Error is already handled by axios interceptor
      throw error;
    }
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
    try {
      const response = await axiosInstance.get(`/experts/${expertId}`);
      return response;
    } catch (error) {
      throw error;
    }
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
    try {
      const response = await axiosInstance.post("/experts", expertData);
      return response;
    } catch (error) {
      throw error;
    }
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
    try {
      const response = await axiosInstance.put(
        `/experts/${expertId}`,
        expertData
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update expert approval status
   *
   * API Endpoint: PATCH /experts/{id}
   *
   * @param {number} expertId - ID of the expert
   * @param {boolean} isApproved - Approval status (true for approved, false for pending)
   * @returns {Promise<Object>} Updated expert response
   */
  updateApprovalStatus: async (expertId, isApproved) => {
    try {
      const response = await axiosInstance.patch(`/experts/${expertId}`, {
        is_expert_approved: isApproved,
      });
      return response;
    } catch (error) {
      throw error;
    }
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
    try {
      const response = await axiosInstance.delete(`/experts/${expertId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

/**
 * Equipment API Services
 *
 * Provides all CRUD operations for equipment.
 * Supports pagination, sorting, and search functionality.
 */
export const equipmentService = {
  /**
   * Get all equipment with pagination, sorting, and search
   *
   * API Endpoint: GET /equipments/getAllEquipments?page=1&limit=10&sortBy=name&order=asc
   *
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.sortBy - Field to sort by (e.g., "name", "createdAt")
   * @param {string} params.order - Sort order: "asc" or "desc" (default: "asc")
   * @param {string} params.search - Search query string
   * @returns {Promise<Object>} Response with equipment data and pagination info
   */
  getEquipment: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/equipments/getAllEquipments", {
        params: params,
      });
      return response;
    } catch (error) {
      // Error is already handled by axios interceptor
      throw error;
    }
  },

  /**
   * Get equipment by ID
   *
   * API Endpoint: GET /equipments/{id}
   *
   * @param {number} equipmentId - ID of the equipment
   * @returns {Promise<Object>} Equipment data
   */
  getEquipmentById: async (equipmentId) => {
    try {
      const response = await axiosInstance.get(`/equipments/${equipmentId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get equipment by company ID
   *
   * API Endpoint: GET /api/equipments/company/{companyId}
   */
  getEquipmentByCompany: async (companyId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/equipments/company/${companyId}`, {
        params,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new equipment
   *
   * API Endpoint: POST /equipments
   *
   * @param {Object} equipmentData - Equipment data
   * @returns {Promise<Object>} Created equipment response
   */
  createEquipment: async (equipmentData) => {
    try {
      const response = await axiosInstance.post("/equipments", equipmentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update equipment
   *
   * API Endpoint: PUT /equipments/{id}
   *
   * @param {number} equipmentId - ID of the equipment to update
   * @param {Object} equipmentData - Updated equipment data
   * @returns {Promise<Object>} Updated equipment response
   */
  updateEquipment: async (equipmentId, equipmentData) => {
    try {
      const response = await axiosInstance.patch(
        `/equipments/${equipmentId}`,
        equipmentData
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete equipment
   *
   * API Endpoint: DELETE /equipments/{id}
   *
   * @param {number} equipmentId - ID of the equipment to delete
   * @returns {Promise<Object>} Deletion response
   */
  deleteEquipment: async (equipmentId) => {
    try {
      const response = await axiosInstance.delete(`/equipments/${equipmentId}`);
      return response;
    } catch (error) {
      throw error;
    }
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
   * API Endpoint: POST /categories
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
      // Call external API via Netlify redirect (/api/categories -> http://139.59.22.7:8080/api/categories)
      const response = await axiosInstance.post("/categories", payload);
      console.log("✅ Category created successfully");
      return response;
    } catch (error) {
      // Error is already handled by axios interceptor with user-friendly messages
      // Just re-throw the error to let the interceptor's message be used
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
      const response = await axiosInstance.post(`/subcategories`, payload);
      console.log("✅ Subcategory created successfully");
      return response;
    } catch (error) {
      // Error is already handled by axios interceptor with user-friendly messages
      // Just re-throw the error to let the interceptor's message be used
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
   * Get all subcategories for a category with pagination support
   *
   * Performance: This is a separate API endpoint called only when a category row is expanded.
   * This prevents loading all subcategories upfront and improves initial page load performance.
   *
   * API Endpoint: GET /api/subcategories?categoryId={categoryId}&page={page}&limit={limit}
   * Example: GET /api/subcategories?categoryId=15&page=1&limit=10
   * 
   * Note: This goes through Next.js proxy route (/api/subcategories/route.js) which forwards
   * the request to the external API (${API_BASE_URL}/subcategories) with proper authentication.
   * This avoids CORS issues and ensures bearer token is included from cookies.
   *
   * Requires: Bearer token authentication (automatically included via axiosInstance and proxy route)
   *
   * Response Structure:
   * {
   *   success: true,
   *   data: {
   *     items: [...],
   *     total: 7,
   *     page: 1,
   *     limit: 10
   *   }
   * }
   *
   * @param {number} categoryId - ID of the parent category
   * @param {Object} params - Query parameters (pagination, sorting, etc.)
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @returns {Promise<Object>} Subcategories data with pagination info
   *
   * @example
   * const response = await categoryService.getSubCategories(15, { page: 1, limit: 10 });
   */
  getSubCategories: async (categoryId, params = {}) => {
    try {
      // Call through Next.js proxy route: /api/subcategories -> ${API_BASE_URL}/subcategories
      // The proxy route handles CORS and adds bearer token from cookies
      const response = await axiosInstance.get("/subcategories", {
        params: {
          categoryId,
          ...params,
        },
      });
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
   * Payload: { "categoryId": 0, "subcategoryName": "string" }
   * Requires: Bearer token authentication
   *
   * @param {number} categoryId - ID of the parent category
   * @param {number} subCategoryId - ID of the subcategory to update
   * @param {Object} subCategoryData - Updated subcategory data
   * @param {number} subCategoryData.categoryId - ID of the parent category
   * @param {string} subCategoryData.subcategoryName - New name of the subcategory
   * @returns {Promise<Object>} Updated subcategory response
   */
  updateSubCategory: async (categoryId, subCategoryId, subCategoryData) => {
    try {
      // Ensure payload format: { "categoryId": 0, "subcategoryName": "string" }
      const payload = {
        categoryId: subCategoryData.categoryId || parseInt(categoryId, 10),
        subcategoryName:
          subCategoryData.subcategoryName ||
          subCategoryData.subCategoryName ||
          subCategoryData.name,
      };

      // Try nested endpoint first, fallback to flat endpoint if needed
      const response = await axiosInstance.put(
        `/subcategories/${subCategoryId}`,
        payload
      );
      return response;
    } catch (error) {
      // If nested endpoint fails, try flat endpoint
      if (error.status === 404) {
        try {
          const payload = {
            categoryId: subCategoryData.categoryId || parseInt(categoryId, 10),
            subcategoryName:
              subCategoryData.subcategoryName ||
              subCategoryData.subCategoryName ||
              subCategoryData.name,
          };
          const response = await axiosInstance.put(
            `/subcategories/${subCategoryId}`,
            payload
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
   * API Endpoint: DELETE /api/subcategories/{subCategoryId}
   * Example: DELETE /api/subcategories/16
   * 
   * Note: This goes through Next.js proxy route (/api/subcategories/[subCategoryId]/route.js)
   * which forwards the request to the external API (${API_BASE_URL}/subcategories/{subCategoryId})
   * with proper authentication. This avoids CORS issues and ensures bearer token is included from cookies.
   *
   * Requires: Bearer token authentication (automatically included via axiosInstance and proxy route)
   *
   * @param {number} categoryId - ID of the parent category (for reference, not used in API call)
   * @param {number} subCategoryId - ID of the subcategory to delete
   * @returns {Promise<Object>} Deletion response
   */
  deleteSubCategory: async (categoryId, subCategoryId) => {
    try {
      // Call through Next.js proxy route: /api/subcategories/{subCategoryId} -> ${API_BASE_URL}/subcategories/{subCategoryId}
      // The proxy route handles CORS and adds bearer token from cookies
      const response = await axiosInstance.delete(
        `/subcategories/${subCategoryId}`
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
