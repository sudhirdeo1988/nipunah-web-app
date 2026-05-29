"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Empty, Spin } from "antd";
import { useParams, useRouter } from "next/navigation";
import PublicLayout from "@/layout/PublicLayout";
import ExpertPublicProfile from "@/components/ExpertPublicProfile";
import { ROUTES } from "@/constants/routes";
import { normalizeExpertPublicProfile } from "@/utilities/expertPublicProfile";

const ExpertDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const expertId = params?.expert_id;
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpertDetails = useCallback(async () => {
    if (!expertId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/experts/${expertId}`, {
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to load expert details");
      }

      const payload =
        data?.data?.expert ||
        data?.expert ||
        (data?.data && typeof data.data === "object" ? data.data : data);
      setExpert(normalizeExpertPublicProfile(payload));
    } catch (err) {
      setError(err?.message || "Failed to load expert details");
      setExpert(null);
    } finally {
      setLoading(false);
    }
  }, [expertId]);

  useEffect(() => {
    fetchExpertDetails();
  }, [fetchExpertDetails]);

  const goToExpertsListing = useCallback(() => {
    router.push(ROUTES.PUBLIC.EXPERTS);
  }, [router]);

  const backLink = useMemo(
    () => ({
      label: "Back to Experts",
      onClick: goToExpertsListing,
    }),
    [goToExpertsListing]
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
      ) : expert ? (
        <ExpertPublicProfile expert={expert} backLink={backLink} />
      ) : (
        <div className="container py-5">
          <Empty description="Expert not found." />
        </div>
      )}
    </PublicLayout>
  );
};

export default ExpertDetailsPage;
