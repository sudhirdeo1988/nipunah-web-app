"use client";

import React, { Suspense, lazy, useCallback } from "react";
import { Spin } from "antd";
import JobSearch from "./components/JobSearch";
import JobTable from "./components/JobTable";
import { useJobListing } from "./hooks/useJobListing";

const AppliedUsersModal = lazy(() =>
  import("./components/JobModals/AppliedUsersModal")
);
const DeleteConfirmModal = lazy(() =>
  import("./components/JobModals/DeleteConfirmModal")
);
const JobDetailsModal = lazy(() =>
  import("./components/JobModals/JobDetailsModal")
);

const Job = ({ permissions = {} }) => {
  const {
    jobs,
    filteredJobs,
    selectedJobs,
    searchQuery,
    rowSelection,
    loading,
    error,
    pagination,
    isDeleteModalOpen,
    isBulkDeleteModalOpen,
    isJobDetailsModalOpen,
    isAppliedUsersModalOpen,
    jobToDelete,
    jobForDetails,
    jobForAppliedUsers,
    handleSearchChange,
    handleMenuClick,
    handleBulkDelete,
    handleConfirmDelete,
    handleConfirmBulkDelete,
    handleCancelDelete,
    handleCancelBulkDelete,
    handleCancelJobDetails,
    handleCancelAppliedUsers,
    handleSort,
  } = useJobListing();

  const handleTableChange = useCallback(
    (newPagination, filters, sorter) => {
      if (sorter && sorter.field) {
        handleSort(sorter.field);
      }
    },
    [handleSort]
  );

  return (
    <>
      <JobSearch
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedJobs={selectedJobs}
        onBulkDelete={handleBulkDelete}
        permissions={permissions}
      />

      <Spin spinning={loading}>
        <JobTable
          jobs={filteredJobs.length > 0 ? filteredJobs : jobs}
          rowSelection={rowSelection}
          onMenuClick={handleMenuClick}
          loading={loading}
          error={error}
          pagination={pagination}
          onChange={handleTableChange}
          permissions={permissions}
        />
      </Spin>

      <Suspense fallback={null}>
        <AppliedUsersModal
          isOpen={isAppliedUsersModalOpen}
          job={jobForAppliedUsers}
          onCancel={handleCancelAppliedUsers}
        />
        <JobDetailsModal
          isOpen={isJobDetailsModalOpen}
          job={jobForDetails}
          onCancel={handleCancelJobDetails}
        />
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          isBulk={false}
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
      </Suspense>
    </>
  );
};

export default Job;
