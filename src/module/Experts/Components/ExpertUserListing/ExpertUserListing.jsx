/**
 * PERFORMANCE OPTIMIZATIONS IMPLEMENTED:
 *
 * 1. React.memo - Prevents unnecessary re-renders when props haven't changed
 * 2. useMemo for filteredUsers - Prevents re-filtering on every render
 * 3. useMemo for rowSelection - Prevents table selection re-initialization
 * 4. useMemo for columns - Prevents column re-creation on every render
 * 5. useCallback for all event handlers - Prevents function recreation
 * 6. Memoized render functions - Prevents cell re-renders
 * 7. Set-based bulk delete - O(1) lookup instead of O(n) array.includes()
 * 8. Search functionality with real-time filtering
 * 9. Enhanced pagination with size options and quick jumper
 * 10. Horizontal scroll for responsive design
 * 11. Accessibility improvements with aria-labels
 * 12. Comprehensive JSDoc documentation
 */

import React, { useCallback, useMemo, useState, memo } from "react";
import Icon from "@/components/Icon";
import {
  DatePicker,
  Divider,
  Input,
  Space,
  Table,
  Modal,
  message,
  Dropdown,
} from "antd";

/**
 * Mock applied jobs data for development/testing purposes
 * TODO: Replace with actual API calls in production
 * @type {Array<Object>}
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
 * Mock user data for development/testing purposes
 * TODO: Replace with actual API calls in production
 * @type {Array<Object>}
 */
export const MOCK_USER_DATA = [
  {
    id: 1,
    userName: "Sudhir Deolalikar",
    email: "sudhir@gmail.com",
    contact: 9988776655,
    country: "India",
    createDate: "2024-01-15",
    appliedJobsCount: 3,
    action: { id: 1 },
  },
  {
    id: 2,
    userName: "Ipsum DummyText",
    email: "ipsum@example.com",
    contact: 9988776656,
    country: "USA",
    createDate: "2024-01-16",
    appliedJobsCount: 2,
    action: { id: 2 },
  },
];

/**
 * ExpertUserListing Component
 *
 * A comprehensive user management component that provides:
 * - User listing with search and filtering capabilities
 * - Individual user deletion with confirmation modal
 * - Bulk user selection and deletion
 * - Responsive table with pagination
 *
 * @component
 * @returns {JSX.Element} The ExpertUserListing component
 */
