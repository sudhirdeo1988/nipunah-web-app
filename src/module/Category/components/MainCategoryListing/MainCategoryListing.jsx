import Icon from "@/components/Icon";
import { Divider, Dropdown, Input, Space, Table } from "antd";
import SubCategoryListing from "../SubCategoryListing/SubCategoryListing";
import {
  ACTION_MENU_ITEMS,
  MODAL_MODES,
} from "../../constants/categoryConstants";
import { isSubCategory } from "../../utils/categoryUtils";
import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
  memo,
} from "react";
import PropTypes from "prop-types";

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
 * MainCategoryListing Component
 *
 * Displays a table of categories with pagination, sorting, search, and date filter functionality.
 * Supports expandable rows to show subcategories.
 *
 * @param {Array} categories - List of categories to display
 * @param {boolean} loading - Loading state
 * @param {Object} pagination - Pagination configuration
 * @param {Function} onDeleteCategory - Handler for category deletion
 * @param {Function} onOpenModal - Handler to open edit/create modal
 * @param {Function} onFetchCategories - Handler to fetch categories with filters
 * @param {Function} onDeleteSubCategory - Handler for subcategory deletion
 * @param {Function} onSort - Handler for sorting changes
 * @param {string} sortBy - Current sort field
 * @param {string} order - Current sort order (asc/desc)
 */
/**
 * MainCategoryListing Component (Memoized)
 *
 * Performance: Wrapped in React.memo to prevent unnecessary re-renders.
 * Only re-renders when props actually change.
 */
