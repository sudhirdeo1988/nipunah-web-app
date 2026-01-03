import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { equipmentService } from "@/utilities/apiServices";
import { message } from "antd";

/**
 * Transform API response data to component format
 */
const transformEquipmentData = (apiData) => {
  console.log("🔄 transformEquipmentData called with:", apiData);

  if (!apiData) {
    console.warn("⚠️ No apiData provided");
    return [];
  }

  if (!apiData.items) {
    console.warn(
      "⚠️ No items in apiData. Available keys:",
      Object.keys(apiData)
    );
    return [];
  }

  if (!Array.isArray(apiData.items)) {
    console.warn("⚠️ items is not an array. Type:", typeof apiData.items);
    return [];
  }

  console.log(`📋 Transforming ${apiData.items.length} items`);

  const transformed = apiData.items
    .map((item, index) => {
      if (!item) {
        console.warn(`⚠️ Item at index ${index} is null/undefined`);
        return null;
      }

      // Log available fields for first item to debug
      if (index === 0) {
        console.log("🔍 First item fields:", Object.keys(item));
        console.log("🔍 Date-related fields:", {
          createdAt: item.createdAt,
          created_at: item.created_at,
          created_on: item.created_on,
          updatedAt: item.updatedAt,
          updated_at: item.updated_at,
          updated_on: item.updated_on,
        });
      }

      // Handle both camelCase and snake_case field names from API
      const createdAt = item.createdAt || item.created_at || item.created_on;
      const updatedAt = item.updatedAt || item.updated_at || item.updated_on;

      // Format date to DD-MM-YYYY
      // Handles both ISO date strings and timestamps (seconds/milliseconds)
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
              date =
                timestampLength === 10
                  ? new Date(timestamp * 1000)
                  : new Date(timestamp);
            } else {
              console.warn(
                `⚠️ Invalid date string for item ${index + 1}:`,
                dateValue
              );
              return "N/A";
            }
          }
        } else if (typeof dateValue === "number") {
          // Handle timestamp (seconds or milliseconds)
          // Timestamps in seconds are typically 10 digits (before year 2286)
          // Timestamps in milliseconds are typically 13 digits
          const timestampLength = dateValue.toString().length;
          if (timestampLength === 10) {
            // Seconds timestamp - convert to milliseconds
            date = new Date(dateValue * 1000);
          } else if (timestampLength === 13) {
            // Milliseconds timestamp
            date = new Date(dateValue);
          } else {
            // Try as milliseconds if less than a reasonable threshold
            // (assuming timestamps after year 2000)
            const year2000 = 946684800000; // Jan 1, 2000 in milliseconds
            if (dateValue > year2000) {
              date = new Date(dateValue);
            } else {
              // Assume seconds if it's a smaller number
              date = new Date(dateValue * 1000);
            }
          }
        } else {
          console.warn(
            `⚠️ Unsupported date type for item ${index + 1}:`,
            typeof dateValue,
            dateValue
          );
          return "N/A";
        }

        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn(
            `⚠️ Invalid date for item ${index + 1}:`,
            dateValue,
            "->",
            date
          );
          return "N/A";
        }

        // Format as DD-MM-YYYY
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const transformedItem = {
        id: item.id,
        name: item.name,
        category: item.category,
        type: item.type,
        about: item.about,
        manufactureYear: item.manufacture_year,
        manufactureCompany: item.manufacture_company,
        availableFor: item.available_for,
        rentType: item.rent_type,
        contactEmail: item.contact_email,
        contactNumber: item.contact_number,
        contact_country_code: item.contact_country_code,
        address: item.equipment_address || item.address,
        createDate: formatDate(createdAt),
        createdAt: createdAt,
        updatedAt: updatedAt,
        action: { id: item.id },
      };

      console.log(`✅ Transformed item ${index + 1}:`, transformedItem);
      return transformedItem;
    })
    .filter((item) => item !== null); // Remove null items

  console.log(`✨ Final transformed array length: ${transformed.length}`);
  return transformed;
};

/**
 * Hook for equipment operations
 */
