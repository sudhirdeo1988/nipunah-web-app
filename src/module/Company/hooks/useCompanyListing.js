"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { message } from "antd";
import { companyService } from "@/utilities/apiServices";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCategories,
  setCategoriesLoading,
  setCategoriesError,
} from "@/store/slices/categoriesSlice";

const MIN_SEARCH_LENGTH = 4;

/** Parse GET /companies response into { items, total } */
function parseCompaniesResponse(res) {
  if (!res) return { items: [], total: 0 };
  if (Array.isArray(res)) return { items: res, total: res.length };
  if (res.data?.items && Array.isArray(res.data.items)) {
    return {
      items: res.data.items,
      total:
        res.data.total ??
        res.data.totalItems ??
        res.data.count ??
        res.data.items.length,
    };
  }
  if (Array.isArray(res.data)) {
    return { items: res.data, total: res.total ?? res.data.length };
  }
  if (Array.isArray(res.items)) {
    return { items: res.items, total: res.total ?? res.items.length };
  }
  if (res.companies && Array.isArray(res.companies)) {
    return { items: res.companies, total: res.total ?? res.companies.length };
  }
  return { items: [], total: 0 };
}

function parseCategoriesFromResponse(response) {
  return (
    response?.data?.items ||
    response?.items ||
    response?.categories ||
    response?.data?.categories ||
    (Array.isArray(response?.data) ? response.data : []) ||
    (Array.isArray(response) ? response : [])
  );
}

/** Map API company row to table shape used by CompanyTable */
function normalizeCompanyFromApi(c) {
  const id = c.id ?? c.company_id ?? c.companyId;
  const name = c.name || c.company_name || c.title || "—";
  const shortName = c.short_name || c.shortName || "";
  const industry = c.industry || c.category?.name || "—";
  const employeeCount =
    c.employee_count || c.employeeCount || c.employees || "—";
  const rawPlan =
    c.subscription_plan || c.subscriptionPlan || c.plan || "basic";
  const subscriptionPlan = String(rawPlan || "basic").toLowerCase();
  const rawStatus = c.status || c.company_status || "pending";
  const statusLower = String(rawStatus).toLowerCase();
  const status =
    statusLower === "approved"
      ? "approved"
      : statusLower === "rejected" || statusLower === "blocked"
        ? "rejected"
        : "pending";
  const postedJobs = Array.isArray(c.posted_jobs)
    ? c.posted_jobs
    : Array.isArray(c.postedJobs)
      ? c.postedJobs
      : [];
  const createdAt =
    (c.created_at || c.createdAt || c.created_on || "").toString().split("T")[0] ||
    "";

  return {
    ...c,
    id,
    name,
    shortName,
    industry,
    employeeCount,
    subscriptionPlan,
    status,
    postedJobs,
    createdAt,
    categories: c.categories || c.category_ids || [],
    contactEmail: c.contact_email || c.contactEmail,
    locations: c.locations || [],
    location: c.location,
    address: c.address,
  };
}

/**
 * Custom hook for managing company listing state and operations
 *
 * @returns {Object} Company listing state and handlers
 */
