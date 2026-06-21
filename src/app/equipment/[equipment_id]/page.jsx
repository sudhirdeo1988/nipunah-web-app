"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Empty, Spin } from "antd";
import { useParams, useRouter } from "next/navigation";
import EquipmentPublicProfile from "@/components/EquipmentPublicProfile";
import PublicLayout from "@/layout/PublicLayout";
import {
  extractEquipmentPayload,
  mapApiEquipmentRecord,
} from "@/module/Equipment/utilities/equipmentMapper";
import { ROUTES } from "@/constants/routes";

const EquipmentDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const equipmentId = params?.equipment_id;
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEquipmentDetails = useCallback(async () => {
    if (!equipmentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/equipments/${equipmentId}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Failed to load equipment details");
      }
      const mapped = mapApiEquipmentRecord(extractEquipmentPayload(data));
      if (!mapped?.id) {
        throw new Error("Equipment not found.");
      }
      setEquipment(mapped);
    } catch (err) {
      setError(err?.message || "Failed to load equipment details");
      setEquipment(null);
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  useEffect(() => {
    fetchEquipmentDetails();
  }, [fetchEquipmentDetails]);

  const backLink = useMemo(
    () => ({
      label: "Back to Equipment",
      onClick: () => router.push(ROUTES.PUBLIC.EQUIPMENT),
    }),
    [router]
  );

  return (
    <PublicLayout>
      {loading ? (
        <div className="container text-center py-5">
          <Spin size="large" />
        </div>
      ) : error ? (
        <div className="container py-5">
          <Empty description={error} />
        </div>
      ) : equipment ? (
        <EquipmentPublicProfile equipment={equipment} backLink={backLink} />
      ) : (
        <div className="container py-5">
          <Empty description="Equipment not found." />
        </div>
      )}
    </PublicLayout>
  );
};

export default EquipmentDetailsPage;
