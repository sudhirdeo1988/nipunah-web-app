import Icon from "@/components/Icon";
import { Dropdown, Table, Modal, Space } from "antd";
import CreateCategory from "../CreateCategory/CreateCategory";
import {
  MOCK_SUB_CATEGORY_DATA,
  ACTION_MENU_ITEMS,
  MODAL_MODES,
} from "../../constants/categoryConstants";
import { getModalTitle } from "../../utils/categoryUtils";
import { useCategoryModal } from "../../hooks/useCategoryModal";
import React, { useMemo, useCallback, useState } from "react";
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

const SubCategoryListing = ({ parentRecord }) => {
  const {
    isModalOpen,
    selectedCategory,
    modalMode,
    isEditMode,
    openModal,
    closeModal,
  } = useCategoryModal();

  // Confirmation modal state for sub-category delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subCategoryToDelete, setSubCategoryToDelete] = useState(null);

  // Filter sub-categories based on parent record
  const filteredSubCategories = MOCK_SUB_CATEGORY_DATA.filter(
    (subCat) => subCat.parentId === parentRecord.id
  );

  // Separate edit handler for sub-categories
  const handleEditSubCategory = useCallback((record, modalMode) => {
    console.log("Editing sub-category:", record, "Mode:", modalMode);
    // Add your edit sub-category logic here
    // You can make API calls, update state, etc.
    // Example: await api.updateSubCategory(record.id, record);
  }, []);

  // Separate delete handler for sub-categories
  const handleDeleteSubCategory = useCallback((record) => {
    console.log("Deleting sub-category:", record);
    setSubCategoryToDelete(record);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDeleteSubCategory = useCallback(() => {
    if (subCategoryToDelete) {
      console.log("Confirmed deletion of sub-category:", subCategoryToDelete);
      // Add your actual delete logic here
      // Example: await api.deleteSubCategory(subCategoryToDelete.id);
    }
    setIsDeleteModalOpen(false);
    setSubCategoryToDelete(null);
  }, [subCategoryToDelete]);

  const handleCancelDeleteSubCategory = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSubCategoryToDelete(null);
  }, []);

  const handleSubCategoryMenuClick = useCallback(
    ({ key, domEvent }, record) => {
      domEvent.stopPropagation();

      if (key === "edit") {
        openModal(MODAL_MODES.SUB_CATEGORY, record);
      } else if (key === "delete") {
        handleDeleteSubCategory(record);
      }
    },
    [openModal, handleDeleteSubCategory]
  );

  const handleModalSubmit = useCallback(() => {
    if (isEditMode) {
      handleEditSubCategory(selectedCategory, modalMode);
    }
    closeModal();
  }, [
    isEditMode,
    selectedCategory,
    modalMode,
    handleEditSubCategory,
    closeModal,
  ]);

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: "10%",
      },
      {
        title: "Sub Category Name",
        dataIndex: "c_name",
        key: "c_name",
        width: "40%",
        render: (text) => (
          <span className="C-heading size-6 mb-0 bold">{text}</span>
        ),
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
        width: "30%",
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
              onClick: (menuInfo) =>
                handleSubCategoryMenuClick(menuInfo, record),
            }}
          >
            <button className="C-settingButton is-clean small">
              <Icon name="more_vert" />
            </button>
          </Dropdown>
        ),
      },
    ],
    [handleSubCategoryMenuClick]
  );

  return (
    <>
      <div className="p-3">
        <h6 className="mb-3">Sub Categories for {parentRecord.c_name}</h6>
        <Table
          columns={columns}
          dataSource={filteredSubCategories}
          rowKey="id"
          pagination={{ hideOnSinglePage: true, defaultPageSize: 5 }}
          size="small"
        />
      </div>

      <Modal
        title={
          <span className="C-heaidng size-5 mb-0 bold">
            {getModalTitle(modalMode, isEditMode)}
          </span>
        }
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        width={600}
        centered
        footer={null}
        onCancel={closeModal}
      >
        <CreateCategory
          selectedCategory={selectedCategory}
          modalMode={modalMode}
          onCancel={closeModal}
          onSubmit={handleModalSubmit}
        />
      </Modal>

      {/* Delete Confirmation Modal for Sub-Category */}
      <Modal
        title={
          <span className="C-heaidng size-5 mb-0 bold">
            Delete sub-category
          </span>
        }
        open={isDeleteModalOpen}
        onOk={handleConfirmDeleteSubCategory}
        onCancel={handleCancelDeleteSubCategory}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ className: "C-button is-filled" }}
        cancelButtonProps={{ className: "C-button is-bordered" }}
        centered
      >
        <div className="py-3">
          <p className="C-heading size-6 bold mb-3">
            Are you sure you want to delete this sub-category? <br /> This
            action cannot be undone.
          </p>
          {subCategoryToDelete && (
            <div className="bg-light p-3 rounded">
              <p className="C-heading size-xs mb-1 text-muted">
                Sub-Category Name:
              </p>
              <p className="C-heading size-6 mb-4 bold">
                {subCategoryToDelete.c_name}
              </p>
              <p className="C-heading size-xs mb-1 text-muted">
                Parent Category:
              </p>
              <p className="C-heading size-xs mb-0 bold mt-2">
                {parentRecord.c_name}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

SubCategoryListing.propTypes = {
  parentRecord: PropTypes.object.isRequired,
};

export default SubCategoryListing;
