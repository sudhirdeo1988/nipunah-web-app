"use client";

import Company from "@/module/Company";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { Space } from "antd";
import Icon from "@/components/Icon";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { useModuleAccess } from "@/hooks/useModuleAccess";

const CompanyPage = () => {
  const router = useRouter();
  const [createCompanyRequestId, setCreateCompanyRequestId] = useState(0);
  const { allowed, permissions } = useModuleAccess("company");

  const handleNavigateToEquipment = () => {
    router.push(ROUTES.PRIVATE.EQUIPMENT);
  };

  if (!allowed) return null;

  const canAdd = Boolean(permissions.add);

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Company Listing"
        subtitle="View and manage registered companies on the platform"
        children={
          canAdd && (
            <Space>
              <button
                className="C-button is-filled small"
                onClick={() => setCreateCompanyRequestId((id) => id + 1)}
              >
                <Space>
                  <Icon name="add" />
                  Create Company
                </Space>
              </button>
              <button
                className="C-button is-filled small"
                onClick={() => router.push(ROUTES.PRIVATE.JOB_CREATE)}
              >
                <Space>
                  <Icon name="work" />
                  Post a job
                </Space>
              </button>
              <button
                className="C-button is-filled small"
                onClick={handleNavigateToEquipment}
              >
                <Space>
                  <Icon name="precision_manufacturing" />
                  Equipment Management
                </Space>
              </button>
            </Space>
          )
        }
      />
      <div className="p-3">
        <Company
          permissions={permissions}
          createCompanyRequestId={createCompanyRequestId}
        />
      </div>
    </div>
  );
};

export default CompanyPage;
