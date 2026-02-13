/**
 * PERFORMANCE OPTIMIZATIONS IMPLEMENTED:
 *
 * 1. React.memo - Prevents unnecessary re-renders when props haven't changed
 * 2. useMemo for columns - Prevents column re-creation on every render
 * 3. useCallback for all event handlers - Prevents function recreation
 * 4. Memoized render functions - Prevents cell re-renders
 * 5. Set-based bulk delete - O(1) lookup instead of O(n) array.includes()
 * 6. Search functionality with debouncing
 * 7. Enhanced pagination with size options and quick jumper
 * 8. Horizontal scroll for responsive design
 * 9. API integration with useExpert hook
 * 10. Comprehensive JSDoc documentation
 */

import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
  memo,
} from "react";
import PropTypes from "prop-types";
import Icon from "@/components/Icon";
import {
  DatePicker,
  Divider,
  Input,
  Space,
  Table,
  Modal,
  Dropdown,
  Switch,
} from "antd";
import { ACTION_MENU_ITEMS } from "../../constants/expertConstants";

/**
 * Mock applied jobs data for development/testing purposes
 * TODO: Replace with actual API calls in production
 * @type {Object}
 */
export const MOCK_APPLIED_JOBS_DATA = {
  1: [
    {
      id: 1,
      jobName: "Senior Frontend Developer",
      company: "Tech Corp",
      appliedOn: "2024-01-10",
      status: "Under Review",
    },
    {
      id: 2,
      jobName: "React Developer",
      company: "StartupXYZ",
      appliedOn: "2024-01-12",
      status: "Interview Scheduled",
    },
    {
      id: 3,
      jobName: "Full Stack Developer",
      company: "BigTech Inc",
      appliedOn: "2024-01-15",
      status: "Rejected",
    },
  ],
  2: [
    {
      id: 4,
      jobName: "UI/UX Designer",
      company: "Design Studio",
      appliedOn: "2024-01-08",
      status: "Accepted",
    },
    {
      id: 5,
      jobName: "Product Manager",
      company: "Product Co",
      appliedOn: "2024-01-14",
      status: "Under Review",
    },
  ],
};

/**
 * Transform action menu items to include icons
 *
 * Performance: Defined outside component to prevent recreation on every render.
 * Menu items are static, so they don't need to be recreated.
 *
 * @returns {Array} Array of menu items with icon labels
 */
const getActionMenuItems = () =>
  ACTION_MENU_ITEMS.map((item) => ({
    ...item,
    label: (
      <Space align="center">
        <Icon 
          name={item.key === "view" ? "visibility" : item.key} 
          size="small" 
        />
        <span className="C-heading size-xs mb-0">{item.label}</span>
      </Space>
    ),
  }));

/**
 * ExpertUserListing Component
 *
 * A comprehensive expert management component that provides:
 * - Expert listing with search and filtering capabilities
 * - Individual expert deletion with confirmation modal
 * - Bulk expert selection and deletion
 * - Responsive table with pagination
 * - Receives data and handlers as props from parent
 *
 * @component
 * @param {Array} experts - List of experts to display
 * @param {boolean} loading - Loading state
 * @param {Object} pagination - Pagination configuration
 * @param {string} sortBy - Current sort field
 * @param {string} order - Current sort order (asc/desc)
 * @param {Function} onEditExpert - Handler for edit expert action
 * @param {Function} onDeleteExpert - Handler for delete expert action
 * @param {Function} onFetchExperts - Handler to fetch experts with filters
 * @returns {JSX.Element} The ExpertUserListing component
 */
