"use client";

import Company from "@/module/Company";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { Space } from "antd";
import Icon from "@/components/Icon";
import CreateJobModal from "@/module/Job/components/JobModals/CreateJobModal";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";

const CompanyPage = () => {
  const router = useRouter();
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);

  const handleNavigateToEquipment = () => {
    router.push(ROUTES.PRIVATE.EQUIPMENT);
  };

  const handleOpenPostJobModal = () => {
    setIsPostJobModalOpen(true);
  };

  const handleClosePostJobModal = () => {
    setIsPostJobModalOpen(false);
  };

  const handlePostJobSubmit = async (payload) => {
    // Called after successful job posting
    // Modal will close automatically after this
    handleClosePostJobModal();
  };

  return (
    <>
      <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
        <AppPageHeader
          title="Company Listing"
          subtitle="View and manage registered companies on the platform"
          children={
            <Space>
              <button
                className="C-button is-filled small"
                onClick={handleOpenPostJobModal}
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
          }
        />
        <div className="p-3">
          <Company />
        </div>
      </div>

      <CreateJobModal
        isOpen={isPostJobModalOpen}
        onCancel={handleClosePostJobModal}
        onSubmit={handlePostJobSubmit}
      />
    </>
  );
};

export default CompanyPage;
