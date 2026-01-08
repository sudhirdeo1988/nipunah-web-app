import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { expertService } from "@/utilities/apiServices";
import { message } from "antd";

/**
 * Mock data structure matching the API response
 */
const MOCK_RESPONSE = {
  success: true,
  message: "Experts fetched successfully",
  data: {
    total: 150, // total experts in DB
    page: 1, // current page
    limit: 10, // page size
    totalPages: 15, // based on total/limit

    items: [
      {
        id: 1,
        name: "Sudhir Deolalikar",
        email: "sudhir@gmail.com",
        contact: "9988776655",
        country: "India",
        createdAt: "1764930501",
        updatedAt: "1764930501",
        appliedJobsCount: 3,
      },
    ],
  },
};

/**
 * Format date to DD-MM-YYYY
 * Handles both ISO date strings and timestamps (seconds/milliseconds)
 */
const formatDate = (dateValue) => {
  if (!dateValue) return "N/A";

  let date;

  // Check if it's a string (ISO format) or number (timestamp)
  if (typeof dateValue === "string") {
    // Check if it's an ISO date string (contains 'T' or matches ISO pattern)
    if (dateValue.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
      // Handle ISO date string like "2026-01-03T06:52:45.021014" or "2026-01-03"
      date = new Date(dateValue);
    } else {
      // Try parsing as timestamp string
      const timestamp = parseInt(dateValue, 10);
      if (!isNaN(timestamp)) {
        const timestampLength = timestamp.toString().length;
        date = timestampLength === 10
          ? new Date(timestamp * 1000)
          : new Date(timestamp);
      } else {
        return "N/A";
      }
    }
  } else if (typeof dateValue === "number") {
    // Handle timestamp (seconds or milliseconds)
    const timestampLength = dateValue.toString().length;
    if (timestampLength === 10) {
      // Seconds timestamp - convert to milliseconds
      date = new Date(dateValue * 1000);
    } else if (timestampLength === 13) {
      // Milliseconds timestamp
      date = new Date(dateValue);
    } else {
      // Try as milliseconds if less than a reasonable threshold
      const year2000 = 946684800000; // Jan 1, 2000 in milliseconds
      if (dateValue > year2000) {
        date = new Date(dateValue);
      } else {
        // Assume seconds if it's a smaller number
        date = new Date(dateValue * 1000);
      }
    }
  } else {
    return "N/A";
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "N/A";
  }

  // Format as DD-MM-YYYY
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Transform API response data to component format
 *
 * Converts API response structure to the format expected by the UI components.
 * Handles date formatting and ensures all required fields are present.
 *
 * @param {Object} apiData - API response data object
 * @param {Array} apiData.items - Array of expert items from API
 * @returns {Array} Transformed array of expert objects for UI display
 */
const transformExpertData = (apiData) => {
  if (!apiData?.items) return [];

  return apiData.items.map((item) => {
    // Combine first_name and last_name for Name field
    const fullName = [item.first_name, item.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || item.name || "N/A";

    // Handle contact number with country code
    const contactNumber = item.contact_number || item.contact || "";
    const contactCountryCode = item.contact_country_code || "";
    const contactDisplay = contactCountryCode && contactNumber
      ? `${contactCountryCode} ${contactNumber}`
      : contactNumber || "N/A";

    // Handle address
    const address = item.address || {};
    const country = address.country || item.country || "N/A";
    const city = address.city || "N/A";
    const state = address.state || "N/A";

    // Handle created_on date (can be ISO string or timestamp)
    const createdOn = item.created_on || item.createdAt || item.created_at;
    const updatedOn = item.updated_on || item.updatedAt || item.updated_at;

    return {
      id: item.id,
      name: fullName, // Combined first_name + last_name
      firstName: item.first_name,
      lastName: item.last_name,
      email: item.email || "N/A",
      contact: contactDisplay,
      contactNumber: contactNumber,
      contactCountryCode: contactCountryCode,
      country: country,
      city: city,
      state: state,
      address: address,
      expertise: item.expertise || "N/A",
      subscriptionPlan: item.subscription_plan || "N/A",
      isExpertApproved: item.is_expert_approved || false,
      paymentDetails: item.payment_details || {},
      socialMedia: item.social_media || {},
      username: item.username || item.email || "N/A",
      createDate: formatDate(createdOn),
      createdAt: createdOn,
      updatedOn: updatedOn,
      updatedDate: formatDate(updatedOn),
      appliedJobsCount: item.appliedJobsCount || 0,
      action: { id: item.id },
    };
  });
};

/**
 * Hook for expert operations
 *
 * This hook provides all CRUD operations for experts,
 * including pagination, sorting, and search functionality.
 *
 * @returns {Object} Expert operations and state
 * @returns {Array} experts - List of experts
 * @returns {boolean} loading - Loading state
 * @returns {Object} pagination - Pagination state (current, pageSize, total)
 * @returns {string} searchQuery - Current search query
 * @returns {string} sortBy - Current sort field
 * @returns {string} order - Current sort order (asc/desc)
 * @returns {Function} setSearchQuery - Set search query
 * @returns {Function} setSortBy - Set sort field
 * @returns {Function} setOrder - Set sort order
 * @returns {Function} fetchExperts - Fetch experts with pagination and sorting
 * @returns {Function} createExpert - Create a new expert
 * @returns {Function} updateExpert - Update an existing expert
 * @returns {Function} deleteExpert - Delete an expert
 * @returns {Function} handleSort - Handle sorting change
 * @returns {Function} setUseMockData - Toggle between mock and real API
 */
export const useExpert = () => {
  // State for experts list
  const [experts, setExperts] = useState([]);

  // Loading state for API operations
  const [loading, setLoading] = useState(false);

  // Error state for API operations
  const [error, setError] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1, // Current page number
    pageSize: 10, // Items per page
    total: 0, // Total number of items
  });

  // Search query state - used for filtering experts by name, email, country
  const [searchQuery, setSearchQuery] = useState("");

  // Sorting state - controls how experts are sorted in the table
  const [sortBy, setSortBy] = useState("name"); // Default sort by name field
  const [order, setOrder] = useState("asc"); // Default order: ascending

  // Ref to store debounce timer for search optimization
  const searchDebounceTimerRef = useRef(null);

  // Mock data toggle - Set to false to use real API calls
  // When ready to use real API, change this to false or remove the useMockData state
  // Default is false to make real API calls - set to true only for development/testing
  const [useMockData, setUseMockData] = useState(false);

  /**
   * Fetch experts from API with pagination, sorting, and search support
   *
   * API Endpoint: GET /experts?page=1&limit=10&sortBy=name&order=asc
   *
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: current page)
   * @param {number} params.limit - Items per page (default: current pageSize)
   * @param {string} params.sortBy - Field to sort by (default: "name")
   * @param {string} params.order - Sort order: "asc" or "desc" (default: "asc")
   * @param {string} params.search - Search query (default: current searchQuery)
   * @returns {Promise<void>}
   */
  const fetchExperts = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        let response;

        // Prepare API parameters with defaults
        // Empty strings will be filtered out by the API utility
        const apiParams = {
          page: params.page || pagination.current,
          limit: params.limit || pagination.pageSize,
          sortBy: params.sortBy || sortBy,
          order: params.order || order,
          // Only include search if it has a value (empty strings will be filtered by API utility)
          search: params.search !== undefined ? params.search : searchQuery,
        };

        if (useMockData) {
          // Use mock data for development/testing
          console.log(
            "🔵 MOCK MODE: Fetch experts (no API call)",
            apiParams
          );
          response = MOCK_RESPONSE;
        } else {
          // Call actual API with pagination, sorting, and search parameters
          // Endpoint: /experts?page=1&limit=10&sortBy=name&order=asc
          console.log("🟢 API CALL: GET /experts", { params: apiParams });
          response = await expertService.getExperts(apiParams);
          console.log("✅ API Response:", response);
        }

        // Process successful response
        // Handle different response structures
        let responseData = null;
        if (response?.success && response?.data) {
          // Check if data has items directly or nested
          if (response.data.items) {
            responseData = response.data;
          } else if (response.data.data && response.data.data.items) {
            // Nested data structure
            responseData = response.data.data;
          } else if (Array.isArray(response.data)) {
            // If data is directly an array
            responseData = {
              items: response.data,
              total: response.data.length,
              page: 1,
              limit: response.data.length,
              totalPages: 1,
            };
          } else {
            responseData = response.data;
          }
        }

        if (responseData && responseData.items) {
          console.log("🔄 Transforming expert data, items count:", responseData.items.length);
          const transformedData = transformExpertData(responseData);
          console.log("✨ Transformed expert data:", transformedData);
          setExperts(transformedData);

          // Update pagination state from API response
          setPagination({
            current: responseData.page || 1,
            pageSize: responseData.limit || 10,
            total: responseData.total || 0,
          });

          // Update search query state
          if (params.search !== undefined) {
            setSearchQuery(params.search);
          }

          // Update sorting state if provided in params
          if (params.sortBy) setSortBy(params.sortBy);
          if (params.order) setOrder(params.order);
        } else {
          console.warn("⚠️ No items found in expert response. Response structure:", response);
          setExperts([]);
          setPagination({
            current: 1,
            pageSize: 10,
            total: 0,
          });
        }
      } catch (error) {
        // Error handling: Set error state and show user-friendly message
        console.error("Error fetching experts:", error);
        setError(error);

        // Show error message to user
        const errorMessage =
          error.message || "Failed to fetch experts. Please try again.";
        message.error(errorMessage);

        // Fallback to mock data on error (only if using real API)
        // This allows UI to continue working even if API fails
        if (!useMockData) {
          console.warn("Falling back to mock data due to API error");
          const transformedData = transformExpertData(MOCK_RESPONSE.data);
          setExperts(transformedData);
        } else {
          // Clear experts on error if using mock data
          setExperts([]);
        }
      } finally {
        // Always reset loading state, even on error
        setLoading(false);
      }
    },
    [
      useMockData,
      pagination.current,
      pagination.pageSize,
      searchQuery,
      sortBy,
      order,
    ]
  );

  /**
   * Create a new expert
   *
   * API Endpoint: POST /experts
   * Payload: { "name": "string", "email": "string", "contact": "string", "country": "string" }
   *
   * @param {Object} expertData - Expert data from form
   * @param {string} expertData.name - Name of the expert
   * @param {string} expertData.email - Email of the expert
   * @param {string} expertData.contact - Contact number
   * @param {string} expertData.country - Country
   * @returns {Promise<Object>} Created expert response
   * @throws {Error} If creation fails
   */
  const createExpert = useCallback(
    async (expertData) => {
      setLoading(true);
      setError(null);

      try {
        let response;

        if (useMockData) {
          // Mock create - just show success message for development
          console.log("🔵 MOCK MODE: Create expert (no API call)", expertData);
          response = { success: true };
        } else {
          // Call actual API to create expert
          // Payload format: { "name": "string", "email": "string", "contact": "string", "country": "string" }
          console.log("🟢 API CALL: POST /experts", {
            payload: expertData,
          });
          response = await expertService.createExpert(expertData);
          console.log("✅ API Response:", response);
        }

        // Show success message
        message.success("Expert created successfully");

        // Refresh the list to show the newly created expert
        await fetchExperts();

        return response;
      } catch (error) {
        console.error("Error creating expert:", error);
        setError(error);
        message.error(error.message || "Failed to create expert");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, fetchExperts]
  );

  /**
   * Update an existing expert
   *
   * API Endpoint: PUT /experts/{id}
   * Payload matches signup form structure:
   * {
   *   "first_name": "string",
   *   "last_name": "string",
   *   "email": "string",
   *   "contact_country_code": "string",
   *   "contact_number": "string",
   *   "username": "string",
   *   "expertise": "string",
   *   "address": {
   *     "country": "string",
   *     "state": "string",
   *     "location": "string",
   *     "city": "string",
   *     "postal_code": "string"
   *   },
   *   "social_media": {
   *     "facebook": "string",
   *     "instagram": "string",
   *     "linkedin": "string"
   *   }
   * }
   *
   * States:
   * - Loading: Shows loader during API call
   * - Error: Shows error message on failure
   * - Success: Shows success message and refreshes list
   *
   * @param {number} expertId - ID of the expert to update
   * @param {Object} expertData - Updated expert data from form (matches signup form structure)
   * @returns {Promise<Object>} Updated expert response
   * @throws {Error} If update fails
   */
  const updateExpert = useCallback(
    async (expertId, expertData) => {
      // ✅ Set loading state - show loader
      setLoading(true);
      // ✅ Reset error state
      setError(null);

      try {
        let response;

        if (useMockData) {
          // Mock update - just show success message for development
          console.log("🔵 MOCK MODE: Update expert (no API call)", {
            expertId,
            expertData,
          });
          response = { success: true };
        } else {
          // ✅ Call actual API to update expert
          // Endpoint: PUT /experts/{id}
          // Payload matches signup form structure
          console.log("🟢 API CALL: PUT /experts/{id}", {
            expertId,
            payload: expertData,
          });
          response = await expertService.updateExpert(expertId, expertData);
          console.log("✅ API Response:", response);
        }

        // ✅ Success state - show success message
        message.success("Expert updated successfully");

        // ✅ Refresh list to show updated data
        await fetchExperts();

        return response;
      } catch (error) {
        // ✅ Error state - set error and show error message
        console.error("Error updating expert:", error);
        setError(error);
        message.error(error.message || "Failed to update expert");
        throw error;
      } finally {
        // ✅ Always reset loading state
        setLoading(false);
      }
    },
    [useMockData, fetchExperts]
  );

  /**
   * Update expert approval status
   *
   * API Endpoint: PATCH /experts/{id}
   * Payload: { "is_expert_approved": true/false }
   *
   * States:
   * - Loading: Shows loader during API call
   * - Error: Shows error message on failure
   * - Success: Shows success message and refreshes list
   *
   * @param {number} expertId - ID of the expert
   * @param {boolean} isApproved - Approval status (true for approved, false for pending)
   * @returns {Promise<Object>} Updated expert response
   * @throws {Error} If update fails
   */
  const updateApprovalStatus = useCallback(
    async (expertId, isApproved) => {
      // ✅ Set loading state - show loader
      setLoading(true);
      // ✅ Reset error state
      setError(null);

      try {
        let response;

        if (useMockData) {
          // Mock update - just show success message for development
          console.log("🔵 MOCK MODE: Update approval status (no API call)", {
            expertId,
            isApproved,
          });
          response = { success: true };
        } else {
          // ✅ Call actual API to update approval status
          // Endpoint: PATCH /experts/{id}
          // Payload: { "is_expert_approved": true/false }
          console.log("🟢 API CALL: PATCH /experts/{id}", {
            expertId,
            payload: { is_expert_approved: isApproved },
          });
          response = await expertService.updateApprovalStatus(expertId, isApproved);
          console.log("✅ API Response:", response);
        }

        // ✅ Success state - show success message
        message.success(
          `Expert ${isApproved ? "approved" : "pending"} successfully`
        );

        // ✅ Refresh list to show updated data
        await fetchExperts();

        return response;
      } catch (error) {
        // ✅ Error state - set error and show error message
        console.error("Error updating approval status:", error);
        setError(error);
        message.error(
          error.message || "Failed to update expert approval status"
        );
        throw error;
      } finally {
        // ✅ Always reset loading state
        setLoading(false);
      }
    },
    [useMockData, fetchExperts]
  );

  /**
   * Delete an expert
   *
   * API Endpoint: DELETE /experts/{id}
   *
   * States:
   * - Loading: Shows loader during API call
   * - Error: Shows error message on failure
   * - Success: Shows success message and refreshes list
   *
   * @param {number} expertId - ID of the expert to delete
   * @returns {Promise<Object>} Deletion response
   * @throws {Error} If deletion fails
   */
  const deleteExpert = useCallback(
    async (expertId) => {
      // ✅ Set loading state - show loader
      setLoading(true);
      // ✅ Reset error state
      setError(null);

      try {
        let response;

        if (useMockData) {
          // Mock delete - just show success message for development
          console.log("🔵 MOCK MODE: Delete expert (no API call)", {
            expertId,
          });
          response = { success: true };
        } else {
          // ✅ Call actual API to delete expert
          // Endpoint: DELETE /experts/{id}
          console.log("🟢 API CALL: DELETE /experts/{id}", { expertId });
          response = await expertService.deleteExpert(expertId);
          console.log("✅ API Response:", response);
        }

        // ✅ Success state - show success message
        message.success("Expert deleted successfully");

        // ✅ Refresh list to show updated data (removed expert)
        await fetchExperts();

        return response;
      } catch (error) {
        // ✅ Error state - set error and show error message
        console.error("Error deleting expert:", error);
        setError(error);
        message.error(error.message || "Failed to delete expert");
        throw error;
      } finally {
        // ✅ Always reset loading state
        setLoading(false);
      }
    },
    [useMockData, fetchExperts]
  );

  /**
   * Handle sorting change
   *
   * Updates sorting state and refetches experts with new sort parameters.
   * Automatically resets to first page when sorting changes.
   *
   * @param {string} field - Field to sort by (e.g., "name", "createdAt")
   * @param {string} sortOrder - Sort order: "asc" (ascending) or "desc" (descending)
   *
   * @example
   * handleSort("name", "asc"); // Sort by name ascending
   * handleSort("createdAt", "desc"); // Sort by creation date descending
   */
  const handleSort = useCallback(
    (field, sortOrder) => {
      // Validate sort parameters
      if (!field || !sortOrder) {
        console.warn("Invalid sort parameters:", { field, sortOrder });
        return;
      }

      // Update sorting state
      setSortBy(field);
      setOrder(sortOrder);

      // Refetch with new sort parameters
      // Reset to first page when sorting changes for better UX
      fetchExperts({
        page: 1,
        sortBy: field,
        order: sortOrder,
      });
    },
    [fetchExperts]
  );

  /**
   * Initial data fetch on component mount
   *
   * Fetches experts when the hook is first used.
   * Only runs once on mount to avoid unnecessary API calls.
   */
  useEffect(() => {
    fetchExperts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  return {
    // State
    experts,
    loading,
    error,
    pagination,
    searchQuery,
    sortBy,
    order,

    // Setters
    setSearchQuery,
    setSortBy,
    setOrder,

    // Operations
    fetchExperts,
    createExpert,
    updateExpert,
    updateApprovalStatus,
    deleteExpert,
    handleSort,

    // Configuration
    setUseMockData, // Allow toggling between mock and real API
  };
};












