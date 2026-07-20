"use client";

import React from "react";
import { Space } from "antd";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import Job from "@/module/Job";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { ROUTES } from "@/constants/routes";

const JobPage = () => {
  const router = useRouter();
  const { allowed, permissions } = useModuleAccess("jobs");

  if (!allowed) return null;

  const canAdd = Boolean(permissions.add);

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Job Management"
        subtitle="Manage and monitor all job postings across the platform"
        children={
          canAdd && (
            <button
              className="C-button is-filled small"
              onClick={() => router.push(ROUTES.PRIVATE.JOB_CREATE)}
            >
              <Space>
                <Icon name="work" />
                Post a job
              </Space>
            </button>
          )
        }
      />
      <div className="p-3">
        <Job permissions={permissions} />
      </div>
    </div>
  );
};

export default JobPage;
