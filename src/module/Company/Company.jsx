"use client";

import React, { Suspense, lazy } from "react";
import { Spin, Alert, Button } from "antd";
import { useAppSelector } from "@/store/hooks";
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
  const categoriesError = useAppSelector((state) => state.categories?.error);

  const {
    // State
    filteredCompanies,
    selectedCompanies,
    searchQuery,
    companyType,
    location,
    registeredOnRange,
    startDate,
    endDate,
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
    handleCompanyTypeChange,
    handleLocationChange,
    handleRegisteredOnRangeChange,
    handleMenuClick,
    handleCreateCompany,
    handleCreateCompanySubmit,
    handleBulkDelete,
    handleConfirmDelete,
    handleConfirmBulkDelete,
    handleCancelDelete,
    handleCancelBulkDelete,
    handleCancelCompanyDetails,
    handlePostedJobsClick,
    handleCancelPostedJobs,
    handleCancelCreateCompany,
    handleUpdateStatus,
    loading,
    error,
    loadCompanies,
  } = useCompanyListing();

  return (
    <>
      <div className="mb-3">
        {categoriesError && (
          <Alert
            type="warning"
            showIcon
            closable
            className="mb-3"
            message="Categories could not be loaded"
            description={categoriesError}
          />
        )}
        {error && (
          <Alert
            type="error"
            showIcon
            className="mb-3"
            message="Failed to load companies"
            description={error?.message || "Something went wrong."}
            action={
              <Button size="small" type="primary" onClick={() => loadCompanies()}>
                Retry
              </Button>
            }
          />
        )}
        <CompanySearch
          searchQuery={searchQuery}
          companyType={companyType}
          location={location}
          registeredOnRange={registeredOnRange}
          onSearchChange={handleSearchChange}
          onCompanyTypeChange={handleCompanyTypeChange}
          onLocationChange={handleLocationChange}
          onRegisteredOnRangeChange={handleRegisteredOnRangeChange}
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
            loading={loading}
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
          loading={loading}
        />
        <DeleteConfirmModal
          isOpen={isBulkDeleteModalOpen}
          isBulk
          companies={selectedCompanies}
          onConfirm={handleConfirmBulkDelete}
          onCancel={handleCancelBulkDelete}
          loading={loading}
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
