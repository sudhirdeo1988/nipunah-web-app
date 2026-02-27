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
  onEditEquipment,
  onDeleteEquipment,
  onFetchEquipment,
  permissions = {},
}) => {
  const canView = Boolean(permissions.view);
  const canEdit = Boolean(permissions.edit);
  const canDelete = Boolean(permissions.delete);

  const getActionMenuItems = useCallback(
    () => {
      const permMap = { view: canView, edit: canEdit, delete: canDelete };
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
    [canView, canEdit, canDelete]
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [equipmentForDetails, setEquipmentForDetails] = useState(null);
  const searchDebounceTimerRef = useRef(null);

  /**
   * Handle search input change with debouncing
   */
  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchValue(value);

      // Clear existing timer
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }

      // Set new timer for debounced search
      searchDebounceTimerRef.current = setTimeout(() => {
        if (onFetchEquipment) {
          onFetchEquipment({
            page: 1,
            search: value,
            sortBy,
            order,
          });
        }
      }, 500); // 500ms debounce delay
    },
    [onFetchEquipment, sortBy, order]
  );

  /**
   * Handle menu click (view/edit/delete)
   */
  const handleMenuClick = useCallback(
    ({ key }, record) => {
      if (key === "view") {
        setEquipmentForDetails(record);
        setIsViewDetailsModalOpen(true);
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
    [onEditEquipment, onDeleteEquipment]
  );

  /**
   * Handle cancel view details modal
   */
  const handleCancelViewDetails = useCallback(() => {
    setIsViewDetailsModalOpen(false);
    setEquipmentForDetails(null);
  }, []);

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
        search: searchValue,
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
    [onFetchEquipment, searchValue, sortBy, order]
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
      const items = getActionMenuItems();
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
                value={searchValue}
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

      {/* Equipment Details Modal */}
      <Modal
        title={
          <span className="C-heading size-5 mb-0 bold">Equipment Details</span>
        }
        open={isViewDetailsModalOpen}
        onCancel={handleCancelViewDetails}
        footer={null}
        width={900}
        centered
      >
        {equipmentForDetails && (
          <div className="py-3">
            {/* Basic Information Section */}
            <div className="mb-4">
              <h6 className="C-heading size-xs bold mb-3 color-dark">Basic Information</h6>
              <div className="row">
                <div className="col-6 mb-3 pb-3 border-bottom">
                  <p className="C-heading size-xs mb-2 bold color-dark">Equipment Name</p>
                  <p className="C-heading size-6 mb-0">
                    {equipmentForDetails.name || "N/A"}
                  </p>
                </div>
                <div className="col-6 mb-3 pb-3 border-bottom">
                  <p className="C-heading size-xs mb-2 bold color-dark">Category</p>
                  <p className="C-heading size-6 mb-0">
                    {equipmentForDetails.category || "N/A"}
                  </p>
                </div>
                <div className="col-6 mb-3 pb-3 border-bottom">
                  <p className="C-heading size-xs mb-2 bold color-dark">Type</p>
                  <p className="C-heading size-6 mb-0">
                    {equipmentForDetails.type || "N/A"}
                  </p>
                </div>
                <div className="col-6 mb-3 pb-3 border-bottom">
                  <p className="C-heading size-xs mb-2 bold color-dark">Manufacture Year</p>
                  <p className="C-heading size-6 mb-0">
                    {equipmentForDetails.manufactureYear || "N/A"}
                  </p>
                </div>
                <div className="col-6 mb-3 pb-3 border-bottom">
                  <p className="C-heading size-xs mb-2 bold color-dark">Manufacture Company</p>
                  <p className="C-heading size-6 mb-0">
                    {equipmentForDetails.manufactureCompany || "N/A"}
                  </p>
                </div>
                <div className="col-6 mb-3 pb-3 border-bottom">
                  <p className="C-heading size-xs mb-2 bold color-dark">Available For</p>
                  <p className="C-heading size-6 mb-0 text-capitalize">
                    {equipmentForDetails.availableFor || "N/A"}
                  </p>
                </div>
                {equipmentForDetails.rentType && (
                  <div className="col-6 mb-3 pb-3 border-bottom">
                    <p className="C-heading size-xs mb-2 bold color-dark">Rent Type</p>
                    <p className="C-heading size-6 mb-0 text-capitalize">
                      {equipmentForDetails.rentType}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="mb-4">
              <h6 className="C-heading size-xs bold mb-3 color-dark">About</h6>
              <div className="pb-3 border-bottom">
                <p className="C-heading size-6 mb-0">
                  {equipmentForDetails.about || "N/A"}
                </p>
              </div>
            </div>

            {/* Address Section */}
            <div className="mb-4">
              <h6 className="C-heading size-xs bold mb-3 color-dark">Equipment Address</h6>
              <div className="row pb-3 border-bottom">
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-2 bold color-dark">Country</p>
                  <p className="C-heading size-6 mb-0">
                    {equipmentForDetails.address?.country || "N/A"}
                  </p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-2 bold color-dark">State/Province</p>
                  <p className="C-heading size-6 mb-0">
                    {equipmentForDetails.address?.state || "N/A"}
                  </p>
                </div>
                <div className="col-12 mb-3">
                  <p className="C-heading size-xs mb-2 bold color-dark">Detail Address</p>
                  <p className="C-heading size-6 mb-0">
                    {equipmentForDetails.address?.location || "N/A"}
                  </p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-2 bold color-dark">City</p>
                  <p className="C-heading size-6 mb-0">
                    {equipmentForDetails.address?.city || "N/A"}
                  </p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-2 bold color-dark">Postal Code</p>
                  <p className="C-heading size-6 mb-0">
                    {equipmentForDetails.address?.postal_code || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="mb-4">
              <h6 className="C-heading size-xs bold mb-3 color-dark">Contact Information</h6>
              <div className="row pb-3 border-bottom">
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-2 bold color-dark">Contact Email</p>
                  <p className="C-heading size-6 mb-0">
                    {equipmentForDetails.contactEmail || "N/A"}
                  </p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-2 bold color-dark">Contact Number</p>
                  <p className="C-heading size-6 mb-0">
                    {equipmentForDetails.contact_country_code && equipmentForDetails.contactNumber
                      ? `${equipmentForDetails.contact_country_code} ${equipmentForDetails.contactNumber}`
                      : equipmentForDetails.contactNumber || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h6 className="C-heading size-xs bold mb-3 color-dark">Additional Information</h6>
              <div className="row">
                <div className="col-6">
                  <p className="C-heading size-xs mb-2 bold color-dark">Created On</p>
                  <p className="C-heading size-6 mb-0">
                    {equipmentForDetails.createDate || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

EquipmentListing.propTypes = {
  equipment: PropTypes.array,
  loading: PropTypes.bool,
  pagination: PropTypes.object,
  sortBy: PropTypes.string,
  order: PropTypes.string,
  onEditEquipment: PropTypes.func,
  onDeleteEquipment: PropTypes.func,
  onFetchEquipment: PropTypes.func,
};

export default memo(EquipmentListing);

