"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { useJob } from "./useJob";
import { useJobModal } from "./useJobModal";
import { ROUTES } from "@/constants/routes";
import { stashJobForEdit } from "../utils/jobFormMapper";
import { jobService } from "@/utilities/apiServices";
import {
  JOB_LIST_VIEW,
  isJobActiveListing,
  isJobInHistory,
  buildJobClosurePayload,
} from "../constants/jobHiringStatuses";

/**
 * Custom hook for managing job listing state and operations
 * Integrates with API via useJob hook
 *
 * @returns {Object} Job listing state and handlers
 */
export const useJobListing = () => {
  const router = useRouter();

  const {
    jobs: apiJobs,
    loading,
    error,
    pagination,
    fetchJobs,
    updateJob,
    deleteJob,
    handleSort,
  } = useJob();

  const {
    isModalOpen: isEditModalOpen,
    selectedJob,
    isEditMode,
    closeModal: closeEditModal,
  } = useJobModal();

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [listView, setListView] = useState(JOB_LIST_VIEW.ACTIVE);
  const listViewRef = useRef(listView);
  listViewRef.current = listView;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [jobToClose, setJobToClose] = useState(null);
  const [closingJob, setClosingJob] = useState(false);

  const filteredJobs = useMemo(() => {
    const list = apiJobs || [];
    if (listView === JOB_LIST_VIEW.HISTORY) {
      return list.filter(isJobInHistory);
    }
    return list.filter(isJobActiveListing);
  }, [apiJobs, listView]);

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (keys, rows) => {
        setSelectedRowKeys(keys);
        setSelectedJobs(rows);
      },
    }),
    [selectedRowKeys]
  );

  const searchTimeoutRef = useRef(null);

  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchQuery(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        fetchJobs({
          search: value,
          page: 1,
          listView: listViewRef.current,
        });
      }, 500);
    },
    [fetchJobs]
  );

  const handleListViewChange = useCallback(
    (nextView) => {
      setListView(nextView);
      setSelectedRowKeys([]);
      setSelectedJobs([]);
      fetchJobs({
        listView: nextView,
        page: 1,
        search: searchQuery,
      });
    },
    [fetchJobs, searchQuery]
  );

  const handleBulkDelete = useCallback(() => {
    setIsBulkDeleteModalOpen(true);
  }, []);

  const handleApproveJob = useCallback(() => {
    message.info("Approve functionality will be implemented soon");
  }, []);

  const handleBlockJob = useCallback(() => {
    message.info("Block functionality will be implemented soon");
  }, []);

  const handleMenuClick = useCallback(
    (menuInfo, record) => {
      const { key } = menuInfo;
      const id = record?.id || record?.jobId || record?.job_id;

      switch (key) {
        case "view_details": {
          if (!id) {
            message.error("Job id is missing");
            break;
          }
          router.push(`${ROUTES.PRIVATE.JOB_DETAILS}/${id}`);
          break;
        }
        case "view_applied_users": {
          if (!id) {
            message.error("Job id is missing");
            break;
          }
          router.push(`${ROUTES.PRIVATE.JOB_DETAILS}/${id}?tab=candidates`);
          break;
        }
        case "edit": {
          if (!id) {
            message.error("Job id is missing");
            break;
          }
          stashJobForEdit(record);
          router.push(`${ROUTES.PRIVATE.JOB_EDIT}/${id}`);
          break;
        }
        case "close_job":
          setJobToClose(record);
          setIsCloseModalOpen(true);
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
    },
    [router, handleApproveJob, handleBlockJob]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (jobToDelete) {
      try {
        await deleteJob(jobToDelete.id || jobToDelete.jobId);
        setIsDeleteModalOpen(false);
        setJobToDelete(null);
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  }, [jobToDelete, deleteJob]);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (selectedJobs.length === 0) {
      setIsBulkDeleteModalOpen(false);
      return;
    }

    try {
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
    }
  }, [selectedJobs, deleteJob]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setJobToDelete(null);
  }, []);

  const handleCancelBulkDelete = useCallback(() => {
    setIsBulkDeleteModalOpen(false);
  }, []);

  const handleCancelCloseJob = useCallback(() => {
    setIsCloseModalOpen(false);
    setJobToClose(null);
  }, []);

  const handleConfirmCloseJob = useCallback(
    async (hiringStatus) => {
      if (!jobToClose) return;
      const id = jobToClose.id || jobToClose.jobId || jobToClose.job_id;
      if (!id) {
        message.error("Job id is missing");
        return;
      }

      setClosingJob(true);
      try {
        await jobService.updateJob(id, buildJobClosurePayload(hiringStatus));
        message.success(
          hiringStatus === "filled"
            ? "Job marked as Filled and moved to history"
            : "Job marked as Closed and moved to history"
        );
        setIsCloseModalOpen(false);
        setJobToClose(null);
        await fetchJobs({
          listView: listViewRef.current,
          page: 1,
          search: searchQuery,
        });
      } catch (error) {
        console.error("Error closing job:", error);
        message.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to update job"
        );
      } finally {
        setClosingJob(false);
      }
    },
    [jobToClose, fetchJobs, searchQuery]
  );

  const handleUpdateJob = useCallback(
    async (jobId, jobData) => {
      try {
        await updateJob(jobId, jobData);
        closeEditModal();
      } catch (error) {
        console.error("Error updating job:", error);
      }
    },
    [updateJob, closeEditModal]
  );

  return {
    jobs: filteredJobs,
    filteredJobs,
    selectedRowKeys,
    selectedJobs,
    searchQuery,
    listView,
    rowSelection,
    loading,
    error,
    pagination,
    isDeleteModalOpen,
    isBulkDeleteModalOpen,
    isEditModalOpen,
    isCloseModalOpen,
    jobToDelete,
    jobToClose,
    closingJob,
    selectedJob,
    isEditMode,
    handleSearchChange,
    handleListViewChange,
    handleBulkDelete,
    handleMenuClick,
    handleConfirmDelete,
    handleConfirmBulkDelete,
    handleCancelDelete,
    handleCancelBulkDelete,
    handleConfirmCloseJob,
    handleCancelCloseJob,
    handleUpdateJob,
    closeEditModal,
    fetchJobs,
    handleSort,
  };
};
