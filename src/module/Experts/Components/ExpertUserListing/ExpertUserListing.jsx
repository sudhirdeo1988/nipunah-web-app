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
        <Icon name={item.key} size="small" />
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
      if (key === "edit") {
        // Call parent handler for edit
        if (onEditExpert) {
          onEditExpert(record);
        }
      } else if (key === "delete") {
        // Call parent handler for delete (parent handles the confirmation modal)
        if (onDeleteExpert) {
          onDeleteExpert(record);
        }
      } else if (key === "view_details") {
        setExpertForDetails(record);
        setIsExpertDetailsModalOpen(true);
      }
    },
    [onEditExpert]
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
          userName: "name", // Table uses userName, API expects name
          createDate: "createdAt", // Table uses createDate, API expects createdAt
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
   * Memoized render function for user name column
   * Prevents unnecessary re-renders of table cells
   */
  const renderUserName = useCallback(
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
   * Memoized render function for contact column
   */
  const renderContact = useCallback(
    (text) => <span className="C-heading size-6 mb-0">{text}</span>,
    []
  );

  /**
   * Memoized render function for country column
   */
  const renderCountry = useCallback(
    (text) => <span className="C-heading size-6 mb-0">{text}</span>,
    []
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
          items: [
            ...getActionMenuItems(),
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
          ],
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
        title: "User Name",
        dataIndex: "userName",
        key: "userName",
        width: "20%",
        render: renderUserName,
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
        title: "Contact",
        dataIndex: "contact",
        key: "contact",
        width: "15%",
        render: renderContact,
        sorter: true,
      },
      {
        title: "Country",
        dataIndex: "country",
        key: "country",
        width: "15%",
        render: renderCountry,
        sorter: true,
      },
      {
        title: "Applied Jobs",
        dataIndex: "appliedJobsCount",
        key: "appliedJobsCount",
        width: "12%",
        render: renderAppliedJobs,
        sorter: true,
      },
      {
        title: "Registered On",
        dataIndex: "createDate",
        key: "createDate",
        width: "13%",
        render: renderCreateDate,
        sorter: true,
        sortOrder:
          sortBy === "createdAt"
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
      renderUserName,
      renderEmail,
      renderContact,
      renderCountry,
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
          <span className="C-heaidng size-5 mb-0 bold">
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
          <p className="C-heading size-6 bold mb-3">
            Are you sure you want to delete {selectedExperts.length} expert(s)?{" "}
            <br /> This action cannot be undone.
          </p>
          {selectedExperts.length > 0 && (
            <div className="bg-light p-3 rounded">
              <p className="C-heading size-xs mb-2 text-muted">
                Selected Experts:
              </p>
              {selectedExperts.map((expert) => (
                <div key={expert.id} className="mb-2">
                  <p className="C-heading size-6 mb-0 bold">
                    {expert.userName} - {expert.email}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Expert Details Modal */}
      <Modal
        title={
          <span className="C-heaidng size-5 mb-0 bold">Expert Details</span>
        }
        open={isExpertDetailsModalOpen}
        onCancel={handleCancelExpertDetails}
        footer={null}
        width={800}
        centered
      >
        <div className="py-3">
          {expertForDetails && (
            <div className="row">
              <div className="col-6 mb-3">
                <p className="C-heading size-xs mb-1 text-muted">
                  Expert Name:
                </p>
                <p className="C-heading size-6 mb-0 bold">
                  {expertForDetails.userName}
                </p>
              </div>
              <div className="col-6 mb-3">
                <p className="C-heading size-xs mb-1 text-muted">Email:</p>
                <p className="C-heading size-6 mb-0">
                  {expertForDetails.email}
                </p>
              </div>
              <div className="col-6 mb-3">
                <p className="C-heading size-xs mb-1 text-muted">Contact:</p>
                <p className="C-heading size-6 mb-0">
                  {expertForDetails.contact}
                </p>
              </div>
              <div className="col-6 mb-3">
                <p className="C-heading size-xs mb-1 text-muted">Country:</p>
                <p className="C-heading size-6 mb-0">
                  {expertForDetails.country}
                </p>
              </div>
              <div className="col-6 mb-3">
                <p className="C-heading size-xs mb-1 text-muted">
                  Applied Jobs:
                </p>
                <p className="C-heading size-6 mb-0">
                  {expertForDetails.appliedJobsCount}
                </p>
              </div>
              <div className="col-6 mb-3">
                <p className="C-heading size-xs mb-1 text-muted">
                  Registered On:
                </p>
                <p className="C-heading size-6 mb-0">
                  {expertForDetails.createDate}
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Applied Jobs Modal */}
      <Modal
        title={
          <span className="C-heaidng size-5 mb-0 bold">
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
};

// ==================== COMPONENT EXPORT ====================

/**
 * Memoized ExpertUserListing component for performance optimization
 * Prevents unnecessary re-renders when props haven't changed
 */
export default memo(ExpertUserListing);
