"use client";

import React, { memo } from "react";
import { Modal, Table, Tag } from "antd";

/**
 * PostedJobsModal Component
 *
 * Displays a modal with posted jobs table for a specific company
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Object} props.company - Company data
 * @param {Function} props.onCancel - Handler for modal cancel
 * @returns {JSX.Element} The PostedJobsModal component
 */
const PostedJobsModal = memo(({ isOpen, company, onCancel }) => {
  const columns = [
    {
      title: "Job ID",
      dataIndex: "jobId",
      key: "jobId",
      width: "10%",
      render: (text) => (
        <span className="C-heading size-6 mb-0 semiBold">#{text}</span>
      ),
    },
    {
      title: "Job Title",
      dataIndex: "title",
      key: "title",
      width: "25%",
      render: (text) => (
        <span className="C-heading size-6 mb-0 semiBold">{text}</span>
      ),
    },
    {
      title: "Posted On",
      dataIndex: "postedDate",
      key: "postedDate",
      width: "15%",
      render: (text) => <span className="C-heading size-6 mb-0">{text}</span>,
    },
    {
      title: "Applied People",
      dataIndex: "appliedPeopleCount",
      key: "appliedPeopleCount",
      width: "15%",
      render: (count) => (
        <span className="C-heading size-6 mb-0" style={{ color: "#1890ff" }}>
          {count}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status) => {
        const statusColors = {
          active: "success",
          hold: "warning",
        };
        return (
          <Tag color={statusColors[status] || "default"}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      width: "20%",
      render: (text) => <span className="C-heading size-6 mb-0">{text}</span>,
    },
  ];

  return (
    <Modal
      title={
        <span className="C-heading size-5 mb-0 bold">
          Posted Jobs - {company?.name}
        </span>
      }
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      width={1000}
      centered
    >
      <div className="py-3">
        {company && company.postedJobs?.length > 0 ? (
          <Table
            columns={columns}
            dataSource={company.postedJobs}
            rowKey="jobId"
            pagination={{
              hideOnSinglePage: true,
              defaultPageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} jobs`,
              pageSizeOptions: ["10", "20", "50"],
            }}
            size="small"
          />
        ) : (
          <div className="text-center py-4">
            <p className="C-heading size-6 mb-0 text-muted">
              No jobs posted by this company yet
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
});

PostedJobsModal.displayName = "PostedJobsModal";

export default PostedJobsModal;
