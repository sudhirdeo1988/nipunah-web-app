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
import { Dropdown, Space, Modal } from "antd";
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
    createExpert,
    updateExpert,
    deleteExpert,
    fetchExperts,
    handleSort,
  } = useExpert();

  // Confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expertToDelete, setExpertToDelete] = useState(null);

  /**
   * Handle create expert action
   *
   * Creates a new expert and closes modal on success.
   * Error handling is done in the hook with message.error().
   *
   * @param {Object} formData - Form data from CreateExpert component
   * @param {string} formData.name - Name of the expert
   * @param {string} formData.email - Email of the expert
   * @param {string} formData.contact - Contact number
   * @param {string} formData.country - Country
   */
  const handleCreateExpert = useCallback(
    async (formData) => {
      try {
        // Create expert (error handling is in the hook)
        await createExpert(formData);
        // Close modal only on success
        closeModal();
      } catch (error) {
        // Error is already handled in the hook with message.error()
        // Keep modal open so user can retry
        console.error("Error creating expert:", error);
      }
    },
    [createExpert, closeModal]
  );

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
      try {
        if (!selectedExpert) {
          console.error("No expert selected for update");
          return;
        }

        // Update expert (error handling is in the hook)
        await updateExpert(selectedExpert.id, formData);
        // Close modal only on success
        closeModal();
      } catch (error) {
        // Error is already handled in the hook with message.error()
        // Keep modal open so user can retry
        console.error("Error updating expert:", error);
      }
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
   * Routes to appropriate handler based on mode (create/edit).
   * All error handling is done in the individual handler functions.
   *
   * @param {Object} formData - Form data from CreateExpert component
   */
  const handleModalSubmit = useCallback(
    async (formData) => {
      try {
        if (isEditMode) {
          // Edit mode: Update existing expert
          await handleUpdateExpert(formData);
        } else {
          // Create mode: Create new expert
          await handleCreateExpert(formData);
        }
      } catch (error) {
        // Error is already handled in individual handler functions
        // Log for debugging
        console.error("Error in modal submit:", error);
      }
    },
    [isEditMode, handleCreateExpert, handleUpdateExpert]
  );

  /**
   * Get modal title based on mode and edit state
   */
  const getModalTitle = () => {
    return isEditMode ? MODAL_TITLES.EDIT_EXPERT : MODAL_TITLES.ADD_EXPERT;
  };

  return (
    <>
      <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
        <div className="p-3 border-bottom">
          <div className="row align-items-center">
            <div className="col-8">
              <span className="C-heaidng size-5 color-light mb-2 extraBold">
                Experts List
              </span>
            </div>
            <div className="col-4 text-right">
              <button
                className="C-button is-filled small"
                onClick={() => openModal(MODAL_MODES.EXPERT, null)}
              >
                <Space>
                  <Icon name="add" />
                  Add Expert
                </Space>
              </button>
            </div>
          </div>
        </div>
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
          />
        </div>
      </div>

      <Modal
        title={
          <span className="C-heaidng size-5 mb-0 bold">{getModalTitle()}</span>
        }
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        width={600}
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
          <span className="C-heaidng size-5 mb-0 bold">Delete Expert</span>
        }
        open={isDeleteModalOpen}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          className: "C-button is-filled",
          loading: loading, // Show loading state on delete button
        }}
        cancelButtonProps={{
          className: "C-button is-bordered",
          disabled: loading, // Disable cancel during deletion
        }}
        centered
        confirmLoading={loading} // Show loading spinner in modal
      >
        <div className="py-3">
          <p className="C-heading size-6 bold mb-3">
            Are you sure you want to delete this expert? <br /> This action
            cannot be undone.
          </p>
          {expertToDelete && (
            <div className="bg-light p-3 rounded">
              <p className="C-heading size-xs mb-1 text-muted">Expert Name:</p>
              <p className="C-heading size-6 mb-0 bold">
                {expertToDelete.userName}
              </p>
              <p className="C-heading size-xs mb-1 text-muted">Email:</p>
              <p className="C-heading size-6 mb-0">{expertToDelete.email}</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ExpertsPage;
