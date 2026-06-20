import React, { useCallback, useMemo, useState, memo } from "react";
import PropTypes from "prop-types";
import Icon from "@/components/Icon";
import {
  DatePicker,
  Divider,
  Input,
  Space,
  Table,
  Dropdown,
} from "antd";
import { ACTION_MENU_ITEMS } from "../../constants/equipmentConstants";

/**
 * EquipmentListing Component
 *
 * A comprehensive equipment management component that provides:
 * - Equipment listing with search and filtering capabilities
 * - Individual equipment deletion with confirmation modal
 * - Responsive table with pagination
 */
const EquipmentListing = ({
  equipment = [],
  loading = false,
  pagination = {},
  sortBy = "name",
  order = "asc",
  searchQuery = "",
  onSearchChange,
  onViewEquipment,
  onEditEquipment,
  onDeleteEquipment,
  onFetchEquipment,
  permissions = {},
  canManageEquipment,
}) => {
  const canView = Boolean(permissions.view);
  const canEdit = Boolean(permissions.edit);
  const canDelete = Boolean(permissions.delete);
  const canManageRecord = canManageEquipment ?? (() => true);

  const getActionMenuItems = useCallback(
    (record) => {
      const ownsEquipment = canManageRecord(record);
      const permMap = {
        view: canView,
        edit: canEdit && ownsEquipment,
        delete: canDelete && ownsEquipment,
      };
      return ACTION_MENU_ITEMS.filter((item) => permMap[item.key]).map((item) => ({
        ...item,
        label: (
          <Space align="center">
            <Icon name={item.key === "view" ? "visibility" : item.key} size="small" />
            <span className="C-heading size-xs mb-0">{item.label}</span>
          </Space>
        ),
      }));
    },
    [canView, canEdit, canDelete, canManageRecord]
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);

  /**
   * Handle search input change - delegates to parent; debouncing + API call live in useEquipment
   * (mirrors how CompanySearch -> useCompanyListing works).
   */
  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value ?? "";
      if (onSearchChange) {
        onSearchChange(value);
      }
    },
    [onSearchChange]
  );

  /**
   * Handle menu click (view/edit/delete)
   */
  const handleMenuClick = useCallback(
    ({ key }, record) => {
      if (key === "view") {
        if (onViewEquipment) {
          onViewEquipment(record);
        }
      } else if (key === "edit") {
        if (onEditEquipment) {
          onEditEquipment(record);
        }
      } else if (key === "delete") {
        if (onDeleteEquipment) {
          onDeleteEquipment(record);
        }
      }
    },
    [onViewEquipment, onEditEquipment, onDeleteEquipment]
  );

  /**
   * Handle table changes (pagination, sorting)
   */
  const handleTableChange = useCallback(
    (newPagination, filters, sorter, extra) => {
      const action = extra?.action;

      if (action !== "paginate" && action !== "sort") {
        return;
      }

      const params = {
        page: newPagination.current,
        limit: newPagination.pageSize,
        search: searchQuery,
      };

      if (sorter.field) {
        const fieldMapping = {
          name: "name",
          category: "category",
          type: "type",
          availableFor: "available_for",
          manufactureYear: "manufacture_year",
          createDate: "createdAt",
        };

        params.sortBy = fieldMapping[sorter.field] || sorter.field;
        params.order = sorter.order === "ascend" ? "asc" : "desc";
      } else {
        params.sortBy = sortBy;
        params.order = order;
      }

      if (onFetchEquipment) {
        onFetchEquipment(params);
      }
    },
    [onFetchEquipment, searchQuery, sortBy, order]
  );

  // Memoized row selection
  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        setSelectedRowKeys(selectedRowKeys);
        setSelectedEquipment(selectedRows);
      },
    }),
    [selectedRowKeys]
  );

  // Memoized render functions
  const renderName = useCallback(
    (text) => <span className="C-heading size-6 mb-1 semiBold">{text}</span>,
    []
  );

  const renderCategory = useCallback(
    (text) => <span className="C-heading size-6 mb-0">{text || "N/A"}</span>,
    []
  );

  const renderType = useCallback(
    (text) => <span className="C-heading size-6 mb-0">{text || "N/A"}</span>,
    []
  );

  const renderAvailableFor = useCallback(
    (text) => (
      <span className="C-heading size-6 mb-0 text-capitalize">
        {text || "N/A"}
      </span>
    ),
    []
  );

  const renderCreateDate = useCallback(
    (text) => <span className="C-heading size-6 mb-0">{text}</span>,
    []
  );

  const renderAction = useCallback(
    (_, record) => {
      const items = getActionMenuItems(record);
      if (items.length === 0) return null;
      return (
        <Dropdown
          menu={{
            items,
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

  // Table columns
  const columns = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: "20%",
        render: renderName,
        sorter: true,
        sortOrder:
          sortBy === "name" ? (order === "asc" ? "ascend" : "descend") : null,
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        width: "15%",
        render: renderCategory,
        sorter: true,
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        width: "15%",
        render: renderType,
        sorter: true,
      },
      {
        title: "Available For",
        dataIndex: "availableFor",
        key: "availableFor",
        width: "15%",
        render: renderAvailableFor,
        sorter: true,
      },
      {
        title: "Manufacture Year",
        dataIndex: "manufactureYear",
        key: "manufactureYear",
        width: "15%",
        render: (text) => (
          <span className="C-heading size-6 mb-0">{text || "N/A"}</span>
        ),
        sorter: true,
      },
      {
        title: "Created On",
        dataIndex: "createDate",
        key: "createDate",
        width: "15%",
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
    [renderName, renderCategory, renderType, renderAvailableFor, renderCreateDate, renderAction, sortBy, order]
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
              <Input
                size="large"
                placeholder="Search equipment"
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
          dataSource={equipment}
          rowKey="id"
          rowSelection={rowSelection}
          loading={loading}
          locale={{ emptyText: "No equipment found" }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} equipment`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </div>
    </>
  );
};

EquipmentListing.propTypes = {
  equipment: PropTypes.array,
  loading: PropTypes.bool,
  pagination: PropTypes.object,
  sortBy: PropTypes.string,
  order: PropTypes.string,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  onViewEquipment: PropTypes.func,
  onEditEquipment: PropTypes.func,
  onDeleteEquipment: PropTypes.func,
  onFetchEquipment: PropTypes.func,
  canManageEquipment: PropTypes.func,
};

export default memo(EquipmentListing);

