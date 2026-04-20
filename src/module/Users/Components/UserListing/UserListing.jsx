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

import React, { useCallback, useEffect, useMemo, useState, memo } from "react";
import Icon from "@/components/Icon";
import { userService } from "@/utilities/apiServices";
import { useAppSelector } from "@/store/hooks";
import { getIdFromStoredUser } from "@/utilities/sessionUser";
import {
  DatePicker,
  Divider,
  Input,
  Space,
  Table,
  Modal,
  message,
  Dropdown,
  Button,
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

/** Format API date fields for display */
function formatUserDate(value) {
  if (value === null || value === undefined || value === "") return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString();
  } catch {
    return String(value);
  }
}

function formatUserDateTime(value) {
  if (value === null || value === undefined || value === "") return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  } catch {
    return String(value);
  }
}

function getUserRoleLabel(user) {
  const role =
    user?.role ??
    user?.user_role ??
    user?.userRole ??
    user?.type ??
    user?.userType ??
    user?.user_type;
  return role ? String(role) : "—";
}

function valueOrDash(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

/**
 * Normalize GET /users API response into { items, total }
 */
function parseUsersResponse(res) {
  if (!res) return { items: [], total: 0 };
  if (Array.isArray(res)) return { items: res, total: res.length };
  if (res.data?.items && Array.isArray(res.data.items)) {
    return {
      items: res.data.items,
      total:
        res.data.total ??
        res.data.totalItems ??
        res.data.count ??
        res.data.items.length,
    };
  }
  if (Array.isArray(res.data)) {
    return { items: res.data, total: res.total ?? res.data.length };
  }
  if (Array.isArray(res.items)) {
    return { items: res.items, total: res.total ?? res.items.length };
  }
  if (res.users && Array.isArray(res.users)) {
    return { items: res.users, total: res.total ?? res.users.length };
  }
  return { items: [], total: 0 };
}

/**
 * Map one API user object to table row shape
 */
function mapApiUserToRow(u, index = 0) {
  const id =
    u.id ??
    u.user_id ??
    u.userId ??
    u.email ??
    `${u.first_name || "user"}-${u.last_name || "item"}-${u.created_on || index}`;
  const firstName = u.first_name || u.firstName || "";
  const lastName = u.last_name || u.lastName || "";
  const userName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    u.name ||
    u.userName ||
    u.username ||
    u.email ||
    (id != null ? `User #${id}` : "—");

  const contact =
    u.phone ??
    u.mobile ??
    u.contact ??
    u.contact_number ??
    u.phone_number ??
    u.phoneNumber ??
    "";

  let country = "";
  if (typeof u.country === "string") country = u.country;
  else if (u.country && typeof u.country === "object") {
    country = u.country.countryName || u.country.name || "";
  } else {
    country = u.address?.country || "";
  }

  const appliedJobsCount =
    Number(
      u.applied_jobs_count ??
        u.appliedJobsCount ??
        u.applications_count ??
        0
    ) || 0;

  return {
    ...u,
    id,
    userName,
    email: u.email || "",
    contact,
    country: country || "—",
    appliedJobsCount,
    createDate: formatUserDate(
      u.created_at ?? u.created_on ?? u.createDate ?? u.registered_on
    ),
    action: { id },
  };
}

function isAdminLikeUser(u) {
  if (!u || typeof u !== "object") return false;
  const roleCandidates = [
    u.role,
    u.type,
    u.userType,
    u.user_type,
    u.account_type,
  ]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase().trim());

  if (roleCandidates.some((r) => r === "admin" || r === "superadmin")) {
    return true;
  }

  return Boolean(u.is_admin || u.isAdmin || u.is_super_admin || u.isSuperAdmin);
}

/**
 * UserListing Component
 *
 * A comprehensive user management component that provides:
 * - User listing with search and filtering capabilities
 * - Individual user deletion with confirmation modal
 * - Bulk user selection and deletion
 * - Responsive table with pagination
 *
 * @component
 * @returns {JSX.Element} The UserListing component
 */