export const useCompanyListing = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories?.list ?? []);

  // ==================== STATE MANAGEMENT ====================

  /** @type {[string[], Function]} Selected row keys for bulk operations */
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  /** @type {[Object[], Function]} Selected company objects for bulk operations */
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  /** @type {[Object[], Function]} Current list of companies to display */
  const [companies, setCompanies] = useState([]);

  /** @type {[boolean, Function]} Loading companies list */
  const [loading, setLoading] = useState(false);

  /** @type {[Error|null, Function]} Last fetch error */
  const [error, setError] = useState(null);

  /** Debounced search for API */
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /** @type {[string, Function]} Search query for filtering companies (min 4 chars for search filter) */
  const [searchQuery, setSearchQuery] = useState("");

  /** @type {[string, Function]} Company type / category filter; "all" = All categories */
  const [companyType, setCompanyType] = useState("all");

  /** @type {[string, Function]} Optional location filter */
  const [location, setLocation] = useState("");

  /**
   * Registered-on date range: [startDate, endDate] as "YYYY-MM-DD", or null when not set.
   * Used for filtering and for API params (startDate, endDate).
   */
  const [registeredOnRange, setRegisteredOnRange] = useState(null);

  // ==================== MODAL STATE MANAGEMENT ====================

  /** @type {[boolean, Function]} Controls single company delete modal visibility */
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  /** @type {[boolean, Function]} Controls bulk delete modal visibility */
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  /** @type {[boolean, Function]} Controls company details modal visibility */
  const [isCompanyDetailsModalOpen, setIsCompanyDetailsModalOpen] =
    useState(false);

  /** @type {[boolean, Function]} Controls create company modal visibility */
  const [isCreateCompanyModalOpen, setIsCreateCompanyModalOpen] =
    useState(false);

  /** @type {[boolean, Function]} Controls posted jobs modal visibility */
  const [isPostedJobsModalOpen, setIsPostedJobsModalOpen] = useState(false);

  /** @type {[Object|null, Function]} Company object to be deleted */
  const [companyToDelete, setCompanyToDelete] = useState(null);

  /** @type {[Object|null, Function]} Company object for details view */
  const [companyForDetails, setCompanyForDetails] = useState(null);

  /** @type {[Object|null, Function]} Company object for posted jobs view */
  const [companyForPostedJobs, setCompanyForPostedJobs] = useState(null);

  // ==================== COMPUTED VALUES ====================

  /** startDate and endDate for API: "YYYY-MM-DD" or null when no range selected */
  const { startDate, endDate } = useMemo(() => {
    if (!registeredOnRange || !Array.isArray(registeredOnRange) || registeredOnRange.length !== 2) {
      return { startDate: null, endDate: null };
    }
    const [start, end] = registeredOnRange;
    return {
      startDate: start && typeof start === "string" ? start : null,
      endDate: end && typeof end === "string" ? end : null,
    };
  }, [registeredOnRange]);

  /** Debounce search before calling GET /api/companies */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  /** Load categories for filter dropdown (GET categories via proxy) */
  useEffect(() => {
    if (categories.length > 0) return;

    let cancelled = false;
    const loadCategories = async () => {
      dispatch(setCategoriesLoading(true));
      try {
        const res = await fetch(
          "/api/categories/getAllCategories?page=1&limit=500&sortBy=name&order=asc",
          { credentials: "include" }
        );
        const data = await res.json().catch(() => ({}));
        const list = parseCategoriesFromResponse(data);
        const arr = Array.isArray(list) ? list : [];
        if (!cancelled) dispatch(setCategories(arr));
      } catch (err) {
        console.error("Failed to load categories", err);
        if (!cancelled) {
          dispatch(
            setCategoriesError(err?.message || "Failed to load categories")
          );
          dispatch(setCategories([]));
        }
      }
    };

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, [categories.length, dispatch]);

  /** Fetch companies: GET /api/companies (proxied) with filters */
  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: 1, limit: 500 };
      if (debouncedSearch.length >= MIN_SEARCH_LENGTH) {
        params.search = debouncedSearch;
      }
      if (companyType && companyType !== "all") {
        params.type = companyType;
        params.categoryId = companyType;
      }
      if (location.trim()) {
        params.country = location.trim();
      }
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const res = await companyService.getCompanies(params);
      const { items } = parseCompaniesResponse(res);
      const normalized = items
        .map(normalizeCompanyFromApi)
        .filter((row) => row.id !== undefined && row.id !== null);
      setCompanies(normalized);
    } catch (err) {
      console.error("Failed to load companies:", err);
      setError(err instanceof Error ? err : new Error(String(err?.message || err)));
      message.error(err?.message || "Failed to load companies");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    companyType,
    location,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  /** Table uses API-filtered list */
  const filteredCompanies = companies;

  /**
   * Memoized row selection configuration
   * Prevents unnecessary re-renders of table selection
   */
  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        setSelectedRowKeys(selectedRowKeys);
        setSelectedCompanies(selectedRows);
      },
    }),
    [selectedRowKeys]
  );

  // ==================== EVENT HANDLERS ====================

  /**
   * Handles search input change (min 4 chars required for search to apply)
   */
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value ?? "");
  }, []);

  /** Handles company type (category) dropdown change; "all" = All. */
  const handleCompanyTypeChange = useCallback((value) => {
    setCompanyType(value === undefined || value === null ? "all" : value);
  }, []);

  /** Handles optional location filter change. */
  const handleLocationChange = useCallback((e) => {
    setLocation(e.target.value ?? "");
  }, []);

  /**
   * Handles registered-on date range change from RangePicker.
   * Accepts (dates, dateStrings) from Ant Design RangePicker; stores [startDate, endDate] as "YYYY-MM-DD" for API.
   * @param {[unknown, unknown]} dates - dayjs instances from RangePicker (unused, we use dateStrings)
   * @param {[string, string]|null} dateStrings - [startDate, endDate] as "YYYY-MM-DD"
   */
  const handleRegisteredOnRangeChange = useCallback((dates, dateStrings) => {
    if (!dateStrings || !Array.isArray(dateStrings) || !dateStrings[0] || !dateStrings[1]) {
      setRegisteredOnRange(null);
      return;
    }
    setRegisteredOnRange([dateStrings[0], dateStrings[1]]);
  }, []);

  /**
   * Handles bulk delete action
   * Opens confirmation modal for multiple companies
   */
  const handleBulkDelete = useCallback(() => {
    setIsBulkDeleteModalOpen(true);
  }, []);

  /**
   * Handles create company action
   * Opens create company modal
   */
  const handleCreateCompany = useCallback(() => {
    setIsCreateCompanyModalOpen(true);
  }, []);

  /**
   * Handles posted jobs click action
   * Opens modal with posted jobs details
   * @param {Object} record - Company record
   */
  const handlePostedJobsClick = useCallback((record) => {
    setCompanyForPostedJobs(record);
    setIsPostedJobsModalOpen(true);
  }, []);

  /**
   * Handles dropdown menu click
   * @param {Object} menuInfo - Menu click information
   * @param {Object} record - Company record
   */
  const handleMenuClick = useCallback((menuInfo, record) => {
    const { key } = menuInfo;

    switch (key) {
      case "view_details":
        setCompanyForDetails(record);
        setIsCompanyDetailsModalOpen(true);
        break;
      case "edit":
        // TODO: Implement edit functionality
        message.info("Edit functionality will be implemented soon");
        break;
      case "approve":
        handleApproveCompany(record);
        break;
      case "reject":
        handleBlockCompany(record);
        break;
      case "delete":
        setCompanyToDelete(record);
        setIsDeleteModalOpen(true);
        break;
      default:
        break;
    }
  }, []);

  /**
   * Handles approve company action
   * @param {Object} company - Company to approve
   */
  const handleApproveCompany = useCallback((company) => {
    setCompanies((prevCompanies) =>
      prevCompanies.map((comp) =>
        comp.id === company.id ? { ...comp, status: "approved" } : comp
      )
    );
    message.success(`${company.name} has been approved`);
  }, []);

  /**
   * Handles reject company action
   * @param {Object} company - Company to reject
   */
  const handleBlockCompany = useCallback((company) => {
    setCompanies((prevCompanies) =>
      prevCompanies.map((comp) =>
        comp.id === company.id ? { ...comp, status: "rejected" } : comp
      )
    );
    message.success(`${company.name} has been rejected`);
  }, []);

  /**
   * Handles update company status via switch
   * @param {number} companyId - ID of the company
   * @param {boolean} isApproved - New status (true for approved, false for rejected)
   */
  const handleUpdateStatus = useCallback((companyId, isApproved) => {
    setCompanies((prevCompanies) =>
      prevCompanies.map((comp) =>
        comp.id === companyId
          ? { ...comp, status: isApproved ? "approved" : "rejected" }
          : comp
      )
    );
    const company = companies.find((c) => c.id === companyId);
    message.success(
      `${company?.name || "Company"} has been ${isApproved ? "approved" : "rejected"}`
    );
  }, [companies]);

  /**
   * Handles single company delete confirmation
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!companyToDelete?.id) {
      setIsDeleteModalOpen(false);
      setCompanyToDelete(null);
      return;
    }
    try {
      await companyService.deleteCompany(companyToDelete.id);
      message.success("Company deleted successfully");
      await loadCompanies();
    } catch (err) {
      message.error(err?.message || "Failed to delete company");
    }
    setIsDeleteModalOpen(false);
    setCompanyToDelete(null);
  }, [companyToDelete, loadCompanies]);

  /**
   * Handles bulk delete confirmation
   * Removes selected companies from list using Set for O(1) lookup performance
   */
  const handleConfirmBulkDelete = useCallback(async () => {
    if (!selectedCompanies.length) {
      setIsBulkDeleteModalOpen(false);
      return;
    }
    try {
      await Promise.all(
        selectedCompanies.map((c) => companyService.deleteCompany(c.id))
      );
      message.success(
        `${selectedCompanies.length} company(ies) deleted successfully`
      );
      setSelectedRowKeys([]);
      setSelectedCompanies([]);
      await loadCompanies();
    } catch (err) {
      message.error(err?.message || "Bulk delete failed");
    }
    setIsBulkDeleteModalOpen(false);
  }, [selectedCompanies, loadCompanies]);

  /**
   * Handles cancel delete action
   * Closes modal and resets state
   */
  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setCompanyToDelete(null);
  }, []);

  /**
   * Handles cancel bulk delete action
   * Closes modal without making changes
   */
  const handleCancelBulkDelete = useCallback(() => {
    setIsBulkDeleteModalOpen(false);
  }, []);

  /**
   * Handles cancel company details modal
   * Closes modal and resets state
   */
  const handleCancelCompanyDetails = useCallback(() => {
    setIsCompanyDetailsModalOpen(false);
    setCompanyForDetails(null);
  }, []);

  /**
   * Handles cancel posted jobs modal
   * Closes modal and resets state
   */
  const handleCancelPostedJobs = useCallback(() => {
    setIsPostedJobsModalOpen(false);
    setCompanyForPostedJobs(null);
  }, []);

  /**
   * Handles cancel create company modal
   * Closes modal without making changes
   */
  const handleCancelCreateCompany = useCallback(() => {
    setIsCreateCompanyModalOpen(false);
  }, []);

  /**
   * Handles create company form submission
   * Adds new company to the list
   * @param {Object} values - Form values
   */
  const handleCreateCompanySubmit = useCallback((values) => {
    try {
      const newCompany = {
        id: `company_${Date.now()}`,
        name: values.name,
        shortName: values.shortName,
        industry: values.industry,
        employeeCount: values.employeeCount,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        website: values.website,
        description: values.description,
        isActive: values.isActive || true,
        plan: values.plan || "basic",
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        status: "pending",
        postedJobs: [],
        categories: values.categories || [],
        socialLinks: values.socialLinks || [],
        locations: values.locations || [],
      };

      setCompanies((prevCompanies) => [newCompany, ...prevCompanies]);
      setIsCreateCompanyModalOpen(false);
      message.success("Company created successfully!");
    } catch (error) {
      console.error("Company creation error:", error);
      message.error("Failed to create company. Please try again.");
    }
  }, []);

  return {
    // State
    companies,
    filteredCompanies,
    selectedRowKeys,
    selectedCompanies,
    searchQuery,
    companyType,
    location,
    registeredOnRange,
    startDate,
    endDate,
    rowSelection,
    loading,
    error,
    loadCompanies,

    // Search handlers
    handleCompanyTypeChange,
    handleLocationChange,
    handleRegisteredOnRangeChange,

    // Modal states
    isDeleteModalOpen,
    isBulkDeleteModalOpen,
    isCompanyDetailsModalOpen,
    isCreateCompanyModalOpen,
    isPostedJobsModalOpen,
    companyToDelete,
    companyForDetails,
    companyForPostedJobs,

    // Handlers
    handleSearchChange,
    handleBulkDelete,
    handleCreateCompany,
    handleCreateCompanySubmit,
    handlePostedJobsClick,
    handleMenuClick,
    handleConfirmDelete,
    handleConfirmBulkDelete,
    handleCancelDelete,
    handleCancelBulkDelete,
    handleCancelCompanyDetails,
    handleCancelPostedJobs,
    handleCancelCreateCompany,
    handleUpdateStatus,

    // Setters
    setCompanies,
  };
};
