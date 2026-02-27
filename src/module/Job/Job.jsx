"use client";

import React, { Suspense, lazy, useCallback } from "react";
import { Spin, Modal } from "antd";
import JobSearch from "./components/JobSearch";
import JobTable from "./components/JobTable";
import { useJobListing } from "./hooks/useJobListing";
import CreateJobModal from "./components/JobModals/CreateJobModal";
import EditJobModal from "./components/JobModals/EditJobModal";

// Lazy load modal components for better performance
const AppliedUsersModal = lazy(() =>
  import("./components/JobModals/AppliedUsersModal")
);
const DeleteConfirmModal = lazy(() =>
  import("./components/JobModals/DeleteConfirmModal")
);
const JobDetailsModal = lazy(() =>
  import("./components/JobModals/JobDetailsModal")
);

const Job = ({ onPostJobClickRef, permissions = {} }) => {
  const {
    // State
    jobs,
    filteredJobs,
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
    handleMenuClick,
    handleBulkDelete,
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
  } = useJobListing();

  // Expose openCreateJobModal to parent via ref if provided (only when add allowed)
  const canAdd = Boolean(permissions.add);
  React.useEffect(() => {
    if (onPostJobClickRef) {
      onPostJobClickRef.current = canAdd ? openCreateJobModal : null;
    }
  }, [onPostJobClickRef, openCreateJobModal, canAdd]);

  /**
   * Handle table changes (pagination, sorting)
   */
  const handleTableChange = useCallback(
    (newPagination, filters, sorter) => {
      if (sorter && sorter.field) {
        handleSort(sorter.field);
      } else if (newPagination) {
        fetchJobs({
          page: newPagination.current,
          limit: newPagination.pageSize,
        });
      }
    },
    [fetchJobs, handleSort]
  );

  return (
    <>
      <div className="mb-3">
        <JobSearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onBulkDelete={handleBulkDelete}
          selectedJobs={selectedJobs}
          permissions={permissions}
        />

        <Suspense fallback={<Spin size="small" />}>
          <JobTable
            jobs={filteredJobs}
            rowSelection={permissions.delete ? rowSelection : undefined}
            onMenuClick={handleMenuClick}
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            permissions={permissions}
          />
        </Suspense>
      </div>

      {/* Modals with Suspense for lazy loading */}
      <Suspense fallback={<Spin size="small" />}>
        <JobDetailsModal
          isOpen={isJobDetailsModalOpen}
          job={jobForDetails}
          onCancel={handleCancelJobDetails}
        />
        <AppliedUsersModal
          isOpen={isAppliedUsersModalOpen}
          job={jobForAppliedUsers}
          onCancel={handleCancelAppliedUsers}
        />
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          job={jobToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          loading={loading}
        />
        <DeleteConfirmModal
          isOpen={isBulkDeleteModalOpen}
          isBulk={true}
          jobs={selectedJobs}
          onConfirm={handleConfirmBulkDelete}
          onCancel={handleCancelBulkDelete}
          loading={loading}
        />
        
        {/* Create Job Modal - POST only */}
        <CreateJobModal
          isOpen={isCreateJobModalOpen}
          onCancel={closeCreateJobModal}
          onSubmit={handleCreateJob}
        />
        
        {/* Edit Job Modal - PUT only */}
        <EditJobModal
          isOpen={isEditModalOpen}
          selectedJob={selectedJob}
          onCancel={closeEditModal}
          onUpdate={handleUpdateJob}
        />
      </Suspense>
    </>
  );
};

export default Job;
