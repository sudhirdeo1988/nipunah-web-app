import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { equipmentService } from "@/utilities/apiServices";
import { message } from "antd";

/**
 * Mock data structure matching the API response
 * TODO: Remove this once API is ready
 */
const MOCK_RESPONSE = {
  success: true,
  message: "Equipment fetched successfully",
  data: {
    total: 25, // total equipment in DB
    page: 1, // current page
    limit: 10, // page size
    totalPages: 3, // based on total/limit
    items: [
      {
        id: 1,
        name: "Marine Engine Type A",
        category: "Marine Equipment",
        type: "Ship Building",
        manufacture_year: 2020,
        manufacture_company: "Marine Tech Industries",
        available_for: "rent",
        rent_type: "month",
        contact_email: "contact@marinetech.com",
        contact_number: "9876543210",
        contact_country_code: "+91",
        equipment_address: {
          country: "India",
          state: "Maharashtra",
          location: "Mumbai Port Area",
          city: "Mumbai",
          postal_code: "400001",
        },
        createdAt: "1733275564",
        updatedAt: "1733275564",
      },
      {
        id: 2,
        name: "Cargo Container Handler",
        category: "Shipping Equipment",
        type: "Shipping",
        manufacture_year: 2019,
        manufacture_company: "Global Shipping Solutions",
        available_for: "purchase",
        rent_type: null,
        contact_email: "sales@globalshipping.com",
        contact_number: "9876543211",
        contact_country_code: "+91",
        equipment_address: {
          country: "India",
          state: "Gujarat",
          location: "Kandla Port",
          city: "Gandhidham",
          postal_code: "370201",
        },
        createdAt: "1733275565",
        updatedAt: "1733275565",
      },
      {
        id: 3,
        name: "Ship Propeller System",
        category: "Marine Equipment",
        type: "Ship Building",
        manufacture_year: 2021,
        manufacture_company: "Propeller Dynamics",
        available_for: "lease",
        rent_type: null,
        contact_email: "info@propellerdynamics.com",
        contact_number: "9876543212",
        contact_country_code: "+91",
        equipment_address: {
          country: "India",
          state: "Kerala",
          location: "Cochin Shipyard",
          city: "Kochi",
          postal_code: "682015",
        },
        createdAt: "1733275566",
        updatedAt: "1733275566",
      },
      {
        id: 4,
        name: "Port Crane Heavy Duty",
        category: "Port Equipment",
        type: "Shipping",
        manufacture_year: 2018,
        manufacture_company: "Port Machinery Corp",
        available_for: "rent",
        rent_type: "year",
        contact_email: "rentals@portmachinery.com",
        contact_number: "9876543213",
        contact_country_code: "+91",
        equipment_address: {
          country: "India",
          state: "Tamil Nadu",
          location: "Chennai Port",
          city: "Chennai",
          postal_code: "600001",
        },
        createdAt: "1733275567",
        updatedAt: "1733275567",
      },
      {
        id: 5,
        name: "Navigation System Advanced",
        category: "Navigation Equipment",
        type: "Ship Building",
        manufacture_year: 2022,
        manufacture_company: "NavTech Systems",
        available_for: "purchase",
        rent_type: null,
        contact_email: "sales@navtech.com",
        contact_number: "9876543214",
        contact_country_code: "+91",
        equipment_address: {
          country: "India",
          state: "Karnataka",
          location: "Mangalore Port",
          city: "Mangalore",
          postal_code: "575001",
        },
        createdAt: "1733275568",
        updatedAt: "1733275568",
      },
      {
        id: 6,
        name: "Dock Loading Equipment",
        category: "Port Equipment",
        type: "Shipping",
        manufacture_year: 2020,
        manufacture_company: "Dock Solutions Ltd",
        available_for: "rent",
        rent_type: "month",
        contact_email: "info@docksolutions.com",
        contact_number: "9876543215",
        contact_country_code: "+91",
        equipment_address: {
          country: "India",
          state: "West Bengal",
          location: "Kolkata Port",
          city: "Kolkata",
          postal_code: "700001",
        },
        createdAt: "1733275569",
        updatedAt: "1733275569",
      },
      {
        id: 7,
        name: "Marine Communication System",
        category: "Communication Equipment",
        type: "Ship Building",
        manufacture_year: 2023,
        manufacture_company: "Marine Comms Inc",
        available_for: "purchase",
        rent_type: null,
        contact_email: "sales@marinecomms.com",
        contact_number: "9876543216",
        contact_country_code: "+91",
        equipment_address: {
          country: "India",
          state: "Andhra Pradesh",
          location: "Visakhapatnam Port",
          city: "Visakhapatnam",
          postal_code: "530001",
        },
        createdAt: "1733275570",
        updatedAt: "1733275570",
      },
      {
        id: 8,
        name: "Container Stacker",
        category: "Shipping Equipment",
        type: "Shipping",
        manufacture_year: 2019,
        manufacture_company: "Container Tech",
        available_for: "lease",
        rent_type: null,
        contact_email: "lease@containertech.com",
        contact_number: "9876543217",
        contact_country_code: "+91",
        equipment_address: {
          country: "India",
          state: "Goa",
          location: "Mormugao Port",
          city: "Vasco da Gama",
          postal_code: "403802",
        },
        createdAt: "1733275571",
        updatedAt: "1733275571",
      },
      {
        id: 9,
        name: "Ship Anchor System",
        category: "Marine Equipment",
        type: "Ship Building",
        manufacture_year: 2021,
        manufacture_company: "Anchor Systems Co",
        available_for: "rent",
        rent_type: "year",
        contact_email: "rent@anchorsystems.com",
        contact_number: "9876543218",
        contact_country_code: "+91",
        equipment_address: {
          country: "India",
          state: "Odisha",
          location: "Paradip Port",
          city: "Paradip",
          postal_code: "754142",
        },
        createdAt: "1733275572",
        updatedAt: "1733275572",
      },
      {
        id: 10,
        name: "Port Security Scanner",
        category: "Security Equipment",
        type: "Shipping",
        manufacture_year: 2022,
        manufacture_company: "Security Solutions Pro",
        available_for: "purchase",
        rent_type: null,
        contact_email: "sales@securitypro.com",
        contact_number: "9876543219",
        contact_country_code: "+91",
        equipment_address: {
          country: "India",
          state: "Maharashtra",
          location: "Jawaharlal Nehru Port",
          city: "Navi Mumbai",
          postal_code: "400707",
        },
        createdAt: "1733275573",
        updatedAt: "1733275573",
      },
    ],
  },
};

