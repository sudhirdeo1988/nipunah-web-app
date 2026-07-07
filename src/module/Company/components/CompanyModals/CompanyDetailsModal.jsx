"use client";

import React, { memo, useCallback, useEffect, useState } from "react";
import { Modal, Spin, Empty } from "antd";
import CompanyProfileSection from "@/components/Profile/CompanyProfileSection";
import { normalizeCompanyUser } from "@/utilities/companyProfileNormalize";

function extractCompanyPayload(data) {
  return (
    data?.data?.company ||
    data?.company ||
    (data?.data && typeof data.data === "object" ? data.data : data)
  );
}

/**
 * CompanyDetailsModal Component
 *
 * Displays company information using the same layout as app/profile (CompanyProfileSection).
 */
const CompanyDetailsModal = memo(({ isOpen, company, onCancel }) => {
  const [profileCompany, setProfileCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const companyId = company?.id ?? company?.company_id ?? company?.companyId;

  const fetchCompanyDetails = useCallback(async () => {
    if (!companyId) {
      setProfileCompany(normalizeCompanyUser(company || {}));
      return;
    }

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

      setProfileCompany(extractCompanyPayload(data));
    } catch (err) {
      setError(err?.message || "Failed to load company details");
      setProfileCompany(normalizeCompanyUser(company || {}));
    } finally {
      setLoading(false);
    }
  }, [company, companyId]);

  useEffect(() => {
    if (!isOpen) {
      setProfileCompany(null);
      setError(null);
      return;
    }

    fetchCompanyDetails();
  }, [isOpen, fetchCompanyDetails]);

  return (
    <Modal
      title={
        <span className="C-heading size-5 mb-0 bold">Company Details</span>
      }
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      width={960}
      centered
      destroyOnClose
      styles={{ body: { maxHeight: "80vh", overflowY: "auto", paddingTop: 8 } }}
    >
      {loading ? (
        <div className="text-center py-5">
          <Spin size="large" />
        </div>
      ) : error && !profileCompany ? (
        <Empty description={error} />
      ) : profileCompany ? (
        <CompanyProfileSection data={profileCompany} showApprovalStatus />
      ) : (
        <Empty description="Company not found." />
      )}
    </Modal>
  );
});

CompanyDetailsModal.displayName = "CompanyDetailsModal";

export default CompanyDetailsModal;
