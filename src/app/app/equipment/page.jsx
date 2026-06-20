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
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { Space, Modal, Button, message } from "antd";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import EquipmentListing from "module/Equipment/Components/EquipmentListing";
import { useEquipment } from "module/Equipment/hooks/useEquipment";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { useAppSelector } from "@/store/hooks";
import { canUserManageEquipment } from "@/module/Equipment/utilities/equipmentMapper";

const EquipmentPage = () => {
  const router = useRouter();
  const { allowed, permissions } = useModuleAccess("equipments");
  const user = useAppSelector((state) => state.user?.user);
  const role = useAppSelector((state) => state.user?.role);

  const canManageEquipment = useCallback(
    (record) => canUserManageEquipment(record, user, role),
    [user, role]
  );

  // Equipment operations hook (pure data hook; this page drives its own search/auto-fetch)
  const {
    equipment,
    loading,
    error,
    pagination,
    sortBy,
    order,
    searchQuery,
    setSearchQuery,
    deleteEquipment,
    fetchEquipment,
    handleSort,
  } = useEquipment({ autoFetch: true });

  // Confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);

  /**
   * Handle view equipment action
   */
  const handleViewEquipment = useCallback(
    (record) => {
      if (record?.id == null || record.id === "") return;
      router.push(`${ROUTES.PRIVATE.EQUIPMENT}/${record.id}`);
    },
    [router]
  );

  /**
   * Handle edit equipment action
   */
  const handleEditEquipment = useCallback(
    async (record) => {
      if (record?.id == null || record.id === "") return;
      if (!canManageEquipment(record)) {
        message.warning("You can only edit equipment created by your company.");
        return;
      }
      router.push(`${ROUTES.PRIVATE.EQUIPMENT}/${record.id}/edit`);
    },
    [router, canManageEquipment]
  );

  /**
   * Handle delete equipment click from listing
   */
  const handleDeleteClick = useCallback(
    (record) => {
      if (!canManageEquipment(record)) {
        message.warning("You can only delete equipment created by your company.");
        return;
      }
      setEquipmentToDelete(record);
      setIsDeleteModalOpen(true);
    },
    [canManageEquipment]
  );

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

  if (!allowed) return null;

  const canAdd = Boolean(permissions.add);

  return (
    <>
      <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
        <AppPageHeader
          title="Equipment List"
          subtitle="Manage equipment and assets linked to your company"
          children={
            canAdd ? (
              <button
                className="C-button is-filled small"
                onClick={() => router.push(`${ROUTES.PRIVATE.EQUIPMENT}/add`)}
              >
                <Space>
                  <Icon name="add" />
                  Add Equipment
                </Space>
              </button>
            ) : undefined
            }
        />
        <div className="p-3">
          <EquipmentListing
            equipment={equipment}
            loading={loading}
            pagination={pagination}
            sortBy={sortBy}
            order={order}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onViewEquipment={handleViewEquipment}
            onEditEquipment={handleEditEquipment}
            onDeleteEquipment={handleDeleteClick}
            onFetchEquipment={fetchEquipment}
            permissions={permissions}
            canManageEquipment={canManageEquipment}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="d-flex align-items-center">
            <Icon name="delete" className="me-2" style={{ color: "#ff4d4f" }} />
            <span className="C-heading size-5 semiBold mb-0">
              Delete Equipment: {equipmentToDelete?.name || ""}
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
          Are you sure you want to delete this equipment? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default EquipmentPage;

