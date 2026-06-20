"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Empty, Modal, Space, Spin, message } from "antd";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import Icon from "@/components/Icon";
import { ROUTES } from "@/constants/routes";
import EquipmentDetails from "@/module/Equipment/Components/EquipmentDetails/EquipmentDetails";
import { useEquipment } from "@/module/Equipment/hooks/useEquipment";
import {
  canUserManageEquipment,
  extractEquipmentPayload,
  mapApiEquipmentRecord,
} from "@/module/Equipment/utilities/equipmentMapper";
import { equipmentService } from "@/utilities/apiServices";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { useAppSelector } from "@/store/hooks";

const ViewEquipmentPage = () => {
  const router = useRouter();
  const params = useParams();
  const equipmentId = params?.equipment_id;
  const { allowed, permissions } = useModuleAccess("equipments");
  const user = useAppSelector((state) => state.user?.user);
  const role = useAppSelector((state) => state.user?.role);
  const { deleteEquipment, loading: deleting } = useEquipment();

  const [equipment, setEquipment] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const goBack = useCallback(() => {
    router.push(ROUTES.PRIVATE.EQUIPMENT);
  }, [router]);

  const canManage = useMemo(
    () => (equipment ? canUserManageEquipment(equipment, user, role) : false),
    [equipment, user, role]
  );

  const canEdit = Boolean(permissions.edit) && canManage;
  const canDelete = Boolean(permissions.delete) && canManage;

  useEffect(() => {
    let mounted = true;

    const fetchDetails = async () => {
      if (!equipmentId) {
        setLoadError("Invalid equipment.");
        setLoadingDetails(false);
        return;
      }

      setLoadingDetails(true);
      setLoadError("");
      try {
        const response = await equipmentService.getEquipmentById(equipmentId);
        const mapped = mapApiEquipmentRecord(extractEquipmentPayload(response));
        if (!mounted) return;
        if (!mapped?.id) {
          setLoadError("Equipment not found.");
          setEquipment(null);
          return;
        }
        setEquipment(mapped);
      } catch (error) {
        if (!mounted) return;
        setLoadError(error?.message || "Failed to load equipment.");
        setEquipment(null);
      } finally {
        if (mounted) setLoadingDetails(false);
      }
    };

    fetchDetails();
    return () => {
      mounted = false;
    };
  }, [equipmentId]);

  const handleEdit = useCallback(() => {
    if (!equipment?.id) return;
    if (!canManage) {
      message.warning("You can only edit equipment created by your company.");
      return;
    }
    router.push(`${ROUTES.PRIVATE.EQUIPMENT}/${equipment.id}/edit`);
  }, [equipment, canManage, router]);

  const handleDeleteClick = useCallback(() => {
    if (!equipment?.id) return;
    if (!canManage) {
      message.warning("You can only delete equipment created by your company.");
      return;
    }
    setIsDeleteModalOpen(true);
  }, [equipment, canManage]);

  const handleConfirmDelete = useCallback(async () => {
    if (!equipment?.id) return;
    try {
      await deleteEquipment(equipment.id);
      setIsDeleteModalOpen(false);
      goBack();
    } catch {
      // Error surfaced by hook
    }
  }, [equipment, deleteEquipment, goBack]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const headerTitle = useMemo(() => "Equipment Details", []);

  if (!allowed || !permissions?.view) return null;

  return (
    <>
      <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
        <AppPageHeader
          title={headerTitle}
          subtitle="View equipment information"
          backLink={{ label: "Back to Equipment", onClick: goBack }}
          children={
            <Space wrap>
              {canEdit && (
                <button className="C-button is-filled small" onClick={handleEdit}>
                  <Space>
                    <Icon name="edit" />
                    Edit
                  </Space>
                </button>
              )}
              {canDelete && (
                <button className="C-button is-bordered small" onClick={handleDeleteClick}>
                  <Space>
                    <Icon name="delete" />
                    Delete
                  </Space>
                </button>
              )}
            </Space>
          }
        />

        <div className="p-3">
          {loadingDetails ? (
            <div className="text-center py-5">
              <Spin size="large" />
            </div>
          ) : loadError ? (
            <Empty description={loadError} />
          ) : (
            <EquipmentDetails equipment={equipment} />
          )}
        </div>
      </div>

      <Modal
        title={
          <div className="d-flex align-items-center">
            <Icon name="delete" className="me-2" style={{ color: "#ff4d4f" }} />
            <span className="C-heading size-5 semiBold mb-0">
              Delete Equipment: {equipment?.name || ""}
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
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              onClick={handleConfirmDelete}
              className="C-button is-filled small"
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        }
        confirmLoading={deleting}
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

export default ViewEquipmentPage;
