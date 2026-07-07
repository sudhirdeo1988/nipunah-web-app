"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Empty, Spin } from "antd";
import { useParams, useRouter } from "next/navigation";
import CompanyPublicProfile from "@/components/CompanyPublicProfile";
import PublicLayout from "@/layout/PublicLayout";
import { ROUTES } from "@/constants/routes";
import { normalizeCompanyForPublicProfile } from "@/utilities/companyProfileNormalize";

const CompanyDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const companyId = params?.company_id;
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanyDetails = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Failed to load company details");
      }
      const payload =
        data?.data?.company ||
        data?.company ||
        (data?.data && typeof data.data === "object" ? data.data : data);
      setCompany(normalizeCompanyForPublicProfile(payload));
    } catch (err) {
      setError(err?.message || "Failed to load company details");
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  const backLink = useMemo(
    () => ({
      label: "Back to Companies",
      onClick: () => router.push(ROUTES.PUBLIC.COMPANIES),
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
      ) : company ? (
        <CompanyPublicProfile
          company={company}
          companyId={companyId}
          backLink={backLink}
        />
      ) : (
        <div className="container py-5">
          <Empty description="Company not found." />
        </div>
      )}
    </PublicLayout>
  );
};

export default CompanyDetailsPage;
