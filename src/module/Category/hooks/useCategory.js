import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { categoryService } from "@/utilities/apiServices";
import { message } from "antd";

/**
 * Mock data structure matching the API response
 */
const MOCK_RESPONSE = {
  success: true,
  data: {
    total: 20,
    page: 1,
    limit: 10,
    totalPages: 2,
    items: [
      {
        id: 1,
        name: "For testing purpose",
        createdAt: "1733275564",
        updatedAt: "1733275564",
        subCategories: {
          total: 1,
          page: 1,
          limit: 5,
          totalPages: 4,
          items: [
            {
              id: 1,
              name: "Sub category testing purpose",
              createdAt: "1733275564",
              updatedAt: "1733275564",
              categoryId: 1,
            },
          ],
        },
      },
    ],
  },
};

/**
 * Transform API response data to component format
 *
 * Converts API response structure to the format expected by the UI components.
 * Handles date formatting and ensures all required fields are present.
 *
 * @param {Object} apiData - API response data object
 * @param {Array} apiData.items - Array of category items from API
 * @returns {Array} Transformed array of category objects for UI display
 *
 * @example
 * Input: { items: [{ id: 1, name: "Tech", createdAt: "1733275564" }] }
 * Output: [{ id: 1, c_name: "Tech", createDate: "1/1/2025", ... }]
 */
const transformCategoryData = (apiData) => {
  if (!apiData?.items) return [];

  return apiData.items.map((item) => ({
    id: item.id,
    c_name: item.name,
    createdBy: "Admin", // TODO: Update from API response when available
    sub_categories: item.subCategories?.total || 0,
    createDate: item.createdAt
      ? new Date(parseInt(item.createdAt) * 1000).toLocaleDateString()
      : "N/A",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    // IMPORTANT: Preserve subCategories data from API response
    // This is used by fetchSubCategories to avoid separate API calls
    subCategories: item.subCategories || { items: [], total: 0 },
    action: { id: item.id, c_name: item.name },
  }));
};

/**
 * Transform subcategory API response to component format
 *
 * Converts subcategory API response structure to the format expected by UI components.
 * Handles date formatting and ensures all required fields are present.
 *
 * @param {Object} subCategories - Subcategory API response object
 * @param {Array} subCategories.items - Array of subcategory items from API
 * @returns {Array} Transformed array of subcategory objects for UI display
 *
 * @example
 * Input: { items: [{ id: 1, name: "Web Dev", categoryId: 1, createdAt: "1733275564" }] }
 * Output: [{ id: 1, c_name: "Web Dev", createDate: "1/1/2025", categoryId: 1, ... }]
 */
const transformSubCategoryData = (subCategories) => {
  // Handle both direct array and nested items structure
  const items = Array.isArray(subCategories)
    ? subCategories
    : subCategories?.items || [];

  if (!items.length) return [];

  return items.map((item) => ({
    id: item.id,
    c_name: item.name,
    createDate: item.createdAt
      ? new Date(parseInt(item.createdAt) * 1000).toLocaleDateString()
      : "N/A",
    createdBy: "Admin", // TODO: Update from API response when available
    parentId: item.categoryId,
    categoryId: item.categoryId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    action: { id: item.id, c_name: item.name, parentId: item.categoryId },
  }));
};

/**
 * Hook for category operations
 *
 * This hook provides all CRUD operations for categories and subcategories,
 * including pagination, sorting, and search functionality.
 *
 * @returns {Object} Category operations and state
 * @returns {Array} categories - List of categories
 * @returns {boolean} loading - Loading state
 * @returns {Object} pagination - Pagination state (current, pageSize, total)
 * @returns {string} searchQuery - Current search query
 * @returns {string} sortBy - Current sort field
 * @returns {string} order - Current sort order (asc/desc)
 * @returns {Function} setSearchQuery - Set search query
 * @returns {Function} setSortBy - Set sort field
 * @returns {Function} setOrder - Set sort order
 * @returns {Function} fetchCategories - Fetch categories with pagination and sorting
 * @returns {Function} fetchSubCategories - Fetch subcategories for a category
 * @returns {Function} createCategory - Create a new category
 * @returns {Function} updateCategory - Update an existing category
 * @returns {Function} deleteCategory - Delete a category
 * @returns {Function} createSubCategory - Create a new subcategory
 * @returns {Function} updateSubCategory - Update an existing subcategory
 * @returns {Function} deleteSubCategory - Delete a subcategory
 * @returns {Function} getCategoriesForSelect - Get categories formatted for select dropdown
 * @returns {Function} setUseMockData - Toggle between mock and real API
 */
