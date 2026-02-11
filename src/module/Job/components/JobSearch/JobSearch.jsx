"use client";

import React from "react";
import { DatePicker, Divider, Input, Space, Button } from "antd";
import Icon from "@/components/Icon";

const JobSearch = ({
  searchQuery,
  onSearchChange,
  onBulkDelete,
  selectedJobs,
  onPostJob,
}) => {
  return (
    <div className="row align-items-center mb-4">
      <div className="col-7">
        <Space>
          <Space>
            <span className="C-heading size-xs semiBold mb-0">Posted On:</span>
            <DatePicker size="large" />
          </Space>
          <Divider orientation="vertical" />
        </Space>
      </div>

      <div className="col-5 text-right">
        <Space>
          <Button
            size="large"
            onClick={onPostJob}
            className="C-button is-filled small"
          >
            <Space>
              <Icon name="work" />
              Post a job
            </Space>
          </Button>

          {!!selectedJobs.length && (
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
