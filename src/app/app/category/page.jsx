"use client";

/**
 * CategoryPage Component
 *
 * Main page component for managing categories and subcategories.
 * Provides full CRUD operations with proper loading, error, and success states.
 *
 * Features:
 * - Category listing with pagination, sorting, and search
 * - Create/Edit categories and subcategories
 * - Delete with confirmation modal
 * - Expandable rows to view subcategories
 * - Error boundary for graceful error handling
 *
 * API Endpoints Used:
 * - GET /categories - Fetch categories list
 * - POST /category - Create category
 * - PUT /categories/{id} - Update category
 * - DELETE /categories/{id} - Delete category
 * - GET /categories/{id}/subcategories - Fetch subcategories
 * - POST /categories/{id}/subcategories - Create subcategory
 * - PUT /subcategories/{id} - Update subcategory
 * - DELETE /categories/{id}/subcategories/{id} - Delete subcategory
 */

import React, { useCallback, useState } from "react";
import Icon from "@/components/Icon";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { Dropdown, Space, Modal, message, Button } from "antd";
import MainCategoryListing from "module/Category/components/MainCategoryListing";
import CreateCategory from "module/Category/components/CreateCategory/CreateCategory";
import CategoryErrorBoundary from "module/Category/components/ErrorBoundary/CategoryErrorBoundary";
import {
  ADD_MENU_ITEMS,
  MODAL_MODES,
} from "module/Category/constants/categoryConstants";
import { getModalTitle } from "module/Category/utils/categoryUtils";
import { useCategoryModal } from "module/Category/hooks/useCategoryModal";
import { useCategory } from "module/Category/hooks/useCategory";

