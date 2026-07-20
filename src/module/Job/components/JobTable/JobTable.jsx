"use client";

import React, { useCallback, useMemo, memo } from "react";
import { Table, Tag, Dropdown, Space } from "antd";
import Icon from "@/components/Icon";
import {
  JOB_STATUS_COLORS,
  EXPERIENCE_COLORS,
} from "../../constants/jobConstants";

/**
 * JobTable Component
 *
 * Renders the main job listing table with all columns and actions
 *
 * @param {Object} props - Component props
 * @param {Array} props.jobs - List of jobs to display
 * @param {Object} props.rowSelection - Row selection configuration
 * @param {Function} props.onMenuClick - Handler for action menu clicks
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.pagination - Pagination configuration
 * @param {Function} props.onChange - Handler for table changes (pagination, sorting)
 * @returns {JSX.Element} The JobTable component
 */
const JobTable = memo(({ jobs, rowSelection, onMenuClick, loading = false, pagination: paginationConfig, onChange, permissions = {} }) => {
  const canView = Boolean(permissions.view);
  const canEdit = Boolean(permissions.edit);
  const canApprove = Boolean(permissions.approve);
  const canDelete = Boolean(permissions.delete);

  // ==================== MEMOIZED RENDER FUNCTIONS ====================

  /**
   * Memoized render function for job title column
   */
  const renderJobTitle = useCallback(
    (text, record) => (
      <div>
        <span className="C-heading size-6 mb-1 semiBold">{text || "N/A"}</span>
        <div className="C-heading size-xss mb-0 text-muted">
          {record.employmentType || "N/A"}
        </div>
      </div>
    ),
    []
  );

  /**
   * Memoized render function for posted by company column
   */
  const renderPostedBy = useCallback(
    (postedBy) => {
      if (!postedBy) return <span className="C-heading size-6 mb-0">N/A</span>;
      return (
        <div>
          <span className="C-heading size-6 mb-1 semiBold">
            {postedBy.companyName || "N/A"}
          </span>
          <div className="C-heading size-xss mb-0 text-muted">
            {postedBy.companyShortName || ""}
          </div>
        </div>
      );
    },
    []
  );

  /**
   * Memoized render function for experience required column
   */
  const renderExperience = useCallback((experience) => {
    if (!experience) return <span className="C-heading size-6 mb-0">N/A</span>;
    
    // Extract years from experience string for color mapping
    const years = experience.match(/\d+/)?.[0];
    const colorKey = years
      ? parseInt(years) <= 1
        ? "0-1 years"
        : parseInt(years) <= 3
        ? "1-3 years"
        : parseInt(years) <= 5
        ? "3-5 years"
        : parseInt(years) <= 8
        ? "5-8 years"
        : "8+ years"
      : "default";

    return (
      <Tag color={EXPERIENCE_COLORS[colorKey] || "default"}>{experience}</Tag>
    );
  }, []);

  /**
   * Memoized render function for location column
   */
  const renderLocation = useCallback(
    (location) => <span className="C-heading size-6 mb-0">{location || "N/A"}</span>,
    []
  );

  /**
   * Memoized render function for people applied column
   */
  const renderPeopleApplied = useCallback(
    (count, record) => {
      const appliedCount = count || 0;
      return (
        <button
          className="C-button is-clean small"
          onClick={() => onMenuClick({ key: "view_applied_users" }, record)}
          style={{
            color: "#1890ff",
            textDecoration: "underline",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          {appliedCount}
        </button>
      );
    },
    [onMenuClick]
  );

  /**
   * Memoized dropdown menu items for action column (filtered by permissions)
   */
  const getActionMenuItems = useCallback(
    (record) => {
      const items = [];
      if (canView) {
        items.push({
          key: "view_details",
          label: (
            <Space align="center">
              <Icon name="visibility" size="small" />
              <span className="C-heading size-xs mb-0 semiBold">View Details</span>
            </Space>
          ),
        });
      }
      if (canEdit) {
        items.push({
          key: "edit",
          label: (
            <Space align="center">
              <Icon name="edit" size="small" />
              <span className="C-heading size-xs mb-0 semiBold">Edit</span>
            </Space>
          ),
        });
      }
      if (canApprove) {
        items.push({
          key: record.status === "approved" ? "block" : "approve",
          label: (
            <Space align="center">
              <Icon name={record.status === "approved" ? "block" : "check_circle"} size="small" />
              <span className="C-heading size-xs mb-0 semiBold">
                {record.status === "approved" ? "Block" : "Approve"}
              </span>
            </Space>
          ),
        });
      }
      if (canDelete) {
        items.push({
          key: "delete",
          label: (
            <Space align="center">
              <Icon name="delete" size="small" />
              <span className="C-heading size-xs mb-0 semiBold">Delete</span>
            </Space>
          ),
        });
      }
      return items;
    },
    [canView, canEdit, canApprove, canDelete]
  );

  /**
   * Memoized render function for action column
   * Creates dropdown menu with view details, edit, approve/block, and delete options
   */
  const renderAction = useCallback(
    (_, record) => {
      const items = getActionMenuItems(record);
      if (items.length === 0) return null;
      return (
        <Dropdown
          menu={{
            items,
            onClick: (menuInfo) => onMenuClick(menuInfo, record),
          }}
          trigger={["hover"]}
          placement="bottomRight"
        >
          <button
            className="C-settingButton is-clean small"
            onClick={(e) => e.stopPropagation()}
          >
            <Icon name="more_vert" />
          </button>
        </Dropdown>
      );
    },
    [getActionMenuItems, onMenuClick]
  );

  /**
   * Memoized render function for status column
   */
  const renderStatus = useCallback((status) => {
    if (!status) return <span className="C-heading size-6 mb-0">N/A</span>;
    return (
      <Tag color={JOB_STATUS_COLORS[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    );
  }, []);

  // ==================== TABLE CONFIGURATION ====================

  /**
   * Essential columns only for the listing table
   */
  const columns = useMemo(
    () => [
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        width: "28%",
        render: renderJobTitle,
        sorter: (a, b) => a.title.localeCompare(b.title),
      },
      {
        title: "Company",
        dataIndex: "postedBy",
        key: "postedBy",
        width: "20%",
        render: renderPostedBy,
        sorter: (a, b) =>
          (a.postedBy?.companyName || "").localeCompare(
            b.postedBy?.companyName || ""
          ),
      },
      {
        title: "Location",
        dataIndex: "location",
        key: "location",
        width: "16%",
        render: renderLocation,
        sorter: (a, b) =>
          String(a.location || "").localeCompare(String(b.location || "")),
      },
      {
        title: "Experience",
        dataIndex: "experienceRequired",
        key: "experienceRequired",
        width: "12%",
        render: renderExperience,
        sorter: (a, b) => {
          const aYears = parseInt(
            a.experienceRequired?.match(/\d+/)?.[0] || 0,
            10
          );
          const bYears = parseInt(
            b.experienceRequired?.match(/\d+/)?.[0] || 0,
            10
          );
          return aYears - bYears;
        },
      },
      {
        title: "Applicants",
        dataIndex: "peopleApplied",
        key: "peopleApplied",
        width: "10%",
        render: renderPeopleApplied,
        sorter: (a, b) => (a.peopleApplied || 0) - (b.peopleApplied || 0),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: "10%",
        render: renderStatus,
        filters: [
          { text: "Pending", value: "pending" },
          { text: "Approved", value: "approved" },
          { text: "Blocked", value: "blocked" },
        ],
        onFilter: (value, record) => record.status === value,
      },
      {
        title: "Action",
        dataIndex: "action",
        key: "action",
        width: "8%",
        fixed: "right",
        render: renderAction,
      },
    ],
    [
      renderJobTitle,
      renderPostedBy,
      renderLocation,
      renderExperience,
      renderPeopleApplied,
      renderStatus,
      renderAction,
    ]
  );

  return (
    <Table
      columns={columns}
      dataSource={jobs}
      rowKey="id"
      rowSelection={rowSelection}
      pagination={
        paginationConfig
          ? {
              current: paginationConfig.current,
              pageSize: paginationConfig.pageSize,
              total: paginationConfig.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} jobs`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }
          : {
              hideOnSinglePage: true,
              defaultPageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} jobs`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }
      }
      loading={loading}
      onChange={onChange}
      scroll={{ x: 900 }}
    />
  );
});

JobTable.displayName = "JobTable";

export default JobTable;
