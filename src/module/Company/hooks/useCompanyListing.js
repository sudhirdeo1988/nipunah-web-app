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
import {
  buildCompanyListParams,
  COMPANY_LIST_MIN_SEARCH_LENGTH,
  COMPANY_TYPE_ALL_VALUE,
} from "../constants/companyConstants";

const MIN_SEARCH_LENGTH = COMPANY_LIST_MIN_SEARCH_LENGTH;
const DEFAULT_FILTERS = {
  search: "",
  companyType: COMPANY_TYPE_ALL_VALUE,
  location: "",
};

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

function formatDateToDDMMYYYY(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/** Map API company row to table shape used by CompanyTable */
function normalizeCompanyFromApi(c) {
  const id = c.id ?? c.company_id ?? c.companyId;
  const name = c.name || c.company_name || c.title || "—";
  const shortName = c.short_name || c.shortName || "";
  const industry = c.industry || c.category?.name || c.title || "—";
  const employeeCount =
    c.employee_count ||
    c.employeeCount ||
    c.employeesCount ||
    c.employees ||
    "—";
  const rawPlan =
    c.subscription_plan || c.subscriptionPlan || c.plan || "basic";
  const subscriptionPlan = String(rawPlan || "basic").toLowerCase();
  const rawStatus = c.status || c.company_status || "active";
  const statusLower = String(rawStatus).toLowerCase();
  const status =
    statusLower === "approved" || statusLower === "active"
      ? "active"
      : statusLower === "rejected" || statusLower === "blocked" || statusLower === "inactive"
        ? "inactive"
        : "active";
  const isApproved = c.isApproved === true || c.is_approved === true;
  const postedJobs = Array.isArray(c.posted_jobs)
    ? c.posted_jobs
    : Array.isArray(c.postedJobs)
      ? c.postedJobs
      : [];
  const createdAtRaw = c.created_at || c.createdAt || c.created_on || "";
  const createdAt = formatDateToDDMMYYYY(createdAtRaw);
  const categories = Array.isArray(c.categories)
    ? c.categories
    : c.category
      ? [c.category]
      : Array.isArray(c.category_ids)
        ? c.category_ids
        : [];
  const socialLinks = Array.isArray(c.socialLinks)
    ? c.socialLinks
    : c.socialMedia && typeof c.socialMedia === "object"
      ? Object.entries(c.socialMedia)
          .filter(([_, value]) => value)
          .map(([platform, url]) => ({ platform, url }))
      : [];
  const locations = Array.isArray(c.locations)
    ? c.locations
    : Array.isArray(c.addresses)
      ? c.addresses
      : [];

  return {
    ...c,
    id,
    name,
    shortName,
    industry,
    employeeCount,
    subscriptionPlan,
    status,
    isApproved,
    postedJobs,
    createdAt,
    categories,
    socialLinks,
    contactEmail: c.contact_email || c.contactEmail || c.email,
    contactNumber: c.contactNumber || c.contact_number || c.phone || "",
    description: c.description || c.aboutCompany || c.about || "",
    turnOver: c.turnOver || c.turnover || "",
    locations,
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

  /** Draft filter values (UI) */
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  /** Applied filter values sent to the API */
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  /** @type {[string, Function]} Search query for filtering companies (min 4 chars for search filter) */
  const searchQuery = filters.search;

  /** @type {[string, Function]} Company type / category filter; "all" = All categories */
  const companyType = filters.companyType;

  /** @type {[string, Function]} Optional location filter */
  const location = filters.location;

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

  /** Fetch companies: GET /api/companies/getAllCompanies with applied filters */
  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = buildCompanyListParams(appliedFilters);
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
  }, [appliedFilters]);

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
    const value = e?.target?.value ?? "";
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  /** Handles company type (category) dropdown change; "all" = All. */
  const handleCompanyTypeChange = useCallback((value) => {
    setFilters((prev) => ({
      ...prev,
      companyType:
        value === undefined || value === null ? COMPANY_TYPE_ALL_VALUE : value,
    }));
  }, []);

  /** Handles optional location filter change. */
  const handleLocationChange = useCallback((value) => {
    setFilters((prev) => ({ ...prev, location: value ?? "" }));
  }, []);

  /** Apply current draft filters and fetch companies */
  const handleApplyFilters = useCallback(() => {
    const trimmedSearch = filters.search.trim();
    if (
      trimmedSearch.length > 0 &&
      trimmedSearch.length < MIN_SEARCH_LENGTH
    ) {
      message.warning(`Enter at least ${MIN_SEARCH_LENGTH} characters to search`);
      return;
    }
    setAppliedFilters({ ...filters });
  }, [filters]);

  /** Reset filters to defaults and refetch */
  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
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

  /** @type {[boolean, Function]} Loading state while updating approval status */
  const [statusUpdating, setStatusUpdating] = useState(false);

  /**
   * Handles update company approval status via switch or menu
   * @param {number|string} companyId - ID of the company
   * @param {boolean} isApproved - New approval status
   */
  const handleUpdateStatus = useCallback(
    async (companyId, isApproved) => {
      setStatusUpdating(true);
      try {
        await companyService.updateApprovalStatus(companyId, isApproved);
        setCompanies((prevCompanies) =>
          prevCompanies.map((comp) =>
            comp.id === companyId ? { ...comp, isApproved } : comp
          )
        );
        const company = companies.find((c) => c.id === companyId);
        message.success(
          `${company?.name || "Company"} is now ${isApproved ? "approved" : "pending approval"}`
        );
      } catch (err) {
        message.error(err?.message || "Failed to update company approval status");
        throw err;
      } finally {
        setStatusUpdating(false);
      }
    },
    [companies]
  );

  /**
   * Handles approve company action
   * @param {Object} company - Company to approve
   */
  const handleApproveCompany = useCallback(
    async (company) => {
      await handleUpdateStatus(company.id, true);
    },
    [handleUpdateStatus]
  );

  /**
   * Handles reject company action
   * @param {Object} company - Company to reject
   */
  const handleBlockCompany = useCallback(
    async (company) => {
      await handleUpdateStatus(company.id, false);
    },
    [handleUpdateStatus]
  );

  /**
   * Handles dropdown menu click
   * @param {Object} menuInfo - Menu click information
   * @param {Object} record - Company record
   */
  const handleMenuClick = useCallback(
    (menuInfo, record) => {
      const { key } = menuInfo;

      switch (key) {
        case "view_details":
          setCompanyForDetails(record);
          setIsCompanyDetailsModalOpen(true);
          break;
        case "edit":
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
    },
    [handleApproveCompany, handleBlockCompany]
  );

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
    rowSelection,
    loading,
    error,
    loadCompanies,

    // Search handlers
    handleCompanyTypeChange,
    handleLocationChange,
    handleApplyFilters,
    handleClearFilters,

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
    statusUpdating,

    // Setters
    setCompanies,
  };
};