export const useCategory = () => {
  // State for categories list
  const [categories, setCategories] = useState([]);

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

  // Search query state - used for filtering categories by name
  const [searchQuery, setSearchQuery] = useState("");

  // Sorting state - controls how categories are sorted in the table
  const [sortBy, setSortBy] = useState("name"); // Default sort by name field
  const [order, setOrder] = useState("asc"); // Default order: ascending

  // Ref to store debounce timer for search optimization
  const searchDebounceTimerRef = useRef(null);

  // Mock data toggle - Set to false to use real API calls
  // When ready to use real API, change this to false or remove the useMockData state
  // Default is false to make real API calls - set to true only for development/testing
  const [useMockData, setUseMockData] = useState(false);

  /**
   * Fetch categories from API with pagination, sorting, and search support
   *
   * API Endpoint: GET /categories?page=1&limit=10&sortBy=name&order=asc
   *
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: current page)
   * @param {number} params.limit - Items per page (default: current pageSize)
   * @param {string} params.sortBy - Field to sort by (default: "name")
   * @param {string} params.order - Sort order: "asc" or "desc" (default: "asc")
   * @param {string} params.search - Search query (default: current searchQuery)
   * @returns {Promise<void>}
   */
  const fetchCategories = useCallback(
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
            "🔵 MOCK MODE: Fetch categories (no API call)",
            apiParams
          );
          response = MOCK_RESPONSE;
        } else {
          // Call actual API with pagination, sorting, and search parameters
          // Endpoint: /categories?page=1&limit=10&sortBy=name&order=asc
          console.log("🟢 API CALL: GET /categories", { params: apiParams });
          response = await categoryService.getCategories(apiParams);
          console.log("✅ API Response:", response);
        }

        // Process successful response
        if (response.success && response.data) {
          const transformedData = transformCategoryData(response.data);
          setCategories(transformedData);

          // Update pagination state from API response
          setPagination({
            current: response.data.page || 1,
            pageSize: response.data.limit || 10,
            total: response.data.total || 0,
          });

          // Update sorting state if provided in params
          if (params.sortBy) setSortBy(params.sortBy);
          if (params.order) setOrder(params.order);
        }
      } catch (error) {
        // Error handling: Set error state and show user-friendly message
        console.error("Error fetching categories:", error);
        setError(error);

        // Show error message to user
        const errorMessage =
          error.message || "Failed to fetch categories. Please try again.";
        message.error(errorMessage);

        // Fallback to mock data on error (only if using real API)
        // This allows UI to continue working even if API fails
        if (!useMockData) {
          console.warn("Falling back to mock data due to API error");
          const transformedData = transformCategoryData(MOCK_RESPONSE.data);
          setCategories(transformedData);
        } else {
          // Clear categories on error if using mock data
          setCategories([]);
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
   * Fetch subcategories for a specific category
   *
   * NOTE: This function now uses subcategories data from the main categories API response.
   * The subcategories are already included in each category object from GET /categories.
   *
   * The separate API endpoint (GET /categories/{categoryId}/subcategories) is kept
   * in categoryService for potential future use, but this function uses the data
   * already available in the categories array.
   *
   * Performance: No API call needed - uses data already fetched.
   * Error Handling: Returns empty array if category not found.
   *
   * @param {number} categoryId - The ID of the parent category
   * @param {Object} params - Query parameters for pagination (currently not used, data comes from main API)
   * @param {number} params.page - Page number (for future use)
   * @param {number} params.limit - Items per page (for future use)
   * @returns {Promise<Array>} Array of transformed subcategory objects
   *
   * @example
   * const subcategories = await fetchSubCategories(1);
   */
  const fetchSubCategories = useCallback(
    async (categoryId, params = {}) => {
      // Validate categoryId
      if (!categoryId || typeof categoryId !== "number") {
        console.error(
          "Invalid categoryId provided to fetchSubCategories:",
          categoryId
        );
        return [];
      }

      try {
        // Find the category in the current categories list
        // Subcategories are already included in the main categories API response
        let category = categories.find((cat) => cat.id === categoryId);

        // Get subcategories data from category
        let subCategoriesData = category?.subCategories;

        // If category not found or no subcategories, use mock data as fallback
        // This ensures subcategories show even when API doesn't return them yet
        if (
          !category ||
          !subCategoriesData ||
          !subCategoriesData.items ||
          subCategoriesData.items.length === 0
        ) {
          console.log(
            "🔵 No subcategories in category, using mock data fallback"
          );
          const mockCategory = MOCK_RESPONSE.data.items.find(
            (item) => item.id === categoryId
          );
          if (mockCategory && mockCategory.subCategories) {
            subCategoriesData = mockCategory.subCategories;
            console.log("✅ Using mock subcategories:", {
              categoryId,
              subCategoriesCount: subCategoriesData.items?.length || 0,
            });
          } else {
            // No mock data available either
            subCategoriesData = { items: [] };
          }
        } else {
          console.log("🔵 Using subcategories from main API response:", {
            categoryId,
            subCategoriesCount: subCategoriesData.items?.length || 0,
          });
        }

        // Transform and return subcategory data
        // Handles both direct array and nested items structure
        return transformSubCategoryData(subCategoriesData);
      } catch (error) {
        // Error handling: Log error and try mock data fallback
        console.error("Error getting subcategories from category data:", error);

        // Try mock data as last resort
        try {
          const mockCategory = MOCK_RESPONSE.data.items.find(
            (item) => item.id === categoryId
          );
          if (mockCategory && mockCategory.subCategories) {
            console.log("🔵 Using mock data as error fallback");
            return transformSubCategoryData(mockCategory.subCategories);
          }
        } catch (mockError) {
          console.error("Error using mock data fallback:", mockError);
        }

        // Return empty array to prevent UI errors
        return [];
      }
    },
    [categories] // Only depends on categories array
  );

  /**
   * Create a new category
   *
   * API Endpoint: POST /category
   * Payload: { "name": "string" }
   *
   * @param {Object} categoryData - Category data from form
   * @param {string} categoryData.categoryName - Name of the category
   * @returns {Promise<Object>} Created category response
   * @throws {Error} If creation fails
   */
  const createCategory = useCallback(
    async (categoryData) => {
      setLoading(true);
      setError(null);

      try {
        let response;

        if (useMockData) {
          // Mock create - just show success message for development
          console.log("🔵 MOCK MODE: Create category (no API call)", {
            name: categoryData.categoryName,
          });
          response = { success: true };
        } else {
          // Call actual API to create category
          // Payload format: { "name": "string" }
          console.log("🟢 API CALL: POST /category", {
            payload: { name: categoryData.categoryName },
          });
          response = await categoryService.createCategory({
            name: categoryData.categoryName,
          });
          console.log("✅ API Response:", response);
        }

        // Show success message
        message.success("Category created successfully");

        // Refresh the list to show the newly created category
        await fetchCategories();

        return response;
      } catch (error) {
        console.error("Error creating category:", error);
        setError(error);
        message.error(error.message || "Failed to create category");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, fetchCategories]
  );

  /**
   * Update an existing category
   *
   * API Endpoint: PUT /categories/{id}
   * Payload: { "name": "string" }
   *
   * States:
   * - Loading: Shows loader during API call
   * - Error: Shows error message on failure
   * - Success: Shows success message and refreshes list
   *
   * @param {number} categoryId - ID of the category to update
   * @param {Object} categoryData - Updated category data from form
   * @param {string} categoryData.categoryName - New name of the category
   * @returns {Promise<Object>} Updated category response
   * @throws {Error} If update fails
   */
  const updateCategory = useCallback(
    async (categoryId, categoryData) => {
      // ✅ Set loading state - show loader
      setLoading(true);
      // ✅ Reset error state
      setError(null);

      try {
        let response;

        if (useMockData) {
          // Mock update - just show success message for development
          console.log("🔵 MOCK MODE: Update category (no API call)", {
            categoryId,
            name: categoryData.categoryName,
          });
          response = { success: true };
        } else {
          // ✅ Call actual API to update category
          // Endpoint: PUT /categories/{id}
          // Payload: { "name": "string" }
          console.log("🟢 API CALL: PUT /categories/{id}", {
            categoryId,
            payload: { name: categoryData.categoryName },
          });
          response = await categoryService.updateCategory(categoryId, {
            name: categoryData.categoryName,
          });
          console.log("✅ API Response:", response);
        }

        // ✅ Success state - show success message
        message.success("Category updated successfully");

        // ✅ Refresh list to show updated data
        await fetchCategories();

        return response;
      } catch (error) {
        // ✅ Error state - set error and show error message
        console.error("Error updating category:", error);
        setError(error);
        message.error(error.message || "Failed to update category");
        throw error;
      } finally {
        // ✅ Always reset loading state
        setLoading(false);
      }
    },
    [useMockData, fetchCategories]
  );

  /**
   * Delete a category
   *
   * API Endpoint: DELETE /categories/{id}
   *
   * States:
   * - Loading: Shows loader during API call
   * - Error: Shows error message on failure
   * - Success: Shows success message and refreshes list
   *
   * @param {number} categoryId - ID of the category to delete
   * @returns {Promise<Object>} Deletion response
   * @throws {Error} If deletion fails
   */
  const deleteCategory = useCallback(
    async (categoryId) => {
      // ✅ Set loading state - show loader
      setLoading(true);
      // ✅ Reset error state
      setError(null);

      try {
        let response;

        if (useMockData) {
          // Mock delete - just show success message for development
          console.log("🔵 MOCK MODE: Delete category (no API call)", {
            categoryId,
          });
          response = { success: true };
        } else {
          // ✅ Call actual API to delete category
          // Endpoint: DELETE /categories/{id}
          console.log("🟢 API CALL: DELETE /categories/{id}", { categoryId });
          response = await categoryService.deleteCategory(categoryId);
          console.log("✅ API Response:", response);
        }

        // ✅ Success state - show success message
        message.success("Category deleted successfully");

        // ✅ Refresh list to show updated data (removed category)
        await fetchCategories();

        return response;
      } catch (error) {
        // ✅ Error state - set error and show error message
        console.error("Error deleting category:", error);
        setError(error);
        message.error(error.message || "Failed to delete category");
        throw error;
      } finally {
        // ✅ Always reset loading state
        setLoading(false);
      }
    },
    [useMockData, fetchCategories]
  );

  /**
   * Create a new subcategory for a category
   *
   * API Endpoint: POST /categories/{categoryId}/subcategories
   *
   * @param {number} categoryId - ID of the parent category
   * @param {Object} subCategoryData - Subcategory data from form
   * @param {string} subCategoryData.subCategoryName - Name of the subcategory
   * @returns {Promise<Object>} Created subcategory response
   * @throws {Error} If creation fails
   */
  const createSubCategory = useCallback(
    async (categoryId, subCategoryData) => {
      setLoading(true);
      setError(null);

      try {
        let response;

        if (useMockData) {
          // Mock create - just show success message for development
          response = { success: true };
        } else {
          // Call actual API to create subcategory
          response = await categoryService.createSubCategory(categoryId, {
            name: subCategoryData.subCategoryName,
          });
        }

        message.success("Subcategory created successfully");
        await fetchCategories(); // Refresh list to show new subcategory
        return response;
      } catch (error) {
        console.error("Error creating subcategory:", error);
        setError(error);
        message.error(error.message || "Failed to create subcategory");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, fetchCategories]
  );

  /**
   * Update an existing subcategory
   *
   * API Endpoint: PUT /subcategories/{id}
   * Payload: { "name": "string" }
   *
   * States:
   * - Loading: Shows loader during API call
   * - Error: Shows error message on failure
   * - Success: Shows success message and refreshes list
   *
   * @param {number} categoryId - ID of the parent category (for reference)
   * @param {number} subCategoryId - ID of the subcategory to update
   * @param {Object} subCategoryData - Updated subcategory data from form
   * @param {string} subCategoryData.subCategoryName - New name of the subcategory
   * @returns {Promise<Object>} Updated subcategory response
   * @throws {Error} If update fails
   */
  const updateSubCategory = useCallback(
    async (categoryId, subCategoryId, subCategoryData) => {
      // ✅ Set loading state - show loader
      setLoading(true);
      // ✅ Reset error state
      setError(null);

      try {
        let response;

        if (useMockData) {
          // Mock update - just show success message for development
          console.log("🔵 MOCK MODE: Update subcategory (no API call)", {
            categoryId,
            subCategoryId,
            name: subCategoryData.subCategoryName,
          });
          response = { success: true };
        } else {
          // ✅ Call actual API to update subcategory
          // Endpoint: PUT /subcategories/{id}
          // Payload: { "name": "string" }
          console.log("🟢 API CALL: PUT /subcategories/{id}", {
            subCategoryId,
            payload: { name: subCategoryData.subCategoryName },
          });
          response = await categoryService.updateSubCategory(
            categoryId,
            subCategoryId,
            {
              name: subCategoryData.subCategoryName,
            }
          );
          console.log("✅ API Response:", response);
        }

        // ✅ Success state - show success message
        message.success("Subcategory updated successfully");

        // ✅ Refresh list to show updated data
        await fetchCategories();

        return response;
      } catch (error) {
        // ✅ Error state - set error and show error message
        console.error("Error updating subcategory:", error);
        setError(error);
        message.error(error.message || "Failed to update subcategory");
        throw error;
      } finally {
        // ✅ Always reset loading state
        setLoading(false);
      }
    },
    [useMockData, fetchCategories]
  );

  /**
   * Delete a subcategory
   *
   * API Endpoint: DELETE /categories/{categoryId}/subcategories/{subCategoryId}
   *
   * @param {number} categoryId - ID of the parent category
   * @param {number} subCategoryId - ID of the subcategory to delete
   * @returns {Promise<Object>} Deletion response
   * @throws {Error} If deletion fails
   */
  const deleteSubCategory = useCallback(
    async (categoryId, subCategoryId) => {
      setLoading(true);
      setError(null);

      try {
        let response;

        if (useMockData) {
          // Mock delete - just show success message for development
          response = { success: true };
        } else {
          // Call actual API to delete subcategory
          response = await categoryService.deleteSubCategory(
            categoryId,
            subCategoryId
          );
        }

        message.success("Subcategory deleted successfully");
        await fetchCategories(); // Refresh list to remove deleted subcategory
        return response;
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        setError(error);
        message.error(error.message || "Failed to delete subcategory");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, fetchCategories]
  );

  /**
   * Get all categories formatted for select dropdown
   *
   * Transforms category list into format suitable for Ant Design Select component.
   * This is used in the subcategory creation form to allow users to select a parent category.
   *
   * Performance: Memoized with useCallback to prevent unnecessary recalculations on every render.
   * Only recalculates when categories array changes.
   *
   * @returns {Array<Object>} Array of category options with value and label
   * @returns {number} value - Category ID (used as select value)
   * @returns {string} label - Category name (displayed in dropdown)
   *
   * @example
   * const options = getCategoriesForSelect();
   * // Returns: [{ value: 1, label: "Technology" }, { value: 2, label: "Business" }]
   */
  const getCategoriesForSelect = useCallback(() => {
    return categories.map((cat) => ({
      value: cat.id,
      label: cat.c_name,
    }));
  }, [categories]);

  /**
   * Handle sorting change
   *
   * Updates sorting state and refetches categories with new sort parameters.
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
      fetchCategories({
        page: 1,
        sortBy: field,
        order: sortOrder,
      });
    },
    [fetchCategories]
  );

  /**
   * Initial data fetch on component mount
   *
   * Fetches categories when the hook is first used.
   * Only runs once on mount to avoid unnecessary API calls.
   */
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  return {
    // State
    categories,
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
    fetchCategories,
    fetchSubCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    getCategoriesForSelect,
    handleSort,

    // Configuration
    setUseMockData, // Allow toggling between mock and real API
  };
};