export const useEquipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const searchDebounceTimerRef = useRef(null);

  /**
   * Fetch equipment from API with pagination, sorting, and search support
   */
  const fetchEquipment = useCallback(
    async (params = {}) => {
      setLoading(true);
      let apiParams;
      try {
        apiParams = {
          page: params.page || pagination.current,
          limit: params.limit || pagination.pageSize,
          sortBy: params.sortBy || sortBy,
          order: params.order || order,
          search: params.search !== undefined ? params.search : searchQuery,
        };

        // Call API with pagination, sorting, and search parameters
        console.log("🟢 API CALL: GET /equipment", { params: apiParams });
        const response = await equipmentService.getEquipment(apiParams);
        console.log("✅ API Response:", response);
        console.log("📦 Response structure:", {
          success: response?.success,
          hasData: !!response?.data,
          dataType: typeof response?.data,
          dataKeys: response?.data ? Object.keys(response?.data) : [],
          items: response?.data?.items,
          itemsLength: response?.data?.items?.length,
        });

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
          }
        }

        if (responseData && responseData.items) {
          console.log(
            "🔄 Transforming data, items count:",
            responseData.items.length
          );
          const transformedData = transformEquipmentData(responseData);
          console.log("✨ Transformed data:", transformedData);
          setEquipment(transformedData);
          setPagination({
            current: responseData.page || 1,
            pageSize: responseData.limit || 10,
            total: responseData.total || 0,
          });

          // Update search query state
          if (params.search !== undefined) {
            setSearchQuery(params.search);
          }

          if (params.sortBy) setSortBy(params.sortBy);
          if (params.order) setOrder(params.order);
        } else {
          console.warn(
            "⚠️ No items found in response. Response structure:",
            response
          );
          setEquipment([]);
          setPagination({
            current: 1,
            pageSize: 10,
            total: 0,
          });
        }
      } catch (error) {
        // Error handling: Set error state and show user-friendly message
        console.error("Error fetching equipment:", error);
        setError(error);

        // Show error message to user
        const errorMessage =
          error.message || "Failed to fetch equipment. Please try again.";
        message.error(errorMessage);
      } finally {
        // Always reset loading state, even on error
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize, searchQuery, sortBy, order]
  );

  /**
   * Create a new equipment
   */
  const createEquipment = useCallback(
    async (equipmentData) => {
      setLoading(true);
      setError(null);

      try {
        console.log("🟢 API CALL: POST /equipment", {
          payload: equipmentData,
        });
        const response = await equipmentService.createEquipment(equipmentData);
        console.log("✅ API Response:", response);
        message.success("Equipment created successfully");
        await fetchEquipment();
        return response;
      } catch (error) {
        console.error("Error creating equipment:", error);
        setError(error);
        message.error(error.message || "Failed to create equipment");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchEquipment]
  );

  /**
   * Update an existing equipment
   */
  const updateEquipment = useCallback(
    async (equipmentId, equipmentData) => {
      setLoading(true);
      setError(null);

      try {
        console.log("🟢 API CALL: PUT /equipment/" + equipmentId, {
          payload: equipmentData,
        });
        const response = await equipmentService.updateEquipment(
          equipmentId,
          equipmentData
        );
        console.log("✅ API Response:", response);
        message.success("Equipment updated successfully");
        await fetchEquipment();
        return response;
      } catch (error) {
        console.error("Error updating equipment:", error);
        setError(error);
        message.error(error.message || "Failed to update equipment");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchEquipment]
  );

  /**
   * Delete equipment
   */
  const deleteEquipment = useCallback(
    async (equipmentId) => {
      setLoading(true);
      setError(null);

      try {
        console.log("🟢 API CALL: DELETE /equipment/" + equipmentId);
        const response = await equipmentService.deleteEquipment(equipmentId);
        console.log("✅ API Response:", response);
        message.success("Equipment deleted successfully");
        await fetchEquipment();
        return response;
      } catch (error) {
        console.error("Error deleting equipment:", error);
        setError(error);
        message.error(error.message || "Failed to delete equipment");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchEquipment]
  );

  /**
   * Handle sorting change
   */
  const handleSort = useCallback(
    (field, sortOrder) => {
      if (!field || !sortOrder) {
        console.warn("Invalid sort parameters:", { field, sortOrder });
        return;
      }
      setSortBy(field);
      setOrder(sortOrder);
      fetchEquipment({
        page: 1,
        sortBy: field,
        order: sortOrder,
      });
    },
    [fetchEquipment]
  );

  /**
   * Initial data fetch on component mount
   */
  useEffect(() => {
    fetchEquipment();
  }, []);

  return {
    equipment,
    loading,
    error,
    pagination,
    searchQuery,
    sortBy,
    order,
    setSearchQuery,
    setSortBy,
    setOrder,
    fetchEquipment,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    handleSort,
  };
};