const CategoryPage = () => {
  const {
    isModalOpen,
    selectedCategory,
    modalMode,
    isEditMode,
    openModal,
    closeModal,
  } = useCategoryModal();

  // Category operations hook with pagination and sorting support
  const {
    categories,
    loading,
    error,
    pagination,
    sortBy,
    order,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    fetchCategories,
    getCategoriesForSelect,
    handleSort,
  } = useCategory();

  // Confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isSubCategoryDelete, setIsSubCategoryDelete] = useState(false);

  /**
   * Handle create category action
   *
   * Creates a new category and closes modal on success.
   * Error handling is done in the hook with message.error().
   *
   * @param {Object} formData - Form data from CreateCategory component
   * @param {string} formData.categoryName - Name of the category to create
   */
  const handleCreateCategory = useCallback(
    async (formData) => {
      try {
        // Create category (error handling is in the hook)
        await createCategory(formData);
        // Close modal only on success
        closeModal();
      } catch (error) {
        // Error is already handled in the hook with message.error()
        // No need to display it again here to avoid duplicates
        console.error("❌ Error creating category:", error);
        // Don't show error message here - hook already handles it
      }
    },
    [createCategory, closeModal]
  );

  /**
   * Handle create subcategory action
   *
   * Creates a new subcategory for a parent category.
   * Validates that categoryId is present before creating.
   *
   * @param {Object} formData - Form data from CreateCategory component
   * @param {number} formData.categoryId - ID of the parent category
   * @param {string} formData.subCategoryName - Name of the subcategory to create
   */
  const handleCreateSubCategory = useCallback(
    async (formData) => {
      console.log({ formData });
      try {
        // Get category ID from form data or selected category
        const categoryId = formData.categoryId || selectedCategory?.categoryId;

        // Validation: Ensure category ID is present
        if (!categoryId) {
          console.error("Category ID is required for subcategory creation");
          // Could show error message here
          return;
        }

        // Create subcategory (error handling is in the hook)
        await createSubCategory(categoryId, formData);

        // Close modal only on success
        closeModal();
      } catch (error) {
        // Error is already handled in the hook with message.error()
        // No need to display it again here to avoid duplicates
        console.error("❌ Error creating subcategory:", error);
        // Don't show error message here - hook already handles it
      }
    },
    [createSubCategory, selectedCategory, closeModal]
  );

  /**
   * Handle add category/subcategory button click
   *
   * Opens the appropriate modal based on the selected menu item.
   *
   * @param {Object} menu - Menu item object from dropdown
   * @param {string} menu.key - Menu item key ("category" or "sub_category")
   */
  const handleAddCategory = useCallback(
    (menu) => {
      const { key } = menu;

      // Determine modal mode based on menu selection
      const mode =
        key === MODAL_MODES.SUB_CATEGORY
          ? MODAL_MODES.SUB_CATEGORY
          : MODAL_MODES.CATEGORY;

      // Open modal for adding new category/sub-category
      // Pass null as second param to indicate create mode (not edit)
      openModal(mode, null);
    },
    [openModal]
  );

  /**
   * Handle edit category/subcategory action
   *
   * API Endpoints:
   * - PUT /categories/{id} for main categories
   * - PUT /subcategories/{id} for subcategories
   *
   * Payload: { "name": "string" }
   *
   * Shows loading state, calls update API, shows success/error messages,
   * and refreshes the list after successful update.
   */
  const handleEditCategory = useCallback(
    async (record, modalMode, formData) => {
      try {
        if (modalMode === MODAL_MODES.SUB_CATEGORY) {
          // Edit subcategory
          // API: PUT /subcategories/{id}
          const categoryId =
            formData.categoryId || record.categoryId || record.parentId;
          await updateSubCategory(categoryId, record.id, formData);
          // fetchCategories is already called in updateSubCategory hook
          // No need to call it again here
        } else {
          // Edit category
          // API: PUT /categories/{id}
          await updateCategory(record.id, formData);
          // fetchCategories is already called in updateCategory hook
        }
        // Close modal on success (error handling is done in the hook)
        closeModal();
      } catch (error) {
        // Error is already handled in the hook with message.error()
        // Keep modal open so user can retry
        console.error("Error updating category:", error);
      }
    },
    [updateCategory, updateSubCategory, closeModal, fetchCategories]
  );

  /**
   * Handle delete category/subcategory action
   *
   * Opens confirmation modal before deletion.
   *
   * @param {Object} record - Category or subcategory record to delete
   * @param {boolean} isSubCategory - Whether the record is a subcategory
   */
  const handleDeleteCategory = useCallback((record, isSubCategory = false) => {
    // Set state for delete confirmation modal
    setCategoryToDelete(record);
    setIsSubCategoryDelete(isSubCategory);
    setIsDeleteModalOpen(true);
  }, []);

  /**
   * Handle confirm delete action
   *
   * API Endpoint: DELETE /categories/{id}
   *
   * Shows loading state, calls delete API, shows success/error messages,
   * and refreshes the list after successful deletion.
   */
  const handleConfirmDelete = useCallback(async () => {
    if (categoryToDelete) {
      try {
        if (isSubCategoryDelete) {
          // Delete subcategory
          const categoryId =
            categoryToDelete.categoryId || categoryToDelete.parentId;
          await deleteSubCategory(categoryId, categoryToDelete.id);
        } else {
          // Delete category
          // API: DELETE /categories/{id}
          await deleteCategory(categoryToDelete.id);
        }
        // Close modal only on success
        // Error handling is done in the hook with message.error()
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
        setIsSubCategoryDelete(false);
      } catch (error) {
        // Error is already handled in the hook with message.error()
        // Keep modal open so user can retry or cancel
        console.error("Error deleting:", error);
        // Don't close modal on error - let user decide to retry or cancel
      }
    }
  }, [
    categoryToDelete,
    isSubCategoryDelete,
    deleteCategory,
    deleteSubCategory,
  ]);

  /**
   * Handle cancel delete action
   *
   * Closes delete confirmation modal without deleting.
   */
  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
    setIsSubCategoryDelete(false);
  }, []);

  /**
   * Handle modal form submission
   *
   * Routes to appropriate handler based on mode (create/edit) and type (category/subcategory).
   * All error handling is done in the individual handler functions.
   *
   * @param {Object} formData - Form data from CreateCategory component
   */
  const handleModalSubmit = useCallback(
    async (formData) => {
      try {
        if (isEditMode) {
          // Edit mode: Update existing category/subcategory
          await handleEditCategory(selectedCategory, modalMode, formData);
        } else {
          // Create mode: Create new category/subcategory
          if (modalMode === MODAL_MODES.SUB_CATEGORY) {
            console.log({ formData });
            await handleCreateSubCategory(formData);
          } else {
            await handleCreateCategory(formData);
          }
        }
      } catch (error) {
        // Error is already handled in individual handler functions
        // Log for debugging
        console.error("Error in modal submit:", error);
      }
    },
    [
      isEditMode,
      selectedCategory,
      modalMode,
      handleCreateCategory,
      handleCreateSubCategory,
      handleEditCategory,
    ]
  );

  return (
    <>
      <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
        <AppPageHeader
          title="Categories List"
          subtitle="Organize and manage categories and subcategories"
          children={
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
              trigger={["hover", "click"]}
            >
              <button className="C-button is-filled small">
                <Space>
                  <Icon name="add" />
                  Add
                  <Icon name="arrow_drop_down" />
                </Space>
              </button>
            </Dropdown>
          }
        />
        <div className="p-3">
          <CategoryErrorBoundary>
            <MainCategoryListing
              categories={categories}
              loading={loading}
              pagination={pagination}
              sortBy={sortBy}
              order={order}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onOpenModal={openModal}
              onFetchCategories={fetchCategories}
              onDeleteSubCategory={handleDeleteCategory}
              onSort={handleSort}
            />
          </CategoryErrorBoundary>
        </div>
      </div>

      <Modal
        title={
          <span className="C-heading size-5 mb-0 bold">
            {getModalTitle(modalMode, isEditMode)}
          </span>
        }
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        width={600}
        centered
        footer={null}
        onCancel={() => {
          // Reset form when modal is closed via X button or backdrop
          closeModal();
        }}
      >
        <CreateCategory
          selectedCategory={selectedCategory}
          modalMode={modalMode}
          onCancel={closeModal}
          onSubmit={handleModalSubmit}
          categories={getCategoriesForSelect()}
          loading={loading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="d-flex align-items-center">
            <Icon name="delete" className="me-2" style={{ color: "#ff4d4f" }} />
            <span className="C-heading size-5 semiBold mb-0">
              {isSubCategoryDelete 
                ? `Delete Sub-Category: ${categoryToDelete?.c_name || ""}`
                : `Delete Category: ${categoryToDelete?.c_name || ""}`}
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
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              onClick={handleConfirmDelete}
              className="C-button is-filled small"
              loading={loading}
            >
              Delete
            </Button>
          </div>
        }
        confirmLoading={loading}
        width={400}
        className="delete-confirm-modal"
      >
        <p className="C-heading size-xs text-muted mb-0">
          Are you sure you want to delete this {isSubCategoryDelete ? "sub-category" : "category"}? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default CategoryPage;
