"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Empty, Spin } from "antd";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { ROUTES } from "@/constants/routes";
import CreateEquipment from "@/module/Equipment/Components/CreateEquipment";
import { useEquipment } from "@/module/Equipment/hooks/useEquipment";
import {
  canUserManageEquipment,
  extractEquipmentPayload,
  mapApiEquipmentRecord,
} from "@/module/Equipment/utilities/equipmentMapper";
import { equipmentService } from "@/utilities/apiServices";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { useAppSelector } from "@/store/hooks";

const EditEquipmentPage = () => {
  const router = useRouter();
  const params = useParams();
  const equipmentId = params?.equipment_id;
  const { allowed, permissions } = useModuleAccess("equipments");
  const user = useAppSelector((state) => state.user?.user);
  const role = useAppSelector((state) => state.user?.role);
  const { updateEquipment, loading } = useEquipment();

  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadError, setLoadError] = useState("");

  const goBack = useCallback(() => {
    router.push(ROUTES.PRIVATE.EQUIPMENT);
  }, [router]);

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
          setSelectedEquipment(null);
          return;
        }
        if (!canUserManageEquipment(mapped, user, role)) {
          setLoadError("You can only edit equipment created by your company.");
          setSelectedEquipment(null);
          return;
        }
        setSelectedEquipment(mapped);
      } catch (error) {
        if (!mounted) return;
        setLoadError(error?.message || "Failed to load equipment.");
        setSelectedEquipment(null);
      } finally {
        if (mounted) setLoadingDetails(false);
      }
    };

    fetchDetails();
    return () => {
      mounted = false;
    };
  }, [equipmentId, user, role]);

  const handleSubmit = useCallback(
    async (formData) => {
      if (!selectedEquipment?.id) return;
      try {
        await updateEquipment(selectedEquipment.id, formData);
        goBack();
      } catch (error) {
        console.error("Error updating equipment:", error);
      }
    },
    [selectedEquipment, updateEquipment, goBack]
  );

  const headerTitle = useMemo(
    () => `Edit Equipment${selectedEquipment?.name ? `: ${selectedEquipment.name}` : ""}`,
    [selectedEquipment]
  );

  if (!allowed || !permissions?.edit) return null;

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title={headerTitle}
        subtitle="Update your equipment details"
        backLink={{ label: "Back to Equipment", onClick: goBack }}
      />

      <div className="p-3">
        {loadingDetails ? (
          <div className="text-center py-5">
            <Spin size="large" />
          </div>
        ) : loadError ? (
          <Empty description={loadError} />
        ) : (
          <CreateEquipment
            selectedEquipment={selectedEquipment}
            modalMode="equipment"
            onCancel={goBack}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default EditEquipmentPage;
