"use client";

import React, { Suspense, lazy, useCallback } from "react";
import { Spin } from "antd";
import JobSearch from "./components/JobSearch";
import JobTable from "./components/JobTable";
import { useJobListing } from "./hooks/useJobListing";

const DeleteConfirmModal = lazy(() =>
  import("./components/JobModals/DeleteConfirmModal")
);
const CloseJobModal = lazy(() =>
  import("./components/JobModals/CloseJobModal")
);

const Job = ({ permissions = {} }) => {
  const {
    filteredJobs,
    selectedJobs,
    searchQuery,
    listView,
    rowSelection,
    loading,
    error,
    pagination,
    isDeleteModalOpen,
    isBulkDeleteModalOpen,
    isCloseModalOpen,
    jobToDelete,
    jobToClose,
    closingJob,
    handleSearchChange,
    handleListViewChange,
    handleMenuClick,
    handleBulkDelete,
    handleConfirmDelete,
    handleConfirmBulkDelete,
    handleCancelDelete,
    handleCancelBulkDelete,
    handleConfirmCloseJob,
    handleCancelCloseJob,
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
        listView={listView}
        onListViewChange={handleListViewChange}
        permissions={permissions}
      />

      <Spin spinning={loading}>
        <JobTable
          jobs={filteredJobs}
          rowSelection={rowSelection}
          onMenuClick={handleMenuClick}
          loading={loading}
          error={error}
          pagination={pagination}
          onChange={handleTableChange}
          permissions={permissions}
          listView={listView}
        />
      </Spin>

      <Suspense fallback={null}>
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
        <CloseJobModal
          isOpen={isCloseModalOpen}
          job={jobToClose}
          onConfirm={handleConfirmCloseJob}
          onCancel={handleCancelCloseJob}
          loading={closingJob}
        />
      </Suspense>
    </>
  );
};

export default Job;
