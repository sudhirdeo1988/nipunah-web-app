"use client";

import Company from "@/module/Company";
import React from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { Space } from "antd";
import Icon from "@/components/Icon";

const CompanyPage = () => {
  const router = useRouter();

  const handleNavigateToEquipment = () => {
    router.push(ROUTES.PRIVATE.EQUIPMENT);
  };

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <div className="p-3 border-bottom">
        <div className="row align-items-center">
          <div className="col-8">
            <span className="C-heading size-5 color-light mb-2 extraBold">
              Company Listing
            </span>
          </div>
          <div className="col-4 text-right">
            <button
              className="C-button is-filled small"
              onClick={handleNavigateToEquipment}
            >
              <Space>
                <Icon name="precision_manufacturing" />
                Equipment Management
              </Space>
            </button>
          </div>
        </div>
      </div>
      <div className="p-3">
        <Company />
      </div>
    </div>
  );
};

export default CompanyPage;
