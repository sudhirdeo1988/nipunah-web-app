"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { ROUTES } from "@/constants/routes";
import CreateEquipment from "@/module/Equipment/Components/CreateEquipment";
import { useEquipment } from "@/module/Equipment/hooks/useEquipment";
import { useModuleAccess } from "@/hooks/useModuleAccess";

const AddEquipmentPage = () => {
  const router = useRouter();
  const { allowed, permissions } = useModuleAccess("equipments");
  const { createEquipment, loading } = useEquipment();

  const goBack = useCallback(() => {
    router.push(ROUTES.PRIVATE.EQUIPMENT);
  }, [router]);

  const handleSubmit = useCallback(
    async (formData) => {
      try {
        await createEquipment(formData);
        goBack();
      } catch (error) {
        console.error("Error creating equipment:", error);
      }
    },
    [createEquipment, goBack]
  );

  if (!allowed || !permissions?.add) return null;

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Add Equipment"
        subtitle="Create a new equipment entry for your company"
        backLink={{ label: "Back to Equipment", onClick: goBack }}
      />

      <div className="p-3">
        <CreateEquipment
          selectedEquipment={null}
          modalMode="equipment"
          onCancel={goBack}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AddEquipmentPage;
