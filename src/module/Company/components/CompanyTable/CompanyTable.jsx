"use client";

import React, { useCallback, useMemo, memo, useState } from "react";
import { Table, Tag, Dropdown, Space, Switch, Modal } from "antd";
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
  ({ companies, rowSelection, onMenuClick, onPostedJobsClick, onUpdateStatus, loading = false }) => {
    // State for status change confirmation modal
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [companyForStatusChange, setCompanyForStatusChange] = useState(null);
    const [newStatus, setNewStatus] = useState(null);
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
     * Handle status switch change
     * Opens confirmation modal before changing status
     * @param {boolean} checked - New status (true for approved, false for pending/blocked)
     * @param {Object} record - Company record
     */
    const handleStatusChange = useCallback((checked, record) => {
      setCompanyForStatusChange(record);
      setNewStatus(checked);
      setIsStatusModalOpen(true);
    }, []);

    /**
     * Handle confirm status change
     * Calls the API to update company status
     */
    const handleConfirmStatusChange = useCallback(async () => {
      if (companyForStatusChange && onUpdateStatus) {
        try {
          await onUpdateStatus(companyForStatusChange.id, newStatus);
          setIsStatusModalOpen(false);
          setCompanyForStatusChange(null);
        } catch (error) {
          // Error is handled in the hook
          console.error("Error updating company status:", error);
        }
      }
    }, [companyForStatusChange, newStatus, onUpdateStatus]);

    /**
     * Handle cancel status change
     * Closes modal without making changes
     */
    const handleCancelStatusChange = useCallback(() => {
      setIsStatusModalOpen(false);
      setCompanyForStatusChange(null);
    }, []);

    /**
     * Memoized render function for status column
     * Renders status text and icon first, then switch component
     * Only shows "Approved" or "Rejected" status
     */
    const renderStatus = useCallback(
      (status, record) => {
        // Map status to boolean: "approved" = true, anything else = false (rejected)
        const isApproved = status === "approved" || status === "Approved";
        
        return (
          <Space size={8} align="center">
            {isApproved ? (
              <Space size={4} align="center">
                <Icon name="check_circle" size="small" style={{ color: "#52c41a" }} />
                <span style={{ color: "#52c41a", fontSize: "12px" }}>Approved</span>
              </Space>
            ) : (
              <Space size={4} align="center">
                <Icon name="cancel" size="small" style={{ color: "#ff4d4f" }} />
                <span style={{ color: "#ff4d4f", fontSize: "12px" }}>Rejected</span>
              </Space>
            )}
            <Switch
              checked={isApproved}
              onChange={(checked) => handleStatusChange(checked, record)}
              size="small"
              disabled={loading}
            />
          </Space>
        );
      },
      [handleStatusChange, loading]
    );

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
          key: record.status === "approved" || record.status === "Approved" ? "reject" : "approve",
          label: (
            <Space align="center">
              <Icon
                name={record.status === "approved" || record.status === "Approved" ? "cancel" : "check_circle"}
                size="small"
              />
              <span className="C-heading size-xs mb-0 semiBold">
                {record.status === "approved" || record.status === "Approved" ? "Reject" : "Approve"}
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
          width: "12%",
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
      <>
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
          loading={loading}
          scroll={{ x: 1000 }} // Enable horizontal scroll for smaller screens
        />

        {/* Status Change Confirmation Modal */}
        <Modal
          title={
            <span className="C-heaidng size-5 mb-0 bold">
              {newStatus ? "Approve Company" : "Reject Company"}
            </span>
          }
          open={isStatusModalOpen}
          onOk={handleConfirmStatusChange}
          onCancel={handleCancelStatusChange}
          okText={newStatus ? "Approve" : "Reject"}
          cancelText="Cancel"
          okButtonProps={{
            className: "C-button is-filled",
            loading: loading,
          }}
          cancelButtonProps={{
            className: "C-button is-bordered",
            disabled: loading,
          }}
          centered
          confirmLoading={loading}
        >
          <div className="py-3 text-center">
            <p className="C-heading size-6 bold mb-3">
              Are you sure you want to{" "}
              {newStatus ? "approve" : "reject"}{" "}
              <span className="color-dark">
                {companyForStatusChange?.name || "this company"}
              </span>
              ?
            </p>
          </div>
        </Modal>
      </>
    );
  }
);

CompanyTable.displayName = "CompanyTable";

export default CompanyTable;
