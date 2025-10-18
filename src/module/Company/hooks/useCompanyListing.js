"use client";

import { useState, useCallback, useMemo } from "react";
import { message } from "antd";
import { MOCK_COMPANY_DATA } from "../constants/companyConstants";

/**
 * Custom hook for managing company listing state and operations
 *
 * @returns {Object} Company listing state and handlers
 */
export const useCompanyListing = () => {
  // ==================== STATE MANAGEMENT ====================

  /** @type {[string[], Function]} Selected row keys for bulk operations */
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  /** @type {[Object[], Function]} Selected company objects for bulk operations */
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  /** @type {[Object[], Function]} Current list of companies to display */
  const [companies, setCompanies] = useState(MOCK_COMPANY_DATA);

  /** @type {[string, Function]} Search query for filtering companies */
  const [searchQuery, setSearchQuery] = useState("");

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

  /**
   * Memoized filtered companies based on search query
   * Optimizes performance by preventing unnecessary re-filtering
   */
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;

    const query = searchQuery.toLowerCase();
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(query) ||
        company.shortName.toLowerCase().includes(query) ||
        company.industry.toLowerCase().includes(query) ||
        company.contactEmail.toLowerCase().includes(query)
    );
  }, [companies, searchQuery]);

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
   * Handles search input change
   * @param {Event} e - Input change event
   */
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
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
      case "block":
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
   * Handles block company action
   * @param {Object} company - Company to block
   */
  const handleBlockCompany = useCallback((company) => {
    setCompanies((prevCompanies) =>
      prevCompanies.map((comp) =>
        comp.id === company.id ? { ...comp, status: "blocked" } : comp
      )
    );
    message.success(`${company.name} has been blocked`);
  }, []);

  /**
   * Handles single company delete confirmation
   * Removes company from list and shows success message
   */
  const handleConfirmDelete = useCallback(() => {
    if (companyToDelete) {
      setCompanies((prevCompanies) =>
        prevCompanies.filter((company) => company.id !== companyToDelete.id)
      );
      message.success("Company deleted successfully");
    }
    setIsDeleteModalOpen(false);
    setCompanyToDelete(null);
  }, [companyToDelete]);

  /**
   * Handles bulk delete confirmation
   * Removes selected companies from list using Set for O(1) lookup performance
   */
  const handleConfirmBulkDelete = useCallback(() => {
    const selectedKeysSet = new Set(selectedRowKeys);
    setCompanies((prevCompanies) =>
      prevCompanies.filter((company) => !selectedKeysSet.has(company.id))
    );
    setSelectedRowKeys([]);
    setSelectedCompanies([]);
    message.success(
      `${selectedCompanies.length} company(ies) deleted successfully`
    );
    setIsBulkDeleteModalOpen(false);
  }, [selectedCompanies, selectedRowKeys]);

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
    rowSelection,

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

    // Setters
    setCompanies,
  };
};
