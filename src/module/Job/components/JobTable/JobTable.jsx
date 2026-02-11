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
const JobTable = memo(({ jobs, rowSelection, onMenuClick, loading = false, pagination: paginationConfig, onChange }) => {
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
   * Memoized render function for salary range column
   */
  const renderSalaryRange = useCallback(
    (salary) => (
      <span
        className="C-heading size-6 mb-0 semiBold"
        style={{ color: "#52c41a" }}
      >
        {salary || "N/A"}
      </span>
    ),
    []
  );

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
   * Memoized render function for posted on column
   * Formats and displays the date
   */
  const renderPostedOn = useCallback(
    (date) => {
      if (!date) return <span className="C-heading size-6 mb-0">N/A</span>;
      
      // If date is already formatted (YYYY-MM-DD), display as is
      // Otherwise try to format it
      try {
        const dateStr = typeof date === "string" ? date : String(date);
        // If it's already in YYYY-MM-DD format, use it
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return <span className="C-heading size-6 mb-0">{dateStr}</span>;
        }
        // Otherwise try to parse and format
        const dateObj = new Date(dateStr);
        if (!isNaN(dateObj.getTime())) {
          const formatted = dateObj.toISOString().split("T")[0];
          return <span className="C-heading size-6 mb-0">{formatted}</span>;
        }
      } catch (error) {
        console.error("Error formatting date:", error);
      }
      
      return <span className="C-heading size-6 mb-0">{date || "N/A"}</span>;
    },
    []
  );

  /**
   * Memoized dropdown menu items for action column
   */
  const getActionMenuItems = useCallback(
    (record) => [
      {
        key: "view_details",
        label: (
          <Space align="center">
            <Icon name="visibility" size="small" />
            <span className="C-heading size-xs mb-0 semiBold">
              View Details
            </span>
          </Space>
        ),
      },
      {
        key: "edit",
        label: (
          <Space align="center">
            <Icon name="edit" size="small" />
            <span className="C-heading size-xs mb-0 semiBold">Edit</span>
          </Space>
        ),
      },
      {
        key: record.status === "approved" ? "block" : "approve",
        label: (
          <Space align="center">
            <Icon
              name={record.status === "approved" ? "block" : "check_circle"}
              size="small"
            />
            <span className="C-heading size-xs mb-0 semiBold">
              {record.status === "approved" ? "Block" : "Approve"}
            </span>
          </Space>
        ),
      },
      {
        key: "delete",
        label: (
          <Space align="center">
            <Icon name="delete" size="small" />
            <span className="C-heading size-xs mb-0 semiBold">Delete</span>
          </Space>
        ),
      },
    ],
    []
  );

  /**
   * Memoized render function for action column
   * Creates dropdown menu with view details, edit, approve/block, and delete options
   */
  const renderAction = useCallback(
    (_, record) => (
      <Dropdown
        menu={{
          items: getActionMenuItems(record),
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
    ),
    [getActionMenuItems, onMenuClick]
  );

  // ==================== TABLE CONFIGURATION ====================

  /**
   * Memoized table columns configuration
   * Optimized with memoized render functions to prevent unnecessary re-renders
   */
  const columns = useMemo(
    () => [
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        width: "22%",
        render: renderJobTitle,
        sorter: (a, b) => a.title.localeCompare(b.title),
      },
      {
        title: "Posted By",
        dataIndex: "postedBy",
        key: "postedBy",
        width: "18%",
        render: renderPostedBy,
        sorter: (a, b) =>
          a.postedBy.companyName.localeCompare(b.postedBy.companyName),
      },
      {
        title: "Experience Required",
        dataIndex: "experienceRequired",
        key: "experienceRequired",
        width: "14%",
        render: renderExperience,
        sorter: (a, b) => {
          const aYears = parseInt(a.experienceRequired.match(/\d+/)?.[0] || 0);
          const bYears = parseInt(b.experienceRequired.match(/\d+/)?.[0] || 0);
          return aYears - bYears;
        },
      },
      {
        title: "Salary Range",
        dataIndex: "salaryRange",
        key: "salaryRange",
        width: "14%",
        render: renderSalaryRange,
        sorter: (a, b) => {
          const aSalary = parseInt(a.salaryRange.replace(/[^0-9]/g, ""));
          const bSalary = parseInt(b.salaryRange.replace(/[^0-9]/g, ""));
          return aSalary - bSalary;
        },
      },
      {
        title: "Location",
        dataIndex: "location",
        key: "location",
        width: "14%",
        render: renderLocation,
        sorter: (a, b) => a.location.localeCompare(b.location),
      },
      {
        title: "People Applied",
        dataIndex: "peopleApplied",
        key: "peopleApplied",
        width: "10%",
        render: renderPeopleApplied,
        sorter: (a, b) => a.peopleApplied - b.peopleApplied,
      },
      {
        title: "Posted On",
        dataIndex: "postedOn",
        key: "postedOn",
        width: "10%",
        render: renderPostedOn,
        sorter: (a, b) => new Date(a.postedOn) - new Date(b.postedOn),
      },
      {
        title: "Action",
        dataIndex: "action",
        key: "action",
        width: "8%",
        render: renderAction,
      },
    ],
    [
      renderJobTitle,
      renderPostedBy,
      renderExperience,
      renderSalaryRange,
      renderLocation,
      renderPeopleApplied,
      renderPostedOn,
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
      scroll={{ x: 1200 }} // Enable horizontal scroll for smaller screens
    />
  );
});

JobTable.displayName = "JobTable";

export default JobTable;