const UserListing = ({ permissions = {} }) => {
  const canView = Boolean(permissions.view);
  const canDelete = Boolean(permissions.delete);
  const currentUser = useAppSelector((state) => state.user?.user);
  const currentUserRole = useAppSelector(
    (state) =>
      state.user?.role ||
      state.user?.user?.role ||
      state.user?.user?.type ||
      state.user?.user?.userType ||
      state.user?.user?.user_type ||
      ""
  );
  const isCurrentUserAdmin = String(currentUserRole).toLowerCase() === "admin";
  const currentUserId = useMemo(() => getIdFromStoredUser(currentUser), [currentUser]);

  const isSameUserRecord = useCallback(
    (record) => {
      const recordId = record?.id ?? record?.user_id ?? record?.userId;
      if (
        recordId === null ||
        recordId === undefined ||
        recordId === "" ||
        currentUserId === null ||
        currentUserId === undefined ||
        currentUserId === ""
      ) {
        return false;
      }
      return String(recordId).trim() === String(currentUserId).trim();
    },
    [currentUserId]
  );
  // ==================== STATE MANAGEMENT ====================

  /** @type {[string[], Function]} Selected row keys for bulk operations */
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  /** @type {[Object[], Function]} Selected user objects for bulk operations */
  const [selectedUsers, setSelectedUsers] = useState([]);

  /** @type {[Object[], Function]} Current list of users to display */
  const [users, setUsers] = useState([]);

  /** @type {[boolean, Function]} Loading state for users API */
  const [loading, setLoading] = useState(false);

  /** @type {[string, Function]} Search query for filtering users */
  const [searchQuery, setSearchQuery] = useState("");

  /** Debounced search sent to API */
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /** Server-side pagination */
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

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

  /** Debounce search input before calling API */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  /** Reset to first page when search changes */
  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [debouncedSearch]);

  /** Fetch users from GET /api/users (proxied) */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
      };
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await userService.getUsers(params);
      const { items, total } = parseUsersResponse(res);
      const sourceItems = isCurrentUserAdmin
        ? items
        : items.filter((item) => !isAdminLikeUser(item));
      const rows = sourceItems
        .map((item, index) => mapApiUserToRow(item, index))
        .filter((row) => row.id !== undefined && row.id !== null && row.id !== "");
      setUsers(rows);
      setPagination((prev) => ({
        ...prev,
        total: isCurrentUserAdmin
          ? typeof total === "number"
            ? total
            : rows.length
          : rows.length,
      }));
    } catch (err) {
      console.error("Failed to load users:", err);
      message.error(err?.message || "Failed to load users");
      setUsers([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, debouncedSearch, isCurrentUserAdmin]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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
  const handleConfirmDelete = useCallback(async () => {
    if (!userToDelete?.id) {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      return;
    }
    if (isSameUserRecord(userToDelete)) {
      message.warning("You cannot delete your own profile.");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      return;
    }
    try {
      await userService.deleteUser(userToDelete.id);
      message.success("User deleted successfully");
      await loadUsers();
    } catch (err) {
      message.error(err?.message || "Failed to delete user");
    }
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  }, [userToDelete, loadUsers, isSameUserRecord]);

  /**
   * Handles bulk delete confirmation
   * Removes selected users from list using Set for O(1) lookup performance
   */
  const handleConfirmBulkDelete = useCallback(async () => {
    if (!selectedUsers.length) {
      setIsBulkDeleteModalOpen(false);
      return;
    }
    const selfSelected = selectedUsers.some((u) => isSameUserRecord(u));
    if (selfSelected) {
      message.warning("You cannot delete your own profile.");
      setIsBulkDeleteModalOpen(false);
      return;
    }
    try {
      await Promise.all(
        selectedUsers.map((u) => userService.deleteUser(u.id))
      );
      message.success(`${selectedUsers.length} user(s) deleted successfully`);
      setSelectedRowKeys([]);
      setSelectedUsers([]);
      await loadUsers();
    } catch (err) {
      message.error(err?.message || "Bulk delete failed");
    }
    setIsBulkDeleteModalOpen(false);
  }, [selectedUsers, loadUsers, isSameUserRecord]);

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
   * Memoized row selection configuration
   * Prevents unnecessary re-renders of table selection
   */
  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      getCheckboxProps: (record) => ({
        disabled: isSameUserRecord(record),
      }),
      onChange: (selectedRowKeys, selectedRows) => {
        setSelectedRowKeys(selectedRowKeys);
        setSelectedUsers(selectedRows);
      },
    }),
    [selectedRowKeys, isSameUserRecord]
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
              <span className="C-heading size-xs mb-0 semiBold">
                View Details
              </span>
            </Space>
          ),
        });
      }
      if (canDelete) {
        const canDeleteThisRow = !(isCurrentUserAdmin && isSameUserRecord(record));
        if (canDeleteThisRow) {
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
      }
      return items;
    },
    [canView, canDelete, isCurrentUserAdmin, isSameUserRecord]
  );

  /**
   * Memoized render function for action column
   * Creates dropdown menu with view details and delete options
   */
  const renderAction = useCallback(
    (_, record) => {
      const actionMenuItems = getActionMenuItems(record);
      if (actionMenuItems.length === 0) return null;
      return (
        <Dropdown
          menu={{
            items: actionMenuItems,
            onClick: (menuInfo) => handleMenuClick(menuInfo, record),
          }}
          trigger={["hover", "click"]}
        >
          <button className="C-settingButton is-clean small">
            <Icon name="more_vert" />
          </button>
        </Dropdown>
      );
    },
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
        sorter: (a, b) =>
          String(a.userName || "").localeCompare(String(b.userName || "")),
      },
      {
        title: "Email ID",
        dataIndex: "email",
        key: "email",
        width: "20%",
        render: renderEmail,
        sorter: (a, b) =>
          String(a.email || "").localeCompare(String(b.email || "")),
      },
      {
        title: "Contact",
        dataIndex: "contact",
        key: "contact",
        width: "15%",
        render: renderContact,
        sorter: (a, b) =>
          String(a.contact ?? "").localeCompare(String(b.contact ?? "")),
      },
      {
        title: "Country",
        dataIndex: "country",
        key: "country",
        width: "15%",
        render: renderCountry,
        sorter: (a, b) =>
          String(a.country || "").localeCompare(String(b.country || "")),
      },
      {
        title: "Applied Jobs",
        dataIndex: "appliedJobsCount",
        key: "appliedJobsCount",
        width: "12%",
        render: renderAppliedJobs,
        sorter: (a, b) =>
          Number(a.appliedJobsCount || 0) - Number(b.appliedJobsCount || 0),
      },
      {
        title: "Registered On",
        dataIndex: "createDate",
        key: "createDate",
        width: "13%",
        render: renderCreateDate,
        sorter: (a, b) =>
          new Date(a.createDate) - new Date(b.createDate),
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
              <Divider orientation="vertical" />
            </Space>
          </div>

          <div className="col-5 text-right">
            <Space>
              {canDelete && !!selectedUsers.length && (
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
          dataSource={users}
          rowKey="id"
          rowSelection={canDelete ? rowSelection : undefined}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (page, pageSize) => {
              setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize: pageSize || prev.pageSize,
              }));
            },
          }}
          loading={loading}
          scroll={{ x: 800 }} // Enable horizontal scroll for smaller screens
        />
      </div>

      {/* Single User Delete Confirmation Modal */}
      <Modal
        title={
          <div className="d-flex align-items-center">
            <Icon name="delete" className="me-2" style={{ color: "#ff4d4f" }} />
            <span className="C-heading size-5 semiBold mb-0">
              Delete User: {userToDelete?.userName || ""}
            </span>
          </div>
        }
        open={isDeleteModalOpen}
        onCancel={handleCancelDelete}
        footer={
          <div className="d-flex justify-content-end gap-2">
            <Button 
              onClick={handleCancelDelete} 
              className="C-button is-bordered small"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              onClick={handleConfirmDelete}
              className="C-button is-filled small"
            >
              Delete
            </Button>
          </div>
        }
        width={400}
        className="delete-confirm-modal"
      >
        <p className="C-heading size-xs text-muted mb-0">
          Are you sure you want to delete this user? This action cannot be undone.
        </p>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        title={
          <div className="d-flex align-items-center">
            <Icon name="delete" className="me-2" style={{ color: "#ff4d4f" }} />
            <span className="C-heading size-5 semiBold mb-0">
              Delete {selectedUsers.length} User{selectedUsers.length > 1 ? "s" : ""}
            </span>
          </div>
        }
        open={isBulkDeleteModalOpen}
        onCancel={handleCancelBulkDelete}
        footer={
          <div className="d-flex justify-content-end gap-2">
            <Button 
              onClick={handleCancelBulkDelete} 
              className="C-button is-bordered small"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              onClick={handleConfirmBulkDelete}
              className="C-button is-filled small"
            >
              Delete
            </Button>
          </div>
        }
        width={400}
        className="delete-confirm-modal"
      >
        <p className="C-heading size-xs text-muted mb-0">
          Are you sure you want to delete {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""}? This action cannot be undone.
        </p>
      </Modal>

      {/* User Details Modal */}
      <Modal
        title={<span className="C-heading size-5 mb-0 bold">User Details</span>}
        open={isUserDetailsModalOpen}
        onCancel={handleCancelUserDetails}
        footer={null}
        width={800}
        centered
      >
        <div className="py-2">
          {userForDetails && (
            <>
              <div
                className="mb-3 p-3"
                style={{ border: "1px solid #f0f0f0", borderRadius: "10px" }}
              >
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <p className="C-heading size-xs mb-1 text-muted">User Name</p>
                    <p className="C-heading size-5 mb-0 bold">
                      {valueOrDash(userForDetails.userName)}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="C-heading size-xs mb-1 text-muted">Approval</p>
                    <p
                      className={`C-heading size-6 mb-0 semiBold ${
                        userForDetails.is_user_approved
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {userForDetails.is_user_approved ? "Approved" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="mb-3 p-3"
                style={{ border: "1px solid #f0f0f0", borderRadius: "10px" }}
              >
                <p className="C-heading size-xs mb-2 text-muted bold">
                  Basic Information
                </p>
                <div className="row">
                  <div className="col-6 mb-3">
                    <p className="C-heading size-xs mb-1 text-muted">Email</p>
                    <p className="C-heading size-6 mb-0">
                      {valueOrDash(userForDetails.email)}
                    </p>
                  </div>
                  <div className="col-6 mb-3">
                    <p className="C-heading size-xs mb-1 text-muted">Contact</p>
                    <p className="C-heading size-6 mb-0">
                      {valueOrDash(
                        [
                          userForDetails.contact_country_code,
                          userForDetails.contact,
                        ]
                          .filter(Boolean)
                          .join(" ") || userForDetails.contact
                      )}
                    </p>
                  </div>
                  <div className="col-6 mb-3">
                    <p className="C-heading size-xs mb-1 text-muted">Role</p>
                    <p className="C-heading size-6 mb-0">
                      {getUserRoleLabel(userForDetails)}
                    </p>
                  </div>
                  <div className="col-6 mb-3">
                    <p className="C-heading size-xs mb-1 text-muted">Registered On</p>
                    <p className="C-heading size-6 mb-0">
                      {formatUserDateTime(
                        userForDetails.created_on || userForDetails.created_at
                      )}
                    </p>
                  </div>
                  <div className="col-6">
                    <p className="C-heading size-xs mb-1 text-muted">Applied Jobs</p>
                    <p className="C-heading size-6 mb-0">
                      {valueOrDash(userForDetails.appliedJobsCount)}
                    </p>
                  </div>
                  <div className="col-6">
                    <p className="C-heading size-xs mb-1 text-muted">User ID</p>
                    <p className="C-heading size-6 mb-0">
                      {valueOrDash(userForDetails.id)}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="mb-3 p-3"
                style={{ border: "1px solid #f0f0f0", borderRadius: "10px" }}
              >
                <p className="C-heading size-xs mb-2 text-muted bold">
                  Subscription & Payment
                </p>
                <div className="row">
                  <div className="col-6 mb-3">
                    <p className="C-heading size-xs mb-1 text-muted">
                      Subscription Plan
                    </p>
                    <p className="C-heading size-6 mb-0">
                      {valueOrDash(userForDetails.subscription_plan)}
                    </p>
                  </div>
                  <div className="col-6 mb-3">
                    <p className="C-heading size-xs mb-1 text-muted">Paid User</p>
                    <p className="C-heading size-6 mb-0">
                      {userForDetails.payment_details?.is_paid_user
                        ? "Yes"
                        : "No"}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="mb-3 p-3"
                style={{ border: "1px solid #f0f0f0", borderRadius: "10px" }}
              >
                <p className="C-heading size-xs mb-2 text-muted bold">Address</p>
                <div className="row">
                  <div className="col-6 mb-3">
                    <p className="C-heading size-xs mb-1 text-muted">Country</p>
                    <p className="C-heading size-6 mb-0">
                      {valueOrDash(userForDetails.address?.country || userForDetails.country)}
                    </p>
                  </div>
                  <div className="col-6 mb-3">
                    <p className="C-heading size-xs mb-1 text-muted">State</p>
                    <p className="C-heading size-6 mb-0">
                      {valueOrDash(userForDetails.address?.state)}
                    </p>
                  </div>
                  <div className="col-6 mb-3">
                    <p className="C-heading size-xs mb-1 text-muted">City</p>
                    <p className="C-heading size-6 mb-0">
                      {valueOrDash(userForDetails.address?.city)}
                    </p>
                  </div>
                  <div className="col-6 mb-3">
                    <p className="C-heading size-xs mb-1 text-muted">Postal Code</p>
                    <p className="C-heading size-6 mb-0">
                      {valueOrDash(userForDetails.address?.postal_code)}
                    </p>
                  </div>
                  <div className="col-12">
                    <p className="C-heading size-xs mb-1 text-muted">Location</p>
                    <p className="C-heading size-6 mb-0">
                      {valueOrDash(userForDetails.address?.location)}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="p-3"
                style={{ border: "1px solid #f0f0f0", borderRadius: "10px" }}
              >
                <p className="C-heading size-xs mb-2 text-muted bold">
                  Social Media
                </p>
                <div className="row">
                  <div className="col-4 mb-2">
                    <p className="C-heading size-xs mb-1 text-muted">Facebook</p>
                    <p className="C-heading size-6 mb-0">
                      {valueOrDash(userForDetails.social_media?.facebook)}
                    </p>
                  </div>
                  <div className="col-4 mb-2">
                    <p className="C-heading size-xs mb-1 text-muted">Instagram</p>
                    <p className="C-heading size-6 mb-0">
                      {valueOrDash(userForDetails.social_media?.instagram)}
                    </p>
                  </div>
                  <div className="col-4 mb-2">
                    <p className="C-heading size-xs mb-1 text-muted">LinkedIn</p>
                    <p className="C-heading size-6 mb-0">
                      {valueOrDash(userForDetails.social_media?.linkedin)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Applied Jobs Modal */}
      <Modal
        title={
          <span className="C-heading size-5 mb-0 bold">
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
 * Memoized UserListing component for performance optimization
 * Prevents unnecessary re-renders when props haven't changed
 */
export default memo(UserListing);
