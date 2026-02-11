"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { message } from "antd";
import { useJob } from "./useJob";
import { useJobModal } from "./useJobModal";

/**
 * Custom hook for managing job listing state and operations
 * Integrates with API via useJob hook
 *
 * @returns {Object} Job listing state and handlers
 */
export const useJobListing = () => {
  // ==================== API INTEGRATION ====================
  
  const {
    jobs: apiJobs,
    loading,
    error,
    pagination,
    searchQuery: apiSearchQuery,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
    handleSort,
  } = useJob();

  // ==================== MODAL MANAGEMENT ====================
  
  const {
    isModalOpen: isEditModalOpen,
    selectedJob,
    isEditMode,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useJobModal();

  // ==================== STATE MANAGEMENT ====================

  /** @type {[string[], Function]} Selected row keys for bulk operations */
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  /** @type {[Object[], Function]} Selected job objects for bulk operations */
  const [selectedJobs, setSelectedJobs] = useState([]);

  /** @type {[string, Function]} Local search query for UI */
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

  /** @type {[boolean, Function]} Controls create job modal visibility */
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);

  /** @type {[Object|null, Function]} Job object to be deleted */
  const [jobToDelete, setJobToDelete] = useState(null);

  /** @type {[Object|null, Function]} Job object for details view */
  const [jobForDetails, setJobForDetails] = useState(null);

  /** @type {[Object|null, Function]} Job object for applied users view */
  const [jobForAppliedUsers, setJobForAppliedUsers] = useState(null);

  // ==================== COMPUTED VALUES ====================

  /**
   * Use jobs from API (search is handled server-side)
   * Filtered jobs are the same as jobs since API handles search
   */
  const filteredJobs = useMemo(() => {
    return apiJobs || [];
  }, [apiJobs]);

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
   * Handles search input change with debouncing
   * @param {Event} e - Input change event
   */
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce API call
    const timeoutId = setTimeout(() => {
      fetchJobs({
        search: value,
        page: 1, // Reset to first page on search
      });
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [fetchJobs]);

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
        // Open edit modal with selected job
        openEditModal(record);
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
   * TODO: Implement API call for approve
   */
  const handleApproveJob = useCallback((job) => {
    message.info("Approve functionality will be implemented soon");
  }, []);

  /**
   * Handles block job action
   * @param {Object} job - Job to block
   * TODO: Implement API call for block
   */
  const handleBlockJob = useCallback((job) => {
    message.info("Block functionality will be implemented soon");
  }, []);

  /**
   * Handles single job delete confirmation
   * Calls API to delete job and refreshes list
   */
  const handleConfirmDelete = useCallback(async () => {
    if (jobToDelete) {
      try {
        await deleteJob(jobToDelete.id || jobToDelete.jobId);
        setIsDeleteModalOpen(false);
        setJobToDelete(null);
      } catch (error) {
        // Error is already handled in deleteJob
        console.error("Error deleting job:", error);
      }
    }
  }, [jobToDelete, deleteJob]);

  /**
   * Handles bulk delete confirmation
   * Deletes multiple jobs via API
   */
  const handleConfirmBulkDelete = useCallback(async () => {
    if (selectedJobs.length === 0) {
      setIsBulkDeleteModalOpen(false);
      return;
    }

    try {
      // Delete all selected jobs
      const deletePromises = selectedJobs.map((job) =>
        deleteJob(job.id || job.jobId)
      );
      await Promise.all(deletePromises);
      
      setSelectedRowKeys([]);
      setSelectedJobs([]);
      message.success(`${selectedJobs.length} job(s) deleted successfully`);
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting jobs:", error);
      // Error messages are already shown by deleteJob
    }
  }, [selectedJobs, deleteJob]);

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

  /**
   * Handle create job action
   */
  const handleCreateJob = useCallback(
    async (jobData) => {
      try {
        await createJob(jobData);
        setIsCreateJobModalOpen(false);
      } catch (error) {
        console.error("Error creating job:", error);
        // Error is already handled in createJob
      }
    },
    [createJob]
  );

  /**
   * Handle update job action
   */
  const handleUpdateJob = useCallback(
    async (jobId, jobData) => {
      try {
        await updateJob(jobId, jobData);
        closeEditModal();
      } catch (error) {
        console.error("Error updating job:", error);
        // Error is already handled in updateJob
      }
    },
    [updateJob, closeEditModal]
  );

  /**
   * Open create job modal
   */
  const openCreateJobModal = useCallback(() => {
    setIsCreateJobModalOpen(true);
  }, []);

  /**
   * Close create job modal
   */
  const closeCreateJobModal = useCallback(() => {
    setIsCreateJobModalOpen(false);
  }, []);

  return {
    // State
    jobs: filteredJobs,
    filteredJobs,
    selectedRowKeys,
    selectedJobs,
    searchQuery,
    rowSelection,
    loading,
    error,
    pagination,

    // Modal states
    isDeleteModalOpen,
    isBulkDeleteModalOpen,
    isJobDetailsModalOpen,
    isAppliedUsersModalOpen,
    isEditModalOpen,
    isCreateJobModalOpen,
    jobToDelete,
    jobForDetails,
    jobForAppliedUsers,
    selectedJob,
    isEditMode,

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
    handleCreateJob,
    handleUpdateJob,
    openCreateJobModal,
    closeCreateJobModal,
    closeEditModal,
    fetchJobs,
    handleSort,
  };
};
