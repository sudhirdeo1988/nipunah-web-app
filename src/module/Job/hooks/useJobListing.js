"use client";

import { useState, useCallback, useMemo } from "react";
import { message } from "antd";
import { MOCK_JOB_DATA } from "../constants/jobConstants";

/**
 * Custom hook for managing job listing state and operations
 *
 * @returns {Object} Job listing state and handlers
 */
export const useJobListing = () => {
  // ==================== STATE MANAGEMENT ====================

  /** @type {[string[], Function]} Selected row keys for bulk operations */
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  /** @type {[Object[], Function]} Selected job objects for bulk operations */
  const [selectedJobs, setSelectedJobs] = useState([]);

  /** @type {[Object[], Function]} Current list of jobs to display */
  const [jobs, setJobs] = useState(MOCK_JOB_DATA);

  /** @type {[string, Function]} Search query for filtering jobs */
  const [searchQuery, setSearchQuery] = useState("");

  // ==================== MODAL STATE MANAGEMENT ====================

  /** @type {[boolean, Function]} Controls single job delete modal visibility */
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  /** @type {[boolean, Function]} Controls bulk delete modal visibility */
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  /** @type {[boolean, Function]} Controls job details modal visibility */
  const [isJobDetailsModalOpen, setIsJobDetailsModalOpen] = useState(false);

  /** @type {[boolean, Function]} Controls applied users modal visibility */
  const [isAppliedUsersModalOpen, setIsAppliedUsersModalOpen] = useState(false);

  /** @type {[Object|null, Function]} Job object to be deleted */
  const [jobToDelete, setJobToDelete] = useState(null);

  /** @type {[Object|null, Function]} Job object for details view */
  const [jobForDetails, setJobForDetails] = useState(null);

  /** @type {[Object|null, Function]} Job object for applied users view */
  const [jobForAppliedUsers, setJobForAppliedUsers] = useState(null);

  // ==================== COMPUTED VALUES ====================

  /**
   * Memoized filtered jobs based on search query
   * Optimizes performance by preventing unnecessary re-filtering
   */
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;

    const query = searchQuery.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.jobId.toLowerCase().includes(query) ||
        job.postedBy.companyName.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.skillsRequired.some((skill) => skill.toLowerCase().includes(query))
    );
  }, [jobs, searchQuery]);

  /**
   * Memoized row selection configuration
   * Prevents unnecessary re-renders of table selection
   */
  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        setSelectedRowKeys(selectedRowKeys);
        setSelectedJobs(selectedRows);
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
   * Opens confirmation modal for multiple jobs
   */
  const handleBulkDelete = useCallback(() => {
    setIsBulkDeleteModalOpen(true);
  }, []);

  /**
   * Handles dropdown menu click
   * @param {Object} menuInfo - Menu click information
   * @param {Object} record - Job record
   */
  const handleMenuClick = useCallback((menuInfo, record) => {
    const { key } = menuInfo;

    switch (key) {
      case "view_details":
        setJobForDetails(record);
        setIsJobDetailsModalOpen(true);
        break;
      case "view_applied_users":
        setJobForAppliedUsers(record);
        setIsAppliedUsersModalOpen(true);
        break;
      case "edit":
        // TODO: Implement edit functionality
        message.info("Edit functionality will be implemented soon");
        break;
      case "approve":
        handleApproveJob(record);
        break;
      case "block":
        handleBlockJob(record);
        break;
      case "delete":
        setJobToDelete(record);
        setIsDeleteModalOpen(true);
        break;
      default:
        break;
    }
  }, []);

  /**
   * Handles approve job action
   * @param {Object} job - Job to approve
   */
  const handleApproveJob = useCallback((job) => {
    setJobs((prevJobs) =>
      prevJobs.map((j) => (j.id === job.id ? { ...j, status: "approved" } : j))
    );
    message.success(`Job "${job.title}" has been approved`);
  }, []);

  /**
   * Handles block job action
   * @param {Object} job - Job to block
   */
  const handleBlockJob = useCallback((job) => {
    setJobs((prevJobs) =>
      prevJobs.map((j) => (j.id === job.id ? { ...j, status: "blocked" } : j))
    );
    message.success(`Job "${job.title}" has been blocked`);
  }, []);

  /**
   * Handles single job delete confirmation
   * Removes job from list and shows success message
   */
  const handleConfirmDelete = useCallback(() => {
    if (jobToDelete) {
      setJobs((prevJobs) =>
        prevJobs.filter((job) => job.id !== jobToDelete.id)
      );
      message.success("Job deleted successfully");
    }
    setIsDeleteModalOpen(false);
    setJobToDelete(null);
  }, [jobToDelete]);

  /**
   * Handles bulk delete confirmation
   * Removes selected jobs from list using Set for O(1) lookup performance
   */
  const handleConfirmBulkDelete = useCallback(() => {
    const selectedKeysSet = new Set(selectedRowKeys);
    setJobs((prevJobs) =>
      prevJobs.filter((job) => !selectedKeysSet.has(job.id))
    );
    setSelectedRowKeys([]);
    setSelectedJobs([]);
    message.success(`${selectedJobs.length} job(s) deleted successfully`);
    setIsBulkDeleteModalOpen(false);
  }, [selectedJobs, selectedRowKeys]);

  /**
   * Handles cancel delete action
   * Closes modal and resets state
   */
  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setJobToDelete(null);
  }, []);

  /**
   * Handles cancel bulk delete action
   * Closes modal without making changes
   */
  const handleCancelBulkDelete = useCallback(() => {
    setIsBulkDeleteModalOpen(false);
  }, []);

  /**
   * Handles cancel job details modal
   * Closes modal and resets state
   */
  const handleCancelJobDetails = useCallback(() => {
    setIsJobDetailsModalOpen(false);
    setJobForDetails(null);
  }, []);

  /**
   * Handles cancel applied users modal
   * Closes modal and resets state
   */
  const handleCancelAppliedUsers = useCallback(() => {
    setIsAppliedUsersModalOpen(false);
    setJobForAppliedUsers(null);
  }, []);

  return {
    // State
    jobs,
    filteredJobs,
    selectedRowKeys,
    selectedJobs,
    searchQuery,
    rowSelection,

    // Modal states
    isDeleteModalOpen,
    isBulkDeleteModalOpen,
    isJobDetailsModalOpen,
    isAppliedUsersModalOpen,
    jobToDelete,
    jobForDetails,
    jobForAppliedUsers,

    // Handlers
    handleSearchChange,
    handleBulkDelete,
    handleMenuClick,
    handleConfirmDelete,
    handleConfirmBulkDelete,
    handleCancelDelete,
    handleCancelBulkDelete,
    handleCancelJobDetails,
    handleCancelAppliedUsers,

    // Setters
    setJobs,
  };
};
