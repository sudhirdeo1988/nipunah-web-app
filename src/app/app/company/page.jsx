"use client";

import Company from "@/module/Company";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { Space } from "antd";
import Icon from "@/components/Icon";
import CreateJobModal from "@/module/Job/components/JobModals/CreateJobModal";

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
        <div className="p-3 border-bottom">
          <div className="row align-items-center">
            <div className="col-8">
              <span className="C-heading size-5 color-light mb-2 extraBold">
                Company Listing
              </span>
            </div>
            <div className="col-4 text-right">
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
            </div>
          </div>
        </div>
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