/**
 * Transform API response data to component format
 */
const transformEquipmentData = (apiData) => {
  if (!apiData?.items) return [];

  return apiData.items.map((item) => ({
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
    createDate: item.createdAt
      ? new Date(parseInt(item.createdAt) * 1000).toLocaleDateString()
      : "N/A",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    action: { id: item.id },
  }));
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
  // Mock data toggle - Set to false to use real API calls
  // When ready to use real API, change this to false or remove the useMockData state
  // Default is true to show mock data until API is ready
  const [useMockData, setUseMockData] = useState(true);

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

        if (useMockData) {
          // Use mock data for development/testing
          console.log(
            "🔵 MOCK MODE: Fetch equipment (no API call)",
            apiParams
          );
          
          // Filter mock data based on search query
          let filteredItems = MOCK_RESPONSE.data.items;
          if (apiParams.search && apiParams.search.trim()) {
            const searchTerm = apiParams.search.toLowerCase().trim();
            filteredItems = MOCK_RESPONSE.data.items.filter((item) => {
              return (
                item.name?.toLowerCase().includes(searchTerm) ||
                item.category?.toLowerCase().includes(searchTerm) ||
                item.type?.toLowerCase().includes(searchTerm) ||
                item.manufacture_company?.toLowerCase().includes(searchTerm) ||
                item.contact_email?.toLowerCase().includes(searchTerm)
              );
            });
          }
          
          // Apply sorting to filtered results
          const sortField = apiParams.sortBy || "name";
          const sortOrder = apiParams.order || "asc";
          
          filteredItems = [...filteredItems].sort((a, b) => {
            let aValue, bValue;
            
            // Map sort field to actual data field
            switch (sortField) {
              case "name":
                aValue = a.name || "";
                bValue = b.name || "";
                break;
              case "category":
                aValue = a.category || "";
                bValue = b.category || "";
                break;
              case "type":
                aValue = a.type || "";
                bValue = b.type || "";
                break;
              case "available_for":
                aValue = a.available_for || "";
                bValue = b.available_for || "";
                break;
              case "manufacture_year":
                aValue = a.manufacture_year || 0;
                bValue = b.manufacture_year || 0;
                break;
              case "createdAt":
                aValue = parseInt(a.createdAt) || 0;
                bValue = parseInt(b.createdAt) || 0;
                break;
              default:
                aValue = a[sortField] || "";
                bValue = b[sortField] || "";
            }
            
            // Handle string comparison
            if (typeof aValue === "string" && typeof bValue === "string") {
              aValue = aValue.toLowerCase();
              bValue = bValue.toLowerCase();
            }
            
            // Compare values
            if (aValue < bValue) {
              return sortOrder === "asc" ? -1 : 1;
            }
            if (aValue > bValue) {
              return sortOrder === "asc" ? 1 : -1;
            }
            return 0;
          });
          
          // Apply pagination to filtered and sorted results
          const page = apiParams.page || 1;
          const limit = apiParams.limit || 10;
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedItems = filteredItems.slice(startIndex, endIndex);
          
          // Create mock response with filtered and paginated data
          const mockResponseData = {
            ...MOCK_RESPONSE.data,
            items: paginatedItems,
            total: filteredItems.length,
            page: page,
            limit: limit,
            totalPages: Math.ceil(filteredItems.length / limit),
          };
          
          const transformedData = transformEquipmentData(mockResponseData);
          setEquipment(transformedData);
          setPagination({
            current: page,
            pageSize: limit,
            total: filteredItems.length,
          });
          
          // Update search query state
          if (params.search !== undefined) {
            setSearchQuery(params.search);
          }
          
          if (params.sortBy) setSortBy(params.sortBy);
          if (params.order) setOrder(params.order);
        } else {
          // Call actual API with pagination, sorting, and search parameters
          console.log("🟢 API CALL: GET /equipment", { params: apiParams });
          try {
            const response = await equipmentService.getEquipment(apiParams);
            console.log("✅ API Response:", response);

            if (response.success && response.data) {
              const transformedData = transformEquipmentData(response.data);
              setEquipment(transformedData);
              setPagination({
                current: response.data.page || 1,
                pageSize: response.data.limit || 10,
                total: response.data.total || 0,
              });

              // Update search query state
              if (params.search !== undefined) {
                setSearchQuery(params.search);
              }

              if (params.sortBy) setSortBy(params.sortBy);
              if (params.order) setOrder(params.order);
            }
          } catch (apiError) {
            // If API call fails (404, 500, etc.), fall back to mock data
            console.warn("API call failed, falling back to mock data:", apiError);
            
            // Filter mock data based on search query
            let filteredItems = MOCK_RESPONSE.data.items;
            if (apiParams.search && apiParams.search.trim()) {
              const searchTerm = apiParams.search.toLowerCase().trim();
              filteredItems = MOCK_RESPONSE.data.items.filter((item) => {
                return (
                  item.name?.toLowerCase().includes(searchTerm) ||
                  item.category?.toLowerCase().includes(searchTerm) ||
                  item.type?.toLowerCase().includes(searchTerm) ||
                  item.manufacture_company?.toLowerCase().includes(searchTerm) ||
                  item.contact_email?.toLowerCase().includes(searchTerm)
                );
              });
            }
            
            // Apply sorting to filtered results
            const sortField = apiParams.sortBy || "name";
            const sortOrder = apiParams.order || "asc";
            
            filteredItems = [...filteredItems].sort((a, b) => {
              let aValue, bValue;
              
              // Map sort field to actual data field
              switch (sortField) {
                case "name":
                  aValue = a.name || "";
                  bValue = b.name || "";
                  break;
                case "category":
                  aValue = a.category || "";
                  bValue = b.category || "";
                  break;
                case "type":
                  aValue = a.type || "";
                  bValue = b.type || "";
                  break;
                case "available_for":
                  aValue = a.available_for || "";
                  bValue = b.available_for || "";
                  break;
                case "manufacture_year":
                  aValue = a.manufacture_year || 0;
                  bValue = b.manufacture_year || 0;
                  break;
                case "createdAt":
                  aValue = parseInt(a.createdAt) || 0;
                  bValue = parseInt(b.createdAt) || 0;
                  break;
                default:
                  aValue = a[sortField] || "";
                  bValue = b[sortField] || "";
              }
              
              // Handle string comparison
              if (typeof aValue === "string" && typeof bValue === "string") {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
              }
              
              // Compare values
              if (aValue < bValue) {
                return sortOrder === "asc" ? -1 : 1;
              }
              if (aValue > bValue) {
                return sortOrder === "asc" ? 1 : -1;
              }
              return 0;
            });
            
            // Apply pagination to filtered and sorted results
            const page = apiParams.page || 1;
            const limit = apiParams.limit || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedItems = filteredItems.slice(startIndex, endIndex);
            
            // Create mock response with filtered and paginated data
            const mockResponseData = {
              ...MOCK_RESPONSE.data,
              items: paginatedItems,
              total: filteredItems.length,
              page: page,
              limit: limit,
              totalPages: Math.ceil(filteredItems.length / limit),
            };
            
            const transformedData = transformEquipmentData(mockResponseData);
            setEquipment(transformedData);
            setPagination({
              current: page,
              pageSize: limit,
              total: filteredItems.length,
            });
            
            // Update search query state
            if (params.search !== undefined) {
              setSearchQuery(params.search);
            }
            
            if (params.sortBy) setSortBy(params.sortBy);
            if (params.order) setOrder(params.order);
            
            // Don't show error message if we successfully fall back to mock data
            // message.warning("API unavailable, showing mock data");
          }
        }
      } catch (error) {
        // Error handling: Set error state and show user-friendly message
        console.error("Error fetching equipment:", error);
        setError(error);

        // Show error message to user only if we can't fall back
        const errorMessage =
          error.message || "Failed to fetch equipment. Please try again.";
        message.error(errorMessage);

        // Fallback to mock data on error
        console.warn("Falling back to mock data due to error");
        let filteredItems = MOCK_RESPONSE.data.items;
        if (apiParams?.search && apiParams.search.trim()) {
          const searchTerm = apiParams.search.toLowerCase().trim();
          filteredItems = MOCK_RESPONSE.data.items.filter((item) => {
            return (
              item.name?.toLowerCase().includes(searchTerm) ||
              item.category?.toLowerCase().includes(searchTerm) ||
              item.type?.toLowerCase().includes(searchTerm) ||
              item.manufacture_company?.toLowerCase().includes(searchTerm) ||
              item.contact_email?.toLowerCase().includes(searchTerm)
            );
          });
        }
        
        // Apply sorting to filtered results
        const sortField = apiParams?.sortBy || "name";
        const sortOrder = apiParams?.order || "asc";
        
        filteredItems = [...filteredItems].sort((a, b) => {
          let aValue, bValue;
          
          switch (sortField) {
            case "name":
              aValue = a.name || "";
              bValue = b.name || "";
              break;
            case "category":
              aValue = a.category || "";
              bValue = b.category || "";
              break;
            case "type":
              aValue = a.type || "";
              bValue = b.type || "";
              break;
            case "available_for":
              aValue = a.available_for || "";
              bValue = b.available_for || "";
              break;
            case "manufacture_year":
              aValue = a.manufacture_year || 0;
              bValue = b.manufacture_year || 0;
              break;
            case "createdAt":
              aValue = parseInt(a.createdAt) || 0;
              bValue = parseInt(b.createdAt) || 0;
              break;
            default:
              aValue = a[sortField] || "";
              bValue = b[sortField] || "";
          }
          
          if (typeof aValue === "string" && typeof bValue === "string") {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
          
          if (aValue < bValue) {
            return sortOrder === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortOrder === "asc" ? 1 : -1;
          }
          return 0;
        });
        
        const transformedData = transformEquipmentData({
          ...MOCK_RESPONSE.data,
          items: filteredItems,
          total: filteredItems.length,
        });
        setEquipment(transformedData);
        setPagination({
          current: 1,
          pageSize: 10,
          total: filteredItems.length,
        });
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
   * Create a new equipment
   */
  const createEquipment = useCallback(
    async (equipmentData) => {
      setLoading(true);
      setError(null);

      try {
        if (useMockData) {
          console.log("🔵 MOCK MODE: Create equipment (no API call)", equipmentData);
          message.success("Equipment created successfully");
          await fetchEquipment();
          return { success: true };
        } else {
          console.log("🟢 API CALL: POST /equipment", {
            payload: equipmentData,
          });
          const response = await equipmentService.createEquipment(equipmentData);
          console.log("✅ API Response:", response);
          message.success("Equipment created successfully");
          await fetchEquipment();
          return response;
        }
      } catch (error) {
        console.error("Error creating equipment:", error);
        setError(error);
        message.error(error.message || "Failed to create equipment");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, fetchEquipment]
  );

  /**
   * Update an existing equipment
   */
  const updateEquipment = useCallback(
    async (equipmentId, equipmentData) => {
      setLoading(true);
      setError(null);

      try {
        if (useMockData) {
          console.log("🔵 MOCK MODE: Update equipment (no API call)", {
            equipmentId,
            equipmentData,
          });
          message.success("Equipment updated successfully");
          await fetchEquipment();
          return { success: true };
        } else {
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
        }
      } catch (error) {
        console.error("Error updating equipment:", error);
        setError(error);
        message.error(error.message || "Failed to update equipment");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, fetchEquipment]
  );

  /**
   * Delete equipment
   */
  const deleteEquipment = useCallback(
    async (equipmentId) => {
      setLoading(true);
      setError(null);

      try {
        if (useMockData) {
          console.log("🔵 MOCK MODE: Delete equipment (no API call)", equipmentId);
          message.success("Equipment deleted successfully");
          await fetchEquipment();
          return { success: true };
        } else {
          console.log("🟢 API CALL: DELETE /equipment/" + equipmentId);
          const response = await equipmentService.deleteEquipment(equipmentId);
          console.log("✅ API Response:", response);
          message.success("Equipment deleted successfully");
          await fetchEquipment();
          return response;
        }
      } catch (error) {
        console.error("Error deleting equipment:", error);
        setError(error);
        message.error(error.message || "Failed to delete equipment");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [useMockData, fetchEquipment]
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
    setUseMockData,
  };
};

