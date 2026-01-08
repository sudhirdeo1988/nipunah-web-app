"use client";

/**
 * EquipmentPage Component
 *
 * Main page component for managing equipment.
 * Provides full CRUD operations with proper loading, error, and success states.
 *
 * Features:
 * - Equipment listing with pagination, sorting, and search
 * - Create/Edit equipment
 * - Delete with confirmation modal
 *
 * API Endpoints Used:
 * - GET /equipment - Fetch equipment list
 * - POST /equipment - Create equipment
 * - PUT /equipment/{id} - Update equipment
 * - DELETE /equipment/{id} - Delete equipment
 */

import React, { useCallback, useState } from "react";
import Icon from "@/components/Icon";
import { Space, Modal, Breadcrumb } from "antd";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useRole } from "@/hooks/useRole";
import EquipmentListing from "module/Equipment/Components/EquipmentListing";
import CreateEquipment from "module/Equipment/Components/CreateEquipment";
import {
  MODAL_MODES,
  MODAL_TITLES,
} from "module/Equipment/constants/equipmentConstants";
import { useEquipmentModal } from "module/Equipment/hooks/useEquipmentModal";
import { useEquipment } from "module/Equipment/hooks/useEquipment";

const EquipmentPage = () => {
  const router = useRouter();
  const { isCompany } = useRole();
  const {
    isModalOpen,
    selectedEquipment,
    modalMode,
    isEditMode,
    openModal,
    closeModal,
  } = useEquipmentModal();

  // Equipment operations hook with pagination and sorting support
  const {
    equipment,
    loading,
    error,
    pagination,
    sortBy,
    order,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    fetchEquipment,
    handleSort,
  } = useEquipment();

  // Confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);

  /**
   * Handle create equipment action
   */
  const handleCreateEquipment = useCallback(
    async (formData) => {
      try {
        await createEquipment(formData);
        closeModal();
      } catch (error) {
        console.error("Error creating equipment:", error);
      }
    },
    [createEquipment, closeModal]
  );

  /**
   * Handle edit equipment action
   */
  const handleEditEquipment = useCallback(
    async (record) => {
      openModal(MODAL_MODES.EQUIPMENT, record);
    },
    [openModal]
  );

  /**
   * Handle update equipment action
   */
  const handleUpdateEquipment = useCallback(
    async (formData) => {
      try {
        if (!selectedEquipment) {
          console.error("No equipment selected for update");
          return;
        }

        await updateEquipment(selectedEquipment.id, formData);
        closeModal();
      } catch (error) {
        console.error("Error updating equipment:", error);
      }
    },
    [selectedEquipment, updateEquipment, closeModal]
  );

  /**
   * Handle delete equipment click from listing
   */
  const handleDeleteClick = useCallback((record) => {
    setEquipmentToDelete(record);
    setIsDeleteModalOpen(true);
  }, []);

  /**
   * Handle confirm delete action
   */
  const handleConfirmDelete = useCallback(async () => {
    if (equipmentToDelete) {
      await deleteEquipment(equipmentToDelete.id);
      setIsDeleteModalOpen(false);
      setEquipmentToDelete(null);
    }
  }, [equipmentToDelete, deleteEquipment]);

  /**
   * Handle cancel delete action
   */
  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setEquipmentToDelete(null);
  }, []);

  /**
   * Handle modal form submission
   */
  const handleModalSubmit = useCallback(
    async (formData) => {
      try {
        if (isEditMode) {
          await handleUpdateEquipment(formData);
        } else {
          await handleCreateEquipment(formData);
        }
      } catch (error) {
        console.error("Error in modal submit:", error);
      }
    },
    [isEditMode, handleCreateEquipment, handleUpdateEquipment]
  );

  /**
   * Get modal title based on mode and edit state
   */
  const getModalTitle = () => {
    return isEditMode
      ? MODAL_TITLES.EDIT_EQUIPMENT
      : MODAL_TITLES.ADD_EQUIPMENT;
  };

  return (
    <>
      <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
        <div className="p-3 border-bottom">
          <Breadcrumb
            className="mb-3"
            items={[
              {
                title: (
                  <span
                    className="C-heading size-xs color-light mb-0"
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push(ROUTES.PRIVATE.COMPANY)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#1890ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "";
                    }}
                  >
                    Companies
                  </span>
                ),
              },
              {
                title: (
                  <span className="C-heading size-xs color-dark mb-0 bold">
                    Equipment
                  </span>
                ),
              },
            ]}
            separator={
              <Icon name="chevron_right" style={{ fontSize: "12px", color: "#8c8c8c" }} />
            }
          />
          <div className="row align-items-center">
            <div className="col-8">
              <span className="C-heaidng size-5 color-light mb-2 extraBold">
                Equipment List
              </span>
            </div>
            {isCompany() && (
              <div className="col-4 text-right">
                <button
                  className="C-button is-filled small"
                  onClick={() => openModal(MODAL_MODES.EQUIPMENT, null)}
                >
                  <Space>
                    <Icon name="add" />
                    Add Equipment
                  </Space>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-3">
          <EquipmentListing
            equipment={equipment}
            loading={loading}
            pagination={pagination}
            sortBy={sortBy}
            order={order}
            onEditEquipment={handleEditEquipment}
            onDeleteEquipment={handleDeleteClick}
            onFetchEquipment={fetchEquipment}
          />
        </div>
      </div>

      <Modal
        title={
          <span className="C-heaidng size-5 mb-0 bold">{getModalTitle()}</span>
        }
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        width={900}
        centered
        footer={null}
        onCancel={closeModal}
      >
        <CreateEquipment
          selectedEquipment={selectedEquipment}
          modalMode={modalMode}
          onCancel={closeModal}
          onSubmit={handleModalSubmit}
          loading={loading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <span className="C-heaidng size-5 mb-0 bold">Delete Equipment</span>
        }
        open={isDeleteModalOpen}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          className: "C-button is-filled",
          loading: loading,
        }}
        cancelButtonProps={{
          className: "C-button is-bordered",
          disabled: loading,
        }}
        centered
        confirmLoading={loading}
      >
        <div className="py-3">
          <p className="C-heading size-6 bold mb-3">
            Are you sure you want to delete this equipment? <br /> This action
            cannot be undone.
          </p>
          {equipmentToDelete && (
            <div className="bg-light p-3 rounded">
              <p className="C-heading size-xs mb-1 text-muted">Equipment Name:</p>
              <p className="C-heading size-6 mb-0 bold">
                {equipmentToDelete.name}
              </p>
              <p className="C-heading size-xs mb-1 text-muted">Category:</p>
              <p className="C-heading size-6 mb-0">{equipmentToDelete.category}</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default EquipmentPage;

