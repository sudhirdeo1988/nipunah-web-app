"use client";

import React, { useRef } from "react";
import { Space } from "antd";
import Icon from "@/components/Icon";
import Job from "@/module/Job";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { useModuleAccess } from "@/hooks/useModuleAccess";

const JobPage = () => {
  const postJobHandlerRef = useRef(null);
  const { allowed, permissions } = useModuleAccess("jobs");

  const handlePostJobClick = () => {
    if (postJobHandlerRef.current) {
      postJobHandlerRef.current();
    }
  };

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
              onClick={handlePostJobClick}
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
        <Job onPostJobClickRef={postJobHandlerRef} permissions={permissions} />
      </div>
    </div>
  );
};

export default JobPage;
