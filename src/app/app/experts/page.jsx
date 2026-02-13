"use client";

/**
 * ExpertsPage Component
 *
 * Main page component for managing experts.
 * Provides full CRUD operations with proper loading, error, and success states.
 *
 * Features:
 * - Expert listing with pagination, sorting, and search
 * - Create/Edit experts
 * - Delete with confirmation modal
 * - Error boundary for graceful error handling
 *
 * API Endpoints Used:
 * - GET /experts - Fetch experts list
 * - POST /experts - Create expert
 * - PUT /experts/{id} - Update expert
 * - DELETE /experts/{id} - Delete expert
 */

import React, { useCallback, useState } from "react";
import Icon from "@/components/Icon";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { Dropdown, Space, Modal, Button } from "antd";
import ExpertUserListing from "module/Experts/Components/ExpertUserListing";
import CreateExpert from "module/Experts/Components/CreateExpert";
import {
  MODAL_MODES,
  MODAL_TITLES,
} from "module/Experts/constants/expertConstants";
import { useExpertModal } from "module/Experts/hooks/useExpertModal";
import { useExpert } from "module/Experts/hooks/useExpert";

const ExpertsPage = () => {
  const {
    isModalOpen,
    selectedExpert,
    modalMode,
    isEditMode,
    openModal,
    closeModal,
  } = useExpertModal();

  // Expert operations hook with pagination and sorting support
  const {
    experts,
    loading,
    error,
    pagination,
    sortBy,
    order,
    updateExpert,
    updateApprovalStatus,
    deleteExpert,
    fetchExperts,
    handleSort,
  } = useExpert();

  // Confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expertToDelete, setExpertToDelete] = useState(null);

  /**
   * Handle edit expert action
   *
   * API Endpoint: PUT /experts/{id}
   *
   * Payload: { "name": "string", "email": "string", "contact": "string", "country": "string" }
   *
   * Shows loading state, calls update API, shows success/error messages,
   * and refreshes the list after successful update.
   */
  const handleEditExpert = useCallback(
    async (record) => {
      // Open modal with expert data for editing
      openModal(MODAL_MODES.EXPERT, record);
    },
    [openModal]
  );

  /**
   * Handle update expert action
   *
   * API Endpoint: PUT /experts/{id}
   *
   * Payload: { "name": "string", "email": "string", "contact": "string", "country": "string" }
   */
  const handleUpdateExpert = useCallback(
    async (formData) => {
      if (!selectedExpert) {
        console.error("No expert selected for update");
        throw new Error("No expert selected for update");
      }

      // Update expert (error handling is in the hook)
      // Re-throw error so parent can handle it
      await updateExpert(selectedExpert.id, formData);
      // Close modal only on success
      closeModal();
    },
    [selectedExpert, updateExpert, closeModal]
  );

  /**
   * Handle delete expert action
   *
   * Opens confirmation modal before deletion.
   *
   * @param {number} expertId - ID of the expert to delete
   */
  const handleDeleteExpert = useCallback(
    async (expertId) => {
      try {
        // Delete expert (error handling is in the hook)
        await deleteExpert(expertId);
        // Close modal only on success
        setIsDeleteModalOpen(false);
        setExpertToDelete(null);
      } catch (error) {
        // Error is already handled in the hook with message.error()
        // Keep modal open so user can retry or cancel
        console.error("Error deleting expert:", error);
      }
    },
    [deleteExpert]
  );

  /**
   * Handle delete expert click from listing
   *
   * Opens confirmation modal before deletion.
   *
   * @param {Object} record - Expert record to delete
   */
  const handleDeleteClick = useCallback((record) => {
    setExpertToDelete(record);
    setIsDeleteModalOpen(true);
  }, []);

  /**
   * Handle confirm delete action
   *
   * API Endpoint: DELETE /experts/{id}
   */
  const handleConfirmDelete = useCallback(async () => {
    if (expertToDelete) {
      await handleDeleteExpert(expertToDelete.id);
    }
  }, [expertToDelete, handleDeleteExpert]);

  /**
   * Handle cancel delete action
   *
   * Closes delete confirmation modal without deleting.
   */
  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setExpertToDelete(null);
  }, []);

  /**
   * Handle modal form submission
   *
   * Only handles edit mode (create is removed).
   * Re-throws error so form component can handle it properly.
   *
   * @param {Object} formData - Form data from CreateExpert component
   */
  const handleModalSubmit = useCallback(
    async (formData) => {
      // Only edit mode is supported
      // Re-throw error so form doesn't reset on failure
      await handleUpdateExpert(formData);
    },
    [handleUpdateExpert]
  );

  return (
    <>
      <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
        <AppPageHeader
        title="Experts List"
        subtitle="View and manage expert profiles and approval status"
      />
        <div className="p-3">
          <ExpertUserListing
            experts={experts}
            loading={loading}
            pagination={pagination}
            sortBy={sortBy}
            order={order}
            onEditExpert={handleEditExpert}
            onDeleteExpert={handleDeleteClick}
            onFetchExperts={fetchExperts}
            onUpdateApprovalStatus={updateApprovalStatus}
          />
        </div>
      </div>

      <Modal
        title={
          <span className="C-heading size-5 mb-0 bold">
            {MODAL_TITLES.EDIT_EXPERT}
          </span>
        }
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        width={900}
        centered
        footer={null}
        onCancel={closeModal}
      >
        <CreateExpert
          selectedExpert={selectedExpert}
          modalMode={modalMode}
          onCancel={closeModal}
          onSubmit={handleModalSubmit}
          loading={loading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="d-flex align-items-center">
            <Icon name="delete" className="me-2" style={{ color: "#ff4d4f" }} />
            <span className="C-heading size-5 semiBold mb-0">
              Delete Expert: {expertToDelete?.userName || expertToDelete?.name || ""}
            </span>
          </div>
        }
        open={isDeleteModalOpen}
        onCancel={handleCancelDelete}
        footer={
          <div className="d-flex justify-content-end gap-2">
            <Button 
              onClick={handleCancelDelete} 
              className="C-button is-bordered small"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              onClick={handleConfirmDelete}
              className="C-button is-filled small"
              loading={loading}
            >
              Delete
            </Button>
          </div>
        }
        confirmLoading={loading}
        width={400}
        className="delete-confirm-modal"
      >
        <p className="C-heading size-xs text-muted mb-0">
          Are you sure you want to delete this expert? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default ExpertsPage;