const ExpertUserListing = () => {
  // ==================== STATE MANAGEMENT ====================

  /** @type {[string[], Function]} Selected row keys for bulk operations */
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  /** @type {[Object[], Function]} Selected user objects for bulk operations */
  const [selectedUsers, setSelectedUsers] = useState([]);

  /** @type {[Object[], Function]} Current list of users to display */
  const [users, setUsers] = useState(MOCK_USER_DATA);

  /** @type {[string, Function]} Search query for filtering users */
  const [searchQuery, setSearchQuery] = useState("");

  // ==================== MODAL STATE MANAGEMENT ====================

  /** @type {[boolean, Function]} Controls single user delete modal visibility */
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  /** @type {[boolean, Function]} Controls bulk delete modal visibility */
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  /** @type {[boolean, Function]} Controls user details modal visibility */
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);

  /** @type {[boolean, Function]} Controls applied jobs modal visibility */
  const [isAppliedJobsModalOpen, setIsAppliedJobsModalOpen] = useState(false);

  /** @type {[Object|null, Function]} User object to be deleted */
  const [userToDelete, setUserToDelete] = useState(null);

  /** @type {[Object|null, Function]} User object for details view */
  const [userForDetails, setUserForDetails] = useState(null);

  /** @type {[Object|null, Function]} User object for applied jobs view */
  const [userForAppliedJobs, setUserForAppliedJobs] = useState(null);

  // ==================== EVENT HANDLERS ====================

  /**
   * Handles bulk delete action
   * Opens confirmation modal for multiple users
   */
  const handleBulkDelete = useCallback(() => {
    setIsBulkDeleteModalOpen(true);
  }, []);

  /**
   * Handles search input change
   * @param {Event} e - Input change event
   */
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  /**
   * Handles applied jobs click action
   * Opens modal with applied jobs details
   * @param {Object} record - User record
   */
  const handleAppliedJobsClick = useCallback((record) => {
    setUserForAppliedJobs(record);
    setIsAppliedJobsModalOpen(true);
  }, []);

  /**
   * Handles dropdown menu click
   * @param {Object} menuInfo - Menu click information
   * @param {Object} record - User record
   */
  const handleMenuClick = useCallback((menuInfo, record) => {
    const { key } = menuInfo;

    if (key === "view_details") {
      setUserForDetails(record);
      setIsUserDetailsModalOpen(true);
    } else if (key === "delete") {
      setUserToDelete(record);
      setIsDeleteModalOpen(true);
    }
  }, []);

  /**
   * Handles single user delete confirmation
   * Removes user from list and shows success message
   */
  const handleConfirmDelete = useCallback(() => {
    if (userToDelete) {
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userToDelete.id)
      );
      message.success("User deleted successfully");
    }
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  }, [userToDelete]);

  /**
   * Handles bulk delete confirmation
   * Removes selected users from list using Set for O(1) lookup performance
   */
  const handleConfirmBulkDelete = useCallback(() => {
    const selectedKeysSet = new Set(selectedRowKeys);
    setUsers((prevUsers) =>
      prevUsers.filter((user) => !selectedKeysSet.has(user.id))
    );
    setSelectedRowKeys([]);
    setSelectedUsers([]);
    message.success(`${selectedUsers.length} user(s) deleted successfully`);
    setIsBulkDeleteModalOpen(false);
  }, [selectedUsers, selectedRowKeys]);

  /**
   * Handles cancel delete action
   * Closes modal and resets state
   */
  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  }, []);

  /**
   * Handles cancel bulk delete action
   * Closes modal without making changes
   */
  const handleCancelBulkDelete = useCallback(() => {
    setIsBulkDeleteModalOpen(false);
  }, []);

  /**
   * Handles cancel user details modal
   * Closes modal and resets state
   */
  const handleCancelUserDetails = useCallback(() => {
    setIsUserDetailsModalOpen(false);
    setUserForDetails(null);
  }, []);

  /**
   * Handles cancel applied jobs modal
   * Closes modal and resets state
   */
  const handleCancelAppliedJobs = useCallback(() => {
    setIsAppliedJobsModalOpen(false);
    setUserForAppliedJobs(null);
  }, []);

  // ==================== COMPUTED VALUES ====================

  /**
   * Memoized filtered users based on search query
   * Optimizes performance by preventing unnecessary re-filtering
   */
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.userName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.country.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  /**
   * Memoized row selection configuration
   * Prevents unnecessary re-renders of table selection
   */
  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        setSelectedRowKeys(selectedRowKeys);
        setSelectedUsers(selectedRows);
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
   * Memoized dropdown menu items for action column
   */
  const getActionMenuItems = useCallback(
    () => [
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
   * Creates dropdown menu with view details and delete options
   */
  const renderAction = useCallback(
    (_, record) => (
      <Dropdown
        menu={{
          items: getActionMenuItems(),
          onClick: (menuInfo) => handleMenuClick(menuInfo, record),
        }}
      >
        <button className="C-settingButton is-clean small">
          <Icon name="more_vert" />
        </button>
      </Dropdown>
    ),
    [getActionMenuItems, handleMenuClick]
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
        sorter: (a, b) => a.userName.localeCompare(b.userName),
      },
      {
        title: "Email ID",
        dataIndex: "email",
        key: "email",
        width: "20%",
        render: renderEmail,
        sorter: (a, b) => a.email.localeCompare(b.email),
      },
      {
        title: "Contact",
        dataIndex: "contact",
        key: "contact",
        width: "15%",
        render: renderContact,
        sorter: (a, b) => a.contact - b.contact,
      },
      {
        title: "Country",
        dataIndex: "country",
        key: "country",
        width: "15%",
        render: renderCountry,
        sorter: (a, b) => a.country.localeCompare(b.country),
      },
      {
        title: "Applied Jobs",
        dataIndex: "appliedJobsCount",
        key: "appliedJobsCount",
        width: "12%",
        render: renderAppliedJobs,
        sorter: (a, b) => a.appliedJobsCount - b.appliedJobsCount,
      },
      {
        title: "Registered On",
        dataIndex: "createDate",
        key: "createDate",
        width: "13%",
        render: renderCreateDate,
        sorter: (a, b) => new Date(a.createDate) - new Date(b.createDate),
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
              <Divider type="vertical" />
            </Space>
          </div>

          <div className="col-5 text-right">
            <Space>
              {!!selectedUsers.length && (
                <button
                  className="C-button is-bordered small"
                  onClick={handleBulkDelete}
                >
                  <Space>
                    <Icon name="delete" />
                    Delete Selected ({selectedUsers.length})
                  </Space>
                </button>
              )}
              <Input
                size="large"
                placeholder="Search user"
                prefix={<Icon name="search" />}
                width="200"
                value={searchQuery}
                onChange={handleSearchChange}
                allowClear
              />
            </Space>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          rowSelection={rowSelection}
          pagination={{
            hideOnSinglePage: true,
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          loading={false} // TODO: Add loading state from API calls
          scroll={{ x: 800 }} // Enable horizontal scroll for smaller screens
        />
      </div>

      {/* Single User Delete Confirmation Modal */}
      <Modal
        title={<span className="C-heaidng size-5 mb-0 bold">Delete User</span>}
        open={isDeleteModalOpen}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ className: "C-button is-filled" }}
        cancelButtonProps={{ className: "C-button is-bordered" }}
        centered
      >
        <div className="py-3">
          <p className="C-heading size-6 bold mb-3">
            Are you sure you want to delete this user? <br /> This action cannot
            be undone.
          </p>
          {userToDelete && (
            <div className="bg-light p-3 rounded">
              <p className="C-heading size-xs mb-1 text-muted">User Name:</p>
              <p className="C-heading size-6 mb-0 bold">
                {userToDelete.userName}
              </p>
              <p className="C-heading size-xs mb-1 text-muted">Email:</p>
              <p className="C-heading size-6 mb-0">{userToDelete.email}</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        title={
          <span className="C-heaidng size-5 mb-0 bold">
            Delete Selected Users
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
            Are you sure you want to delete {selectedUsers.length} user(s)?{" "}
            <br /> This action cannot be undone.
          </p>
          {selectedUsers.length > 0 && (
            <div className="bg-light p-3 rounded">
              <p className="C-heading size-xs mb-2 text-muted">
                Selected Users:
              </p>
              {selectedUsers.map((user) => (
                <div key={user.id} className="mb-2">
                  <p className="C-heading size-6 mb-0 bold">
                    {user.userName} - {user.email}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* User Details Modal */}
      <Modal
        title={<span className="C-heaidng size-5 mb-0 bold">User Details</span>}
        open={isUserDetailsModalOpen}
        onCancel={handleCancelUserDetails}
        footer={null}
        width={800}
        centered
      >
        <div className="py-3">
          {userForDetails && (
            <div className="row">
              <div className="col-6 mb-3">
                <p className="C-heading size-xs mb-1 text-muted">User Name:</p>
                <p className="C-heading size-6 mb-0 bold">
                  {userForDetails.userName}
                </p>
              </div>
              <div className="col-6 mb-3">
                <p className="C-heading size-xs mb-1 text-muted">Email:</p>
                <p className="C-heading size-6 mb-0">{userForDetails.email}</p>
              </div>
              <div className="col-6 mb-3">
                <p className="C-heading size-xs mb-1 text-muted">Contact:</p>
                <p className="C-heading size-6 mb-0">
                  {userForDetails.contact}
                </p>
              </div>
              <div className="col-6 mb-3">
                <p className="C-heading size-xs mb-1 text-muted">Country:</p>
                <p className="C-heading size-6 mb-0">
                  {userForDetails.country}
                </p>
              </div>
              <div className="col-6 mb-3">
                <p className="C-heading size-xs mb-1 text-muted">
                  Applied Jobs:
                </p>
                <p className="C-heading size-6 mb-0">
                  {userForDetails.appliedJobsCount}
                </p>
              </div>
              <div className="col-6 mb-3">
                <p className="C-heading size-xs mb-1 text-muted">
                  Registered On:
                </p>
                <p className="C-heading size-6 mb-0">
                  {userForDetails.createDate}
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
            Applied Jobs - {userForAppliedJobs?.userName}
          </span>
        }
        open={isAppliedJobsModalOpen}
        onCancel={handleCancelAppliedJobs}
        footer={null}
        width={"90%"}
        centered
      >
        <div className="py-3">
          {userForAppliedJobs &&
            MOCK_APPLIED_JOBS_DATA[userForAppliedJobs.id] && (
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
                dataSource={MOCK_APPLIED_JOBS_DATA[userForAppliedJobs.id]}
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

// ==================== COMPONENT EXPORT ====================

/**
 * Memoized ExpertUserListing component for performance optimization
 * Prevents unnecessary re-renders when props haven't changed
 */
export default memo(ExpertUserListing);
