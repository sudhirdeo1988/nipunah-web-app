"use client";

import React from "react";
import { DatePicker, Divider, Input, Space, Button } from "antd";
import Icon from "@/components/Icon";
const CompanySearch = ({
  searchQuery,
  onSearchChange,
  onCreateCompany,
  onBulkDelete,
  selectedCompanies,
  permissions = {},
}) => {
  const canAdd = Boolean(permissions.add);
  const canDelete = Boolean(permissions.delete);

  return (
    <div className="row align-items-center mb-4">
      <div className="col-7">
        <Space>
          <Space>
            <span className="C-heading size-xs semiBold mb-0">
              Registered On:
            </span>
            <DatePicker size="large" />
          </Space>
          <Divider orientation="vertical" />
        </Space>
      </div>

      <div className="col-5 text-right">
        <Space>
          {canAdd && (
            <Button
              type="primary"
              size="large"
              onClick={onCreateCompany}
              className="C-button is-filled small"
            >
              <Space>
                <Icon name="add" />
                Create Company
              </Space>
            </Button>
          )}

          {canDelete && !!selectedCompanies.length && (
            <Button
              size="large"
              onClick={onBulkDelete}
              className="C-button is-bordered small"
            >
              <Space>
                <Icon name="delete" />
                Delete ({selectedCompanies.length})
              </Space>
            </Button>
          )}

          <Input
            size="large"
            placeholder="Search company"
            prefix={<Icon name="search" />}
            width="200"
            value={searchQuery}
            onChange={onSearchChange}
            allowClear
          />
        </Space>
      </div>
    </div>
  );
};

export default CompanySearch;
