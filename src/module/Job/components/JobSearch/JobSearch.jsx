"use client";

import React from "react";
import { DatePicker, Divider, Input, Space, Button, Segmented } from "antd";
import Icon from "@/components/Icon";
import { JOB_LIST_VIEW } from "../../constants/jobHiringStatuses";

const JobSearch = ({
  searchQuery,
  onSearchChange,
  onBulkDelete,
  selectedJobs,
  listView = JOB_LIST_VIEW.ACTIVE,
  onListViewChange,
  permissions = {},
}) => {
  const canDelete = Boolean(permissions.delete);
  return (
    <div className="row align-items-center mb-4">
      <div className="col-7">
        <Space wrap>
          <Segmented
            value={listView}
            onChange={onListViewChange}
            options={[
              {
                value: JOB_LIST_VIEW.ACTIVE,
                label: "Active listings",
              },
              {
                value: JOB_LIST_VIEW.HISTORY,
                label: "Job history",
              },
            ]}
          />
          <Divider orientation="vertical" />
          <Space>
            <span className="C-heading size-xs semiBold mb-0">Posted On:</span>
            <DatePicker size="large" />
          </Space>
        </Space>
      </div>

      <div className="col-5 text-right">
        <Space>
          {canDelete && !!selectedJobs.length && (
            <Button
              size="large"
              onClick={onBulkDelete}
              className="C-button is-bordered small"
            >
              <Space>
                <Icon name="delete" />
                Delete ({selectedJobs.length})
              </Space>
            </Button>
          )}

          <Input
            size="large"
            placeholder="Search jobs"
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

export default JobSearch;
