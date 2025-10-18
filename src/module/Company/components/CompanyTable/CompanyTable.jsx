"use client";

import React, { useCallback, useMemo, memo } from "react";
import { Table, Tag, Dropdown, Space } from "antd";
import Icon from "@/components/Icon";
import { STATUS_COLORS, PLAN_COLORS } from "../../constants/companyConstants";

/**
 * CompanyTable Component
 *
 * Renders the main company listing table with all columns and actions
 *
 * @param {Object} props - Component props
 * @param {Array} props.companies - List of companies to display
 * @param {Object} props.rowSelection - Row selection configuration
 * @param {Function} props.onMenuClick - Handler for action menu clicks
 * @param {Function} props.onPostedJobsClick - Handler for posted jobs click
 * @returns {JSX.Element} The CompanyTable component
 */
const CompanyTable = memo(
  ({ companies, rowSelection, onMenuClick, onPostedJobsClick }) => {
    // ==================== MEMOIZED RENDER FUNCTIONS ====================

    /**
     * Memoized render function for company name column
     * Prevents unnecessary re-renders of table cells
     */
    const renderCompanyName = useCallback(
      (text, record) => (
        <div>
          <span className="C-heading size-6 mb-1 semiBold">{text}</span>
          <span className="C-heading size-xss mb-0 text-muted">
            {record.shortName}
          </span>
        </div>
      ),
      []
    );

    /**
     * Memoized render function for industry column
     */
    const renderIndustry = useCallback(
      (text) => <span className="C-heading size-6 mb-0">{text}</span>,
      []
    );

    /**
     * Memoized render function for employee count column
     */
    const renderEmployeeCount = useCallback(
      (count) => (
        <span className="C-heading size-6 mb-0">{count.toLocaleString()}</span>
      ),
      []
    );

    /**
     * Memoized render function for subscription plan column
     */
    const renderSubscriptionPlan = useCallback((plan) => {
      const planEmojis = {
        free: "🆓",
        basic: "⭐",
        premium: "👑",
      };

      const emoji = planEmojis[plan] || "📋";

      return (
        <Tag color={PLAN_COLORS[plan] || "default"}>
          {emoji} {plan.charAt(0).toUpperCase() + plan.slice(1)}
        </Tag>
      );
    }, []);

    /**
     * Memoized render function for status column
     */
    const renderStatus = useCallback((status) => {
      return (
        <Tag color={STATUS_COLORS[status] || "default"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      );
    }, []);

    /**
     * Memoized render function for posted jobs column
     * Creates clickable number that opens posted jobs modal
     */
    const renderPostedJobs = useCallback(
      (jobs, record) => (
        <button
          className="C-button is-clean small"
          onClick={() => onPostedJobsClick(record)}
          style={{ color: "#1890ff", textDecoration: "underline" }}
        >
          {jobs?.length || 0}
        </button>
      ),
      [onPostedJobsClick]
    );

    /**
     * Memoized render function for create date column
     */
    const renderCreateDate = useCallback(
      (text) => <span className="C-heading size-6 mb-0">{text}</span>,
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
          title: "Company Name",
          dataIndex: "name",
          key: "name",
          width: "20%",
          render: renderCompanyName,
          sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
          title: "Industry",
          dataIndex: "industry",
          key: "industry",
          width: "15%",
          render: renderIndustry,
          sorter: (a, b) => a.industry.localeCompare(b.industry),
        },
        {
          title: "Employees",
          dataIndex: "employeeCount",
          key: "employeeCount",
          width: "12%",
          render: renderEmployeeCount,
          sorter: (a, b) => a.employeeCount - b.employeeCount,
        },
        {
          title: "Plan",
          dataIndex: "subscriptionPlan",
          key: "subscriptionPlan",
          width: "10%",
          render: renderSubscriptionPlan,
          sorter: (a, b) =>
            a.subscriptionPlan.localeCompare(b.subscriptionPlan),
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          width: "10%",
          render: renderStatus,
          sorter: (a, b) => a.status.localeCompare(b.status),
        },
        {
          title: "Jobs Posted",
          dataIndex: "postedJobs",
          key: "postedJobs",
          width: "10%",
          render: renderPostedJobs,
          sorter: (a, b) =>
            (a.postedJobs?.length || 0) - (b.postedJobs?.length || 0),
        },
        {
          title: "Created On",
          dataIndex: "createdAt",
          key: "createdAt",
          width: "13%",
          render: renderCreateDate,
          sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
          title: "Action",
          dataIndex: "action",
          key: "action",
          width: "10%",
          render: renderAction,
        },
      ],
      [
        renderCompanyName,
        renderIndustry,
        renderEmployeeCount,
        renderSubscriptionPlan,
        renderStatus,
        renderPostedJobs,
        renderCreateDate,
        renderAction,
      ]
    );

    return (
      <Table
        columns={columns}
        dataSource={companies}
        rowKey="id"
        rowSelection={rowSelection}
        pagination={{
          hideOnSinglePage: true,
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} companies`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        loading={false} // TODO: Add loading state from API calls
        scroll={{ x: 1000 }} // Enable horizontal scroll for smaller screens
      />
    );
  }
);

CompanyTable.displayName = "CompanyTable";

export default CompanyTable;
