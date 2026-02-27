"use client";

import React, { Suspense, lazy } from "react";
import { Spin } from "antd";
import CompanySearch from "./components/CompanySearch";
import CompanyTable from "./components/CompanyTable";
import { useCompanyListing } from "./hooks/useCompanyListing";

// Lazy load modal components for better performance
const CompanyDetailsModal = lazy(() =>
  import("./components/CompanyModals/CompanyDetailsModal")
);
const CreateCompanyModal = lazy(() =>
  import("./components/CompanyModals/CreateCompanyModal")
);
const DeleteConfirmModal = lazy(() =>
  import("./components/CompanyModals/DeleteConfirmModal")
);
const PostedJobsModal = lazy(() =>
  import("./components/CompanyModals/PostedJobsModal")
);

const Company = ({ permissions = {} }) => {
  const {
    // State
    companies,
    filteredCompanies,
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
    handleMenuClick,
    handleCreateCompany,
    handleCreateCompanySubmit,
    handleBulkDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleCancelCompanyDetails,
    handlePostedJobsClick,
    handleCancelPostedJobs,
    handleCancelCreateCompany,
    handleUpdateStatus,
  } = useCompanyListing();

  return (
    <>
      <div className="mb-3">
        <CompanySearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onCreateCompany={handleCreateCompany}
          onBulkDelete={handleBulkDelete}
          selectedCompanies={selectedCompanies}
          permissions={permissions}
        />

        <Suspense fallback={<Spin size="small" />}>
          <CompanyTable
            companies={filteredCompanies}
            rowSelection={permissions.delete ? rowSelection : undefined}
            onMenuClick={handleMenuClick}
            onPostedJobsClick={handlePostedJobsClick}
            onUpdateStatus={handleUpdateStatus}
            loading={false}
            permissions={permissions}
          />
        </Suspense>
      </div>

      {/* Modals with Suspense for lazy loading */}
      <Suspense fallback={<Spin size="small" />}>
        <CompanyDetailsModal
          isOpen={isCompanyDetailsModalOpen}
          company={companyForDetails}
          onCancel={handleCancelCompanyDetails}
        />
        <CreateCompanyModal
          isOpen={isCreateCompanyModalOpen}
          onSubmit={handleCreateCompanySubmit}
          onCancel={handleCancelCreateCompany}
        />
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          company={companyToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
        <PostedJobsModal
          isOpen={isPostedJobsModalOpen}
          company={companyForPostedJobs}
          onCancel={handleCancelPostedJobs}
        />
      </Suspense>
    </>
  );
};

export default Company;