const MainCategoryListing = memo(
  ({
    categories = [],
    loading = false,
    pagination = {},
    onDeleteCategory,
    onOpenModal,
    onFetchCategories,
    onDeleteSubCategory,
    onSort,
    sortBy = "name",
    order = "asc",
  }) => {
    // Search input value state
    const [searchValue, setSearchValue] = useState("");
    // On edit handler for main categories
    const handleEdit = useCallback(
      (record, modalMode) => {
        console.log("Editing main category:", record, "Mode:", modalMode);
        onOpenModal(modalMode, record);
      },
      [onOpenModal]
    );

    // On delete handler for main categories
    const handleDelete = useCallback(
      (record) => {
        onDeleteCategory(record, false);
      },
      [onDeleteCategory]
    );

    /**
     * Handle table changes (pagination, sorting, filters)
     *
     * Maps table column names to API field names:
     * - c_name -> name (for API)
     * - createDate -> createdAt (for API)
     *
     * @param {Object} pagination - New pagination state
     * @param {Object} filters - Table filters
     * @param {Object} sorter - Sorting information
     */
    const handleTableChange = useCallback(
      (newPagination, filters, sorter, extra) => {
        // Log all parameters for debugging
        console.log("🔍 Table onChange called:", {
          action: extra?.action,
          pagination: {
            current: newPagination.current,
            pageSize: newPagination.pageSize,
            oldCurrent: pagination.current,
            oldPageSize: pagination.pageSize,
          },
          sorter: sorter.field
            ? { field: sorter.field, order: sorter.order }
            : null,
          extra: extra,
        });

        const action = extra?.action;

        // CRITICAL: Do NOT call API for expand/collapse actions
        // Subcategories are already in the main API response - no need to refetch
        if (action === "expand" || action === "collapse") {
          console.log("🔵 Table action IGNORED (expand/collapse):", action);
          return; // Early return - do nothing
        }

        // Safety check: If no onFetchCategories handler, do nothing
        if (!onFetchCategories) {
          console.log("🔵 No onFetchCategories handler");
          return;
        }

        // Check if pagination and sort actually changed
        const paginationChanged =
          newPagination.current !== pagination.current ||
          newPagination.pageSize !== pagination.pageSize;
        const sortChanged = sorter.field && sorter.order;

        // CRITICAL SAFEGUARD: If nothing actually changed, don't call API
        // This catches expand/collapse cases where action might not be set correctly
        if (!paginationChanged && !sortChanged) {
          console.log(
            "🔵 Table onChange IGNORED (nothing changed - likely expand/collapse)"
          );
          return; // Early return - nothing changed, so no API call needed
        }

        // CRITICAL: If action is undefined or null, it might be an expand/collapse
        // Ant Design Table sometimes doesn't pass action for expand/collapse
        // If nothing changed (already checked above), we returned early
        // If something changed but no action, be safe and ignore it
        if (!action) {
          console.log("🔵 Table onChange IGNORED (no action specified)");
          return;
        }

        // ONLY call API for explicit pagination or sorting actions
        // Do NOT call for any other actions
        const isPaginationAction = action === "paginate";
        const isSortAction = action === "sort";

        // Only proceed if action is explicitly 'paginate' or 'sort'
        if (!isPaginationAction && !isSortAction) {
          console.log("🔵 Table action IGNORED (not paginate/sort):", action);
          return; // Do nothing for any other action
        }

        // We have a valid pagination or sort action - proceed with API call
        console.log("🟢 Table action triggering API call:", {
          action,
          isPaginationAction,
          isSortAction,
        });

        const params = {
          page: newPagination.current,
          limit: newPagination.pageSize,
          search: searchValue,
        };

        // Add sorting parameters if column is sorted
        if (sorter.field) {
          // Map table column names to API field names
          const fieldMapping = {
            c_name: "name", // Table uses c_name, API expects name
            createDate: "createdAt", // Table uses createDate, API expects createdAt
          };

          params.sortBy = fieldMapping[sorter.field] || sorter.field;
          params.order = sorter.order === "ascend" ? "asc" : "desc";
        } else {
          // Keep current sort if no new sort is applied
          params.sortBy = sortBy;
          params.order = order;
        }

        onFetchCategories(params);
      },
      [
        onFetchCategories,
        searchValue,
        sortBy,
        order,
        pagination.current,
        pagination.pageSize,
      ]
    );

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
    const searchDebounceTimerRef = useRef(null);

    const handleSearch = useCallback(
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
          if (onFetchCategories) {
            onFetchCategories({
              page: 1, // Reset to first page on new search
              limit: pagination.pageSize || 10,
              search: value,
            });
          }
        }, 500); // 500ms debounce delay - adjust as needed
      },
      [onFetchCategories, pagination.pageSize]
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
     * Handle action menu click (edit/delete)
     *
     * Routes to appropriate handler based on menu item selected.
     * Prevents event propagation to avoid triggering row expansion.
     *
     * @param {Object} menuInfo - Menu click information
     * @param {string} menuInfo.key - Menu item key ("edit" or "delete")
     * @param {Event} menuInfo.domEvent - DOM event object
     * @param {Object} record - Category record the action is for
     */
    const handleMenuClick = useCallback(
      ({ key, domEvent }, record) => {
        // Prevent event propagation to avoid triggering row expansion
        domEvent.stopPropagation();

        if (key === "edit") {
          // Determine if this is a subcategory or main category
          const isSub = isSubCategory(record);
          const mode = isSub ? MODAL_MODES.SUB_CATEGORY : MODAL_MODES.CATEGORY;
          handleEdit(record, mode);
        } else if (key === "delete") {
          handleDelete(record);
        }
      },
      [handleEdit, handleDelete]
    );

    /**
     * Table columns configuration with sorting support
     *
     * Columns are sortable where applicable (name, createdAt)
     */
    const columns = useMemo(
      () => [
        {
          title: "ID",
          dataIndex: "id",
          key: "id",
          width: "10%",
          // ID column is not sortable
        },
        {
          title: "Category Name",
          dataIndex: "c_name",
          key: "c_name",
          width: "30%",
          // Enable sorting by name field
          // Note: Table uses c_name, but API expects "name" as sortBy parameter
          sorter: true,
          sortOrder:
            sortBy === "name" ? (order === "asc" ? "ascend" : "descend") : null,
          render: (text) => (
            <span className="C-heading size-6 mb-0 bold">{text}</span>
          ),
        },
        {
          title: "Sub Categories",
          dataIndex: "sub_categories",
          key: "sub_categories",
          width: "20%",
          // Sub categories count is not sortable
          render: (text) => (
            <span className="C-heading size-6 mb-0">{text}</span>
          ),
        },
        {
          title: "Created On",
          dataIndex: "createDate",
          key: "createDate",
          width: "20%",
          // Enable sorting by createdAt field
          // Note: Table uses createDate, but API expects "createdAt" as sortBy parameter
          sorter: true,
          sortOrder:
            sortBy === "createdAt"
              ? order === "asc"
                ? "ascend"
                : "descend"
              : null,
          render: (text) => (
            <span className="C-heading size-6 mb-0">{text}</span>
          ),
        },
        {
          title: "Created By",
          dataIndex: "createdBy",
          key: "createdBy",
          width: "20%",
          // Created by is not sortable
          render: (text) => (
            <span className="C-heading size-6 mb-0">{text}</span>
          ),
        },
        {
          title: "Action",
          dataIndex: "action",
          key: "action",
          width: "80",
          // Action column is not sortable
          render: (_, record) => (
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
        },
      ],
      [handleMenuClick, sortBy, order]
    );

    return (
      <>
        <div className="mb-3">
          <div className="row align-items-center">
            <div className="col-9">
              {/* Filters section - date filter removed */}
            </div>

            <div className="col-3 text-right">
              <Input
                size="large"
                placeholder="Search Category"
                prefix={<Icon name="search" />}
                value={searchValue}
                onChange={handleSearch}
                allowClear
              />
            </div>
          </div>
        </div>

        {/* Loading State - Table shows built-in loading spinner */}
        {/* Success State - Show data in table */}
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} categories`,
          }}
          onChange={handleTableChange}
          expandable={{
            /**
             * Render subcategories when a category row is expanded
             *
             * Performance optimizations:
             * - Uses stable key based on category ID only (not subcategories data)
             * - SubCategoryListing component handles its own API calls and caching
             * - No need to pass subcategories data since it fetches from separate API
             *
             * @param {Object} record - The category record being expanded
             * @returns {JSX.Element} SubCategoryListing component
             */
            expandedRowRender: (record) => {
              // Performance: Use stable key based only on category ID
              // SubCategoryListing will fetch its own data and handle caching
              return (
                <SubCategoryListing
                  key={`subcategory-${record.id}`}
                  parentRecord={record}
                  onDeleteSubCategory={onDeleteSubCategory}
                  onRefresh={onFetchCategories}
                />
              );
            },
            /**
             * Handle expand/collapse events
             *
             * Performance: Prevents table onChange from being triggered on expand/collapse
             * This avoids unnecessary category API calls when just expanding rows
             *
             * @param {boolean} expanded - Whether the row is expanded
             * @param {Object} record - The category record
             */
            onExpand: (expanded, record) => {
              // Performance: Do nothing on expand/collapse
              // This prevents the categories API from being called unnecessarily
              // SubCategoryListing will fetch subcategories when it mounts (on expand)
              console.log("🔵 Row expanded/collapsed:", {
                expanded,
                categoryId: record.id,
              });
            },
          }}
        />
      </>
    );
  }
);

MainCategoryListing.displayName = "MainCategoryListing";

MainCategoryListing.propTypes = {
  categories: PropTypes.array,
  loading: PropTypes.bool,
  pagination: PropTypes.object,
  onDeleteCategory: PropTypes.func.isRequired,
  onOpenModal: PropTypes.func.isRequired,
  onFetchCategories: PropTypes.func,
  onDeleteSubCategory: PropTypes.func,
  onSort: PropTypes.func,
  sortBy: PropTypes.string,
  order: PropTypes.oneOf(["asc", "desc"]),
};

export default MainCategoryListing;
