"use client";

import React, { Suspense, lazy } from "react";
import { Spin } from "antd";
import JobSearch from "./components/JobSearch";
import JobTable from "./components/JobTable";
import { useJobListing } from "./hooks/useJobListing";

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

const Job = () => {
  const {
    // State
    jobs,
    filteredJobs,
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
    handleMenuClick,
    handleBulkDelete,
    handleConfirmDelete,
    handleConfirmBulkDelete,
    handleCancelDelete,
    handleCancelBulkDelete,
    handleCancelJobDetails,
    handleCancelAppliedUsers,
  } = useJobListing();

  return (
    <>
      <div className="mb-3">
        <JobSearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onBulkDelete={handleBulkDelete}
          selectedJobs={selectedJobs}
        />

        <Suspense fallback={<Spin size="small" />}>
          <JobTable
            jobs={filteredJobs}
            rowSelection={rowSelection}
            onMenuClick={handleMenuClick}
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
        />
        <DeleteConfirmModal
          isOpen={isBulkDeleteModalOpen}
          isBulk={true}
          jobs={selectedJobs}
          onConfirm={handleConfirmBulkDelete}
          onCancel={handleCancelBulkDelete}
        />
      </Suspense>
    </>
  );
};

export default Job;
