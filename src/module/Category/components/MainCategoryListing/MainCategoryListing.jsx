import Icon from "@/components/Icon";
import { DatePicker, Divider, Dropdown, Input, Space, Table } from "antd";
import SubCategoryListing from "../SubCategoryListing/SubCategoryListing";
import {
  MOCK_CATEGORY_DATA,
  ACTION_MENU_ITEMS,
  MODAL_MODES,
} from "../../constants/categoryConstants";
import { isSubCategory } from "../../utils/categoryUtils";
import React, { useMemo, useCallback } from "react";
import PropTypes from "prop-types";

// Transform action menu items to include icons
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

const MainCategoryListing = ({ onDeleteCategory, onOpenModal }) => {
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
      console.log("Deleting main category:", record);
      onDeleteCategory(record);
    },
    [onDeleteCategory]
  );

  const handleMenuClick = useCallback(
    ({ key, domEvent }, record) => {
      domEvent.stopPropagation();

      if (key === "edit") {
        const isSub = isSubCategory(record);
        const mode = isSub ? MODAL_MODES.SUB_CATEGORY : MODAL_MODES.CATEGORY;
        handleEdit(record, mode);
      } else if (key === "delete") {
        handleDelete(record);
      }
    },
    [handleEdit, handleDelete]
  );

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: "10%",
      },
      {
        title: "Category Name",
        dataIndex: "c_name",
        key: "c_name",
        width: "30%",
        render: (text) => (
          <span className="C-heading size-6 mb-0 bold">{text}</span>
        ),
      },
      {
        title: "Sub Categories",
        dataIndex: "sub_categories",
        key: "sub_categories",
        width: "20%",
        render: (text) => <span className="C-heading size-6 mb-0">{text}</span>,
      },
      {
        title: "Created On",
        dataIndex: "createDate",
        key: "createDate",
        width: "20%",
        render: (text) => <span className="C-heading size-6 mb-0">{text}</span>,
      },
      {
        title: "Created By",
        dataIndex: "createdBy",
        key: "createdBy",
        width: "20%",
        render: (text) => <span className="C-heading size-6 mb-0">{text}</span>,
      },
      {
        title: "Action",
        dataIndex: "action",
        key: "action",
        width: "80",
        render: (_, record) => (
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
      },
    ],
    [handleMenuClick]
  );

  return (
    <>
      <div className="mb-3">
        <div className="row align-items-center">
          <div className="col-9">
            <Space>
              <Space>
                <span className="C-heading size-xs semiBold mb-0">
                  Created On:
                </span>
                <DatePicker size="large" />
              </Space>
              <Divider type="vertical" />
            </Space>
          </div>

          <div className="col-3 text-right">
            <Input
              size="large"
              placeholder="Search Category"
              prefix={<Icon name="search" />}
              width="200"
            />
          </div>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={MOCK_CATEGORY_DATA}
        rowKey="id"
        pagination={{ hideOnSinglePage: true, defaultPageSize: 10 }}
        expandable={{
          expandedRowRender: (record) => (
            <SubCategoryListing parentRecord={record} />
          ),
        }}
      />
    </>
  );
};

MainCategoryListing.propTypes = {
  onCreateCategory: PropTypes.func.isRequired,
  onCreateSubCategory: PropTypes.func.isRequired,
  onEditCategory: PropTypes.func.isRequired,
  onDeleteCategory: PropTypes.func.isRequired,
  onOpenModal: PropTypes.func.isRequired,
};

export default MainCategoryListing;
