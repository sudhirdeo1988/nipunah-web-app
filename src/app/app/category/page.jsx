"use client";

import React, { useCallback, useState } from "react";
import Icon from "@/components/Icon";
import { Dropdown, Space, Modal } from "antd";
import MainCategoryListing from "module/Category/components/MainCategoryListing";
import CreateCategory from "module/Category/components/CreateCategory/CreateCategory";
import CategoryErrorBoundary from "module/Category/components/ErrorBoundary/CategoryErrorBoundary";
import {
  ADD_MENU_ITEMS,
  MODAL_MODES,
} from "module/Category/constants/categoryConstants";
import { getModalTitle } from "module/Category/utils/categoryUtils";
import { useCategoryModal } from "module/Category/hooks/useCategoryModal";

const CategoryPage = () => {
  const {
    isModalOpen,
    selectedCategory,
    modalMode,
    isEditMode,
    openModal,
    closeModal,
  } = useCategoryModal();

  // Confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleCreateCategory = useCallback(() => {
    console.log("Creating new category");
    // Add your create category logic here
  }, []);

  const handleCreateSubCategory = useCallback(() => {
    console.log("Creating new sub category");
    // Add your create sub category logic here
  }, []);

  const handleAddCategory = useCallback(
    (menu) => {
      const { key } = menu;
      const mode =
        key === MODAL_MODES.SUB_CATEGORY
          ? MODAL_MODES.SUB_CATEGORY
          : MODAL_MODES.CATEGORY;

      // Open modal for adding new category/sub-category
      openModal(mode, null);
    },
    [openModal]
  );

  const handleEditCategory = useCallback((record, modalMode) => {
    console.log("Editing category:", record, "Mode:", modalMode);
    // Add your edit logic here
    // You can make API calls, update state, etc.
  }, []);

  const handleDeleteCategory = useCallback((record) => {
    console.log("Deleting category:", record);
    setCategoryToDelete(record);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (categoryToDelete) {
      console.log("Confirmed deletion of:", categoryToDelete);
      // Add your actual delete logic here
      // Example: await api.deleteCategory(categoryToDelete.id);
    }
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  }, [categoryToDelete]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  }, []);

  const handleModalSubmit = useCallback(() => {
    if (isEditMode) {
      // Handle edit logic - call the appropriate edit handler
      handleEditCategory(selectedCategory, modalMode);
    } else {
      // Handle create logic
      if (modalMode === MODAL_MODES.SUB_CATEGORY) {
        handleCreateSubCategory();
      } else {
        handleCreateCategory();
      }
    }
    closeModal();
  }, [
    isEditMode,
    selectedCategory,
    modalMode,
    handleCreateCategory,
    handleCreateSubCategory,
    handleEditCategory,
    closeModal,
  ]);

  return (
    <>
      <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
        <div className="p-3 border-bottom">
          <div className="row align-items-center">
            <div className="col-8">
              <span className="C-heaidng size-5 color-light mb-2 extraBold">
                Categories List
              </span>
            </div>
            <div className="col-4 text-right">
              <Dropdown
                menu={{
                  items: ADD_MENU_ITEMS.map((item) => ({
                    ...item,
                    label: (
                      <span className="C-heading size-xs mb-0 semiBold py-2">
                        {item.label}
                      </span>
                    ),
                  })),
                  onClick: (menuInfo) => handleAddCategory(menuInfo),
                }}
              >
                <button className="C-button is-filled small">
                  <Space>
                    <Icon name="add" />
                    Add
                    <Icon name="arrow_drop_down" />
                  </Space>
                </button>
              </Dropdown>
            </div>
          </div>
        </div>
        <div className="p-3">
          <CategoryErrorBoundary>
            <MainCategoryListing
              onCreateCategory={handleCreateCategory}
              onCreateSubCategory={handleCreateSubCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onOpenModal={openModal}
            />
          </CategoryErrorBoundary>
        </div>
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

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <span className="C-heaidng size-5 mb-0 bold">Delete Category</span>
        }
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
            Are you sure you want to delete this category? <br /> This action
            cannot be undone.
          </p>
          {categoryToDelete && (
            <div className="bg-light p-3 rounded">
              <p className="C-heading size-xs mb-1 text-muted">
                Category Name:
              </p>
              <p className="C-heading size-6 mb-0 bold">
                {categoryToDelete.c_name}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default CategoryPage;
