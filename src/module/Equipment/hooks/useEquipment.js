import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { equipmentService } from "@/utilities/apiServices";
import { message } from "antd";
import { useAppSelector } from "@/store/hooks";
import {
  mapApiEquipmentRecord,
  parseEquipmentListResponse,
} from "@/module/Equipment/utilities/equipmentMapper";

/**
 * Transform API list items to table row format.
 */
const transformEquipmentData = (apiData) => {
  const items = apiData?.items;
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const mapped = mapApiEquipmentRecord(item);
      if (!mapped?.id) return null;
      return {
        ...mapped,
        action: { id: mapped.id },
      };
    })
    .filter(Boolean);
};

/**
 * Hook for equipment operations.
 * @param {{ autoFetch?: boolean }} options - When true, loads list on mount (private dashboard)
 */
export const useEquipment = ({ autoFetch = false } = {}) => {
  const user = useAppSelector((state) => state.user?.user);
  const reduxRole = useAppSelector((state) => state.user?.role);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");

  const resolvedRole = useMemo(
    () => String(reduxRole || user?.role || user?.type || "").toLowerCase(),
    [reduxRole, user?.role, user?.type]
  );

  const isFetchingRef = useRef(false);
  const lastFetchKeyRef = useRef(null);
  const requestIdRef = useRef(0);
  const paginationRef = useRef(pagination);
  const sortByRef = useRef(sortBy);
  const orderRef = useRef(order);
  const searchQueryRef = useRef(searchQuery);

  paginationRef.current = pagination;
  sortByRef.current = sortBy;
  orderRef.current = order;
  searchQueryRef.current = searchQuery;

  useEffect(() => {
    if (!autoFetch) return;
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(timer);
  }, [autoFetch, searchQuery]);

  const loadEquipment = useCallback(
    async (params = {}, { force = false } = {}) => {
      if (autoFetch && !resolvedRole) return;

      const page = params.page ?? paginationRef.current.current;
      const limit = params.limit ?? paginationRef.current.pageSize;
      const nextSortBy = params.sortBy ?? sortByRef.current;
      const nextOrder = params.order ?? orderRef.current;
      const nextSearch =
        params.search !== undefined ? params.search : searchQueryRef.current;

      const fetchKey = [
        page,
        limit,
        nextSortBy,
        nextOrder,
        nextSearch,
        params.availableFor ?? "",
        params.location ?? "",
      ].join(":");

      if (!force && lastFetchKeyRef.current === fetchKey) return;
      if (isFetchingRef.current && !force) return;

      const currentRequestId = ++requestIdRef.current;
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const apiParams = {
          page,
          limit,
          sortBy: nextSortBy,
          order: nextOrder,
          search: nextSearch,
        };
        if (params.availableFor !== undefined && params.availableFor !== "") {
          apiParams.availableFor = params.availableFor;
        }
        if (params.location !== undefined && params.location !== "") {
          apiParams.location = params.location;
        }

        const response = await equipmentService.getEquipment(apiParams);

        if (currentRequestId !== requestIdRef.current) return;

        const responseData = parseEquipmentListResponse(response);
        const transformedData = transformEquipmentData(responseData);

        setEquipment(transformedData);
        setPagination({
          current: responseData.page || page,
          pageSize: responseData.limit || limit,
          total: responseData.total ?? transformedData.length,
        });

        if (params.sortBy) setSortBy(params.sortBy);
        if (params.order) setOrder(params.order);

        lastFetchKeyRef.current = fetchKey;
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;
        console.error("Error fetching equipment:", err);
        setError(err);
        message.error(err.message || "Failed to fetch equipment. Please try again.");
        setEquipment([]);
        setPagination({ current: 1, pageSize: 10, total: 0 });
      } finally {
        if (currentRequestId === requestIdRef.current) {
          isFetchingRef.current = false;
          setLoading(false);
        }
      }
    },
    [
      autoFetch,
      resolvedRole,
    ]
  );

  const fetchEquipment = useCallback(
    (params = {}) => loadEquipment(params, { force: true }),
    [loadEquipment]
  );

  useEffect(() => {
    if (!autoFetch) return;
    loadEquipment({ page: 1, search: debouncedSearch });
  }, [autoFetch, resolvedRole, debouncedSearch, loadEquipment]);

  const createEquipment = useCallback(
    async (equipmentData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await equipmentService.createEquipment(equipmentData);
        message.success("Equipment created successfully");
        lastFetchKeyRef.current = null;
        await loadEquipment({ page: 1, search: debouncedSearch }, { force: true });
        return response;
      } catch (err) {
        console.error("Error creating equipment:", err);
        setError(err);
        message.error(err.message || "Failed to create equipment");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadEquipment, debouncedSearch]
  );

  const updateEquipment = useCallback(
    async (equipmentId, equipmentData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await equipmentService.updateEquipment(
          equipmentId,
          equipmentData
        );
        message.success("Equipment updated successfully");
        lastFetchKeyRef.current = null;
        await loadEquipment({}, { force: true });
        return response;
      } catch (err) {
        console.error("Error updating equipment:", err);
        setError(err);
        message.error(err.message || "Failed to update equipment");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadEquipment]
  );

  const deleteEquipment = useCallback(
    async (equipmentId) => {
      setLoading(true);
      setError(null);
      try {
        if (equipmentId == null || equipmentId === "") {
          throw new Error("Equipment ID is missing for delete request");
        }
        await equipmentService.deleteEquipment(equipmentId);
        message.success("Equipment deleted successfully");
        lastFetchKeyRef.current = null;
        await loadEquipment({}, { force: true });
      } catch (err) {
        console.error("Error deleting equipment:", err);
        setError(err);
        message.error(err.message || "Failed to delete equipment");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadEquipment]
  );

  const handleSort = useCallback(
    (field, sortOrder) => {
      if (!field || !sortOrder) return;
      setSortBy(field);
      setOrder(sortOrder);
      lastFetchKeyRef.current = null;
      loadEquipment({ page: 1, sortBy: field, order: sortOrder }, { force: true });
    },
    [loadEquipment]
  );

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