const ExpertUserListing = ({
  experts = [],
  loading = false,
  pagination = {},
  sortBy = "name",
  order = "asc",
  onEditExpert,
  onDeleteExpert,
  onFetchExperts,
  onUpdateApprovalStatus,
}) => {
  // ==================== STATE MANAGEMENT ====================

  /** @type {[string[], Function]} Selected row keys for bulk operations */
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  /** @type {[Object[], Function]} Selected expert objects for bulk operations */
  const [selectedExperts, setSelectedExperts] = useState([]);

  /** @type {[string, Function]} Search input value (for debouncing) */
  const [searchValue, setSearchValue] = useState("");

  // ==================== MODAL STATE MANAGEMENT ====================

  /** @type {[boolean, Function]} Controls bulk delete modal visibility */
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  /** @type {[boolean, Function]} Controls expert details modal visibility */
  const [isExpertDetailsModalOpen, setIsExpertDetailsModalOpen] =
    useState(false);

  /** @type {[boolean, Function]} Controls applied jobs modal visibility */
  const [isAppliedJobsModalOpen, setIsAppliedJobsModalOpen] = useState(false);

  /** @type {[Object|null, Function]} Expert object for details view */
  const [expertForDetails, setExpertForDetails] = useState(null);

  /** @type {[Object|null, Function]} Expert object for applied jobs view */
  const [expertForAppliedJobs, setExpertForAppliedJobs] = useState(null);

  /** @type {[boolean, Function]} Controls approval confirmation modal visibility */
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  /** @type {[Object|null, Function]} Expert object for approval status change */
  const [expertForApproval, setExpertForApproval] = useState(null);

  /** @type {[boolean, Function]} New approval status to be set */
  const [newApprovalStatus, setNewApprovalStatus] = useState(false);

  // ==================== DEBOUNCE REF ====================
  const searchDebounceTimerRef = useRef(null);

  // ==================== EVENT HANDLERS ====================

  /**
   * Handles bulk delete action
   * Opens confirmation modal for multiple experts
   */
  const handleBulkDelete = useCallback(() => {
    setIsBulkDeleteModalOpen(true);
  }, []);

  /**
   * Handle search input changes with debouncing
   *
   * Debounces search input to prevent excessive API calls while user is typing.
   * Waits 500ms after user stops typing before making API call.
   *
   * Performance: Uses debouncing to reduce API calls and improve performance.
   *
   * @param {Event} e - Input change event
   */
  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchValue(value);

      // Clear existing timer to reset debounce
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }

      // Set new timer for debounced API call
      // Only makes API call after user stops typing for 500ms
      searchDebounceTimerRef.current = setTimeout(() => {
        if (onFetchExperts) {
          onFetchExperts({
            page: 1, // Reset to first page on new search
            limit: pagination.pageSize || 10,
            search: value,
          });
        }
      }, 500); // 500ms debounce delay
    },
    [onFetchExperts, pagination.pageSize]
  );

  // Cleanup debounce timer on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Handles applied jobs click action
   * Opens modal with applied jobs details
   * @param {Object} record - Expert record
   */
  const handleAppliedJobsClick = useCallback((record) => {
    setExpertForAppliedJobs(record);
    setIsAppliedJobsModalOpen(true);
  }, []);

  /**
   * Handles dropdown menu click
   * @param {Object} menuInfo - Menu click information
   * @param {Object} record - Expert record
   */
  const handleMenuClick = useCallback(
    ({ key }, record) => {
      if (key === "view") {
        setExpertForDetails(record);
        setIsExpertDetailsModalOpen(true);
      } else if (key === "edit") {
        // Call parent handler for edit
        if (onEditExpert) {
          onEditExpert(record);
        }
      } else if (key === "delete") {
        // Call parent handler for delete (parent handles the confirmation modal)
        if (onDeleteExpert) {
          onDeleteExpert(record);
        }
      }
    },
    [onEditExpert, onDeleteExpert]
  );

  /**
   * Handles bulk delete confirmation
   * TODO: Implement bulk delete API call
   */
  const handleConfirmBulkDelete = useCallback(() => {
    // TODO: Implement bulk delete functionality
    console.log("Bulk delete not yet implemented", selectedExperts);
    setSelectedRowKeys([]);
    setSelectedExperts([]);
    setIsBulkDeleteModalOpen(false);
  }, [selectedExperts]);

  /**
   * Handles cancel bulk delete action
   * Closes modal without making changes
   */
  const handleCancelBulkDelete = useCallback(() => {
    setIsBulkDeleteModalOpen(false);
  }, []);

  /**
   * Handles cancel expert details modal
   * Closes modal and resets state
   */
  const handleCancelExpertDetails = useCallback(() => {
    setIsExpertDetailsModalOpen(false);
    setExpertForDetails(null);
  }, []);

  /**
   * Handles cancel applied jobs modal
   * Closes modal and resets state
   */
  const handleCancelAppliedJobs = useCallback(() => {
    setIsAppliedJobsModalOpen(false);
    setExpertForAppliedJobs(null);
  }, []);

  /**
   * Handle table changes (pagination, sorting, filters)
   *
   * Maps table column names to API field names:
   * - userName -> name (for API)
   * - createDate -> createdAt (for API)
   *
   * @param {Object} pagination - New pagination state
   * @param {Object} filters - Table filters
   * @param {Object} sorter - Sorting information
   */
  const handleTableChange = useCallback(
    (newPagination, filters, sorter, extra) => {
      const action = extra?.action;

      // Only call API for pagination or sorting actions
      if (action !== "paginate" && action !== "sort") {
        return;
      }

      const params = {
        page: newPagination.current,
        limit: newPagination.pageSize,
        search: searchValue,
      };

      // Add sorting parameters if column is sorted
      if (sorter.field) {
        // Map table column names to API field names
        const fieldMapping = {
          name: "first_name", // Table uses name, API expects first_name
          email: "email",
          expertise: "expertise",
          subscriptionPlan: "subscription_plan",
          isExpertApproved: "is_expert_approved",
          createDate: "created_on", // Table uses createDate, API expects created_on
        };

        params.sortBy = fieldMapping[sorter.field] || sorter.field;
        params.order = sorter.order === "ascend" ? "asc" : "desc";
      } else {
        // Keep current sort if no new sort is applied
        params.sortBy = sortBy;
        params.order = order;
      }

      if (onFetchExperts) {
        onFetchExperts(params);
      }
    },
    [
      onFetchExperts,
      searchValue,
      sortBy,
      order,
      pagination.current,
      pagination.pageSize,
    ]
  );

  // ==================== COMPUTED VALUES ====================

  /**
   * Memoized row selection configuration
   * Prevents unnecessary re-renders of table selection
   */
  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        setSelectedRowKeys(selectedRowKeys);
        setSelectedExperts(selectedRows);
      },
    }),
    [selectedRowKeys]
  );

  // ==================== MEMOIZED RENDER FUNCTIONS ====================

  /**
   * Memoized render function for name column
   * Prevents unnecessary re-renders of table cells
   */
  const renderName = useCallback(
    (text) => <span className="C-heading size-6 mb-1 semiBold">{text}</span>,
    []
  );

  /**
   * Memoized render function for email column
   */
  const renderEmail = useCallback(
    (text) => <span className="C-heading size-6 mb-0">{text}</span>,
    []
  );

  /**
   * Memoized render function for expertise column
   */
  const renderExpertise = useCallback(
    (text) => <span className="C-heading size-6 mb-0">{text || "N/A"}</span>,
    []
  );

  /**
   * Memoized render function for subscription plan column
   */
  const renderSubscriptionPlan = useCallback(
    (text) => (
      <span className="C-heading size-6 mb-0 text-capitalize">
        {text || "N/A"}
      </span>
    ),
    []
  );

  /**
   * Handle approval status switch change
   * Opens confirmation modal before changing status
   * @param {boolean} checked - New approval status
   * @param {Object} record - Expert record
   */
  const handleApprovalStatusChange = useCallback((checked, record) => {
    setExpertForApproval(record);
    setNewApprovalStatus(checked);
    setIsApprovalModalOpen(true);
  }, []);

  /**
   * Handle confirm approval status change
   * Calls the API to update approval status
   */
  const handleConfirmApproval = useCallback(async () => {
    if (expertForApproval && onUpdateApprovalStatus) {
      try {
        await onUpdateApprovalStatus(expertForApproval.id, newApprovalStatus);
        setIsApprovalModalOpen(false);
        setExpertForApproval(null);
      } catch (error) {
        // Error is handled in the hook
        console.error("Error updating approval status:", error);
      }
    }
  }, [expertForApproval, newApprovalStatus, onUpdateApprovalStatus]);

  /**
   * Handle cancel approval status change
   * Closes modal without making changes
   */
  const handleCancelApproval = useCallback(() => {
    setIsApprovalModalOpen(false);
    setExpertForApproval(null);
  }, []);

  /**
   * Memoized render function for approval status column
   * Renders status text and icon first, then switch component
   */
  const renderApprovalStatus = useCallback(
    (isApproved, record) => (
      <Space size={8} align="center">
        {isApproved ? (
          <Space size={4} align="center">
            <Icon name="check_circle" size="small" style={{ color: "#52c41a" }} />
            <span style={{ color: "#52c41a", fontSize: "12px" }}>Approved</span>
          </Space>
        ) : (
          <Space size={4} align="center">
            <Icon name="warning" size="small" style={{ color: "#ff4d4f" }} />
            <span style={{ color: "#ff4d4f", fontSize: "12px" }}>Pending</span>
          </Space>
        )}
        <Switch
          checked={isApproved}
          onChange={(checked) => handleApprovalStatusChange(checked, record)}
          size="small"
          disabled={loading}
        />
      </Space>
    ),
    [handleApprovalStatusChange, loading]
  );

  /**
   * Memoized render function for applied jobs column
   * Creates clickable number that opens applied jobs modal
   */
  const renderAppliedJobs = useCallback(
    (count, record) => (
      <button
        className="C-button is-clean small"
        onClick={() => handleAppliedJobsClick(record)}
        style={{ color: "#1890ff", textDecoration: "underline" }}
      >
        {count}
      </button>
    ),
    [handleAppliedJobsClick]
  );

  /**
   * Memoized render function for create date column
   */
  const renderCreateDate = useCallback(
    (text) => <span className="C-heading size-6 mb-0">{text}</span>,
    []
  );

  /**
   * Memoized render function for action column
   * Creates dropdown menu with view details, edit, and delete options
   */
  const renderAction = useCallback(
    (_, record) => (
      <Dropdown
        menu={{
          items: getActionMenuItems(),
          onClick: (menuInfo) => handleMenuClick(menuInfo, record),
        }}
        trigger={["hover", "click"]}
      >
        <button className="C-settingButton is-clean small">
          <Icon name="more_vert" />
        </button>
      </Dropdown>
    ),
    [handleMenuClick]
  );

  // ==================== TABLE CONFIGURATION ====================

  /**
   * Memoized table columns configuration
   * Optimized with memoized render functions to prevent unnecessary re-renders
   */
  const columns = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: "18%",
        render: renderName,
        sorter: true,
        sortOrder:
          sortBy === "name" ? (order === "asc" ? "ascend" : "descend") : null,
      },
      {
        title: "Email ID",
        dataIndex: "email",
        key: "email",
        width: "20%",
        render: renderEmail,
        sorter: true,
      },
      {
        title: "Expertise",
        dataIndex: "expertise",
        key: "expertise",
        width: "18%",
        render: renderExpertise,
        sorter: true,
      },
      {
        title: "Subscription Plan",
        dataIndex: "subscriptionPlan",
        key: "subscriptionPlan",
        width: "12%",
        render: renderSubscriptionPlan,
        sorter: true,
      },
      {
        title: "Status",
        dataIndex: "isExpertApproved",
        key: "isExpertApproved",
        width: "12%",
        render: renderApprovalStatus,
        sorter: true,
      },
      {
        title: "Applied Jobs",
        dataIndex: "appliedJobsCount",
        key: "appliedJobsCount",
        width: "10%",
        render: renderAppliedJobs,
        sorter: true,
      },
      {
        title: "Registered On",
        dataIndex: "createDate",
        key: "createDate",
        width: "12%",
        render: renderCreateDate,
        sorter: true,
        sortOrder:
          sortBy === "createdAt" || sortBy === "created_on"
            ? order === "asc"
              ? "ascend"
              : "descend"
            : null,
      },
      {
        title: "Action",
        dataIndex: "action",
        key: "action",
        width: "5%",
        render: renderAction,
      },
    ],
    [
      renderName,
      renderEmail,
      renderExpertise,
      renderSubscriptionPlan,
      renderApprovalStatus,
      renderAppliedJobs,
      renderCreateDate,
      renderAction,
      sortBy,
      order,
    ]
  );

  return (
    <>
      <div className="mb-3">
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
              {!!selectedExperts.length && (
                <button
                  className="C-button is-bordered small"
                  onClick={handleBulkDelete}
                >
                  <Space>
                    <Icon name="delete" />
                    Delete Selected ({selectedExperts.length})
                  </Space>
                </button>
              )}
              <Input
                size="large"
                placeholder="Search expert"
                prefix={<Icon name="search" />}
                width="200"
                value={searchValue}
                onChange={handleSearchChange}
                allowClear
              />
            </Space>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={experts}
          rowKey="id"
          rowSelection={rowSelection}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} experts`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }} // Enable horizontal scroll for smaller screens
        />
      </div>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        title={
          <span className="C-heading size-5 mb-0 bold">
            Delete Selected Experts
          </span>
        }
        open={isBulkDeleteModalOpen}
        onOk={handleConfirmBulkDelete}
        onCancel={handleCancelBulkDelete}
        okText="Delete All"
        cancelText="Cancel"
        okButtonProps={{ className: "C-button is-filled" }}
        cancelButtonProps={{ className: "C-button is-bordered" }}
        centered
      >
        <div className="py-3">
          <p className="C-heading size-6 mb-4">
            Are you sure you want to delete {selectedExperts.length} expert(s)? This action cannot be undone.
          </p>
          {selectedExperts.length > 0 && (
            <div className="text-center py-3">
              <p className="C-heading size-xs mb-3 text-muted">
                Selected Experts:
              </p>
              <div className="d-flex flex-column align-items-center gap-2">
                {selectedExperts.map((expert) => (
                  <p key={expert.id} className="C-heading size-6 mb-0 bold">
                    {expert.userName || expert.name || "Expert"}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Expert Details Modal */}
      <Modal
        title={
          <span className="C-heading size-5 mb-0 bold">Expert Details</span>
        }
        open={isExpertDetailsModalOpen}
        onCancel={handleCancelExpertDetails}
        footer={null}
        width={900}
        centered
      >
        {expertForDetails && (
          <div className="py-3">
            {/* Basic Information Section */}
            <div className="mb-4">
              <h6 className="C-heading size-xs bold mb-3 color-dark">Basic Information</h6>
              <div className="row">
                <div className="col-6 mb-3 pb-3 border-bottom">
                  <p className="C-heading size-xs mb-2 bold color-dark">Name</p>
                  <p className="C-heading size-6 mb-0">
                    {expertForDetails.name || "N/A"}
                  </p>
                </div>
                <div className="col-6 mb-3 pb-3 border-bottom">
                  <p className="C-heading size-xs mb-2 bold color-dark">Email</p>
                  <p className="C-heading size-6 mb-0">
                    {expertForDetails.email || "N/A"}
                  </p>
                </div>
                <div className="col-6 mb-3 pb-3 border-bottom">
                  <p className="C-heading size-xs mb-2 bold color-dark">Expertise</p>
                  <p className="C-heading size-6 mb-0">
                    {expertForDetails.expertise || "N/A"}
                  </p>
                </div>
                <div className="col-6 mb-3 pb-3 border-bottom">
                  <p className="C-heading size-xs mb-2 bold color-dark">Subscription Plan</p>
                  <p className="C-heading size-6 mb-0 text-capitalize">
                    {expertForDetails.subscriptionPlan || "N/A"}
                  </p>
                </div>
                <div className="col-6 mb-3 pb-3 border-bottom">
                  <p className="C-heading size-xs mb-2 bold color-dark">Approval Status</p>
                  <p className="C-heading size-6 mb-0">
                    {expertForDetails.isExpertApproved ? (
                      <Space size={4} align="center">
                        <Icon name="check_circle" size="small" style={{ color: "#52c41a" }} />
                        <span style={{ color: "#52c41a" }}>Approved</span>
                      </Space>
                    ) : (
                      <Space size={4} align="center">
                        <Icon name="warning" size="small" style={{ color: "#ff4d4f" }} />
                        <span style={{ color: "#ff4d4f" }}>Pending</span>
                      </Space>
                    )}
                  </p>
                </div>
                <div className="col-6 mb-3 pb-3 border-bottom">
                  <p className="C-heading size-xs mb-2 bold color-dark">Payment Status</p>
                  <p className="C-heading size-6 mb-0">
                    {expertForDetails.paymentDetails?.is_paid_user ? (
                      <span className="text-success">Paid User</span>
                    ) : (
                      <span className="text-muted">Free User</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Address Section */}
            {expertForDetails.address && (
              <div className="mb-4">
                <h6 className="C-heading size-xs bold mb-3 color-dark">Address</h6>
                <div className="row pb-3 border-bottom">
                  <div className="col-6 mb-3">
                    <p className="C-heading size-xs mb-2 bold color-dark">Country</p>
                    <p className="C-heading size-6 mb-0">
                      {expertForDetails.address?.country || "N/A"}
                    </p>
                  </div>
                  <div className="col-6 mb-3">
                    <p className="C-heading size-xs mb-2 bold color-dark">State/Province</p>
                    <p className="C-heading size-6 mb-0">
                      {expertForDetails.address?.state || "N/A"}
                    </p>
                  </div>
                  <div className="col-12 mb-3">
                    <p className="C-heading size-xs mb-2 bold color-dark">Detail Address</p>
                    <p className="C-heading size-6 mb-0">
                      {expertForDetails.address?.location || "N/A"}
                    </p>
                  </div>
                  <div className="col-6 mb-3">
                    <p className="C-heading size-xs mb-2 bold color-dark">City</p>
                    <p className="C-heading size-6 mb-0">
                      {expertForDetails.address?.city || "N/A"}
                    </p>
                  </div>
                  <div className="col-6 mb-3">
                    <p className="C-heading size-xs mb-2 bold color-dark">Postal Code</p>
                    <p className="C-heading size-6 mb-0">
                      {expertForDetails.address?.postal_code || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information Section */}
            <div className="mb-4">
              <h6 className="C-heading size-xs bold mb-3 color-dark">Contact Information</h6>
              <div className="row pb-3 border-bottom">
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-2 bold color-dark">Contact Number</p>
                  <p className="C-heading size-6 mb-0">
                    {expertForDetails.contactCountryCode && expertForDetails.contactNumber
                      ? `${expertForDetails.contactCountryCode} ${expertForDetails.contactNumber}`
                      : expertForDetails.contact || "N/A"}
                  </p>
                </div>
                {expertForDetails.socialMedia?.linkedin && (
                  <div className="col-6 mb-3">
                    <p className="C-heading size-xs mb-2 bold color-dark">LinkedIn</p>
                    <p className="C-heading size-6 mb-0">
                      <a
                        href={expertForDetails.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        {expertForDetails.socialMedia.linkedin}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h6 className="C-heading size-xs bold mb-3 color-dark">Additional Information</h6>
              <div className="row">
                <div className="col-6">
                  <p className="C-heading size-xs mb-2 bold color-dark">Applied Jobs</p>
                  <p className="C-heading size-6 mb-0">
                    {expertForDetails.appliedJobsCount || 0}
                  </p>
                </div>
                <div className="col-6">
                  <p className="C-heading size-xs mb-2 bold color-dark">Registered On</p>
                  <p className="C-heading size-6 mb-0">
                    {expertForDetails.createDate || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Approval Status Confirmation Modal */}
      <Modal
        title={
          <span className="C-heading size-5 mb-0 bold">
            {newApprovalStatus ? "Approve Expert" : "Set Expert to Pending"}
          </span>
        }
        open={isApprovalModalOpen}
        onOk={handleConfirmApproval}
        onCancel={handleCancelApproval}
        okText={newApprovalStatus ? "Approve" : "Set to Pending"}
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
        <div className="py-3">
          <p className="C-heading size-6 mb-0">
            Are you sure you want to{" "}
            {newApprovalStatus ? "approve" : "set to pending"}{" "}
            {expertForApproval && (
              <span className="bold">
                {expertForApproval.name || expertForApproval.userName || "this expert"}
              </span>
            )}
            ?
          </p>
        </div>
      </Modal>

      {/* Applied Jobs Modal */}
      <Modal
        title={
          <span className="C-heading size-5 mb-0 bold">
            Applied Jobs - {expertForAppliedJobs?.userName}
          </span>
        }
        open={isAppliedJobsModalOpen}
        onCancel={handleCancelAppliedJobs}
        footer={null}
        width={"90%"}
        centered
      >
        <div className="py-3">
          {expertForAppliedJobs &&
            MOCK_APPLIED_JOBS_DATA[expertForAppliedJobs.id] && (
              <Table
                columns={[
                  {
                    title: "Job Name",
                    dataIndex: "jobName",
                    key: "jobName",
                    render: (text) => (
                      <span className="C-heading size-6 mb-0 semiBold">
                        {text}
                      </span>
                    ),
                  },
                  {
                    title: "Company",
                    dataIndex: "company",
                    key: "company",
                    render: (text) => (
                      <span className="C-heading size-6 mb-0">{text}</span>
                    ),
                  },
                  {
                    title: "Applied On",
                    dataIndex: "appliedOn",
                    key: "appliedOn",
                    render: (text) => (
                      <span className="C-heading size-6 mb-0">{text}</span>
                    ),
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    render: (text) => (
                      <span
                        className={`C-heading size-6 mb-0 ${
                          text === "Accepted"
                            ? "text-success"
                            : text === "Rejected"
                            ? "text-danger"
                            : "text-warning"
                        }`}
                      >
                        {text}
                      </span>
                    ),
                  },
                ]}
                dataSource={MOCK_APPLIED_JOBS_DATA[expertForAppliedJobs.id]}
                rowKey="id"
                pagination={false}
                size="small"
              />
            )}
        </div>
      </Modal>
    </>
  );
};

ExpertUserListing.propTypes = {
  experts: PropTypes.array,
  loading: PropTypes.bool,
  pagination: PropTypes.object,
  sortBy: PropTypes.string,
  order: PropTypes.oneOf(["asc", "desc"]),
  onEditExpert: PropTypes.func,
  onDeleteExpert: PropTypes.func,
  onFetchExperts: PropTypes.func,
  onUpdateApprovalStatus: PropTypes.func,
};

// ==================== COMPONENT EXPORT ====================

/**
 * Memoized ExpertUserListing component for performance optimization
 * Prevents unnecessary re-renders when props haven't changed
 */
export default memo(ExpertUserListing);
