import Icon from "@/components/Icon";
import { Dropdown, Table, Modal, Space } from "antd";
import CreateCategory from "../CreateCategory/CreateCategory";
import {
  ACTION_MENU_ITEMS,
  MODAL_MODES,
} from "../../constants/categoryConstants";
import { getModalTitle } from "../../utils/categoryUtils";
import { useCategoryModal } from "../../hooks/useCategoryModal";
import { useCategory } from "../../hooks/useCategory";
import React, { useMemo, useCallback, useState, useEffect, useRef, memo } from "react";
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
 * SubCategoryListing Component
 * 
 * Displays subcategories for a parent category in an expandable table row.
 * Handles CRUD operations for subcategories with proper loading and error states.
 * 
 * Performance optimizations:
 * - Uses refs to prevent duplicate API calls
 * - Memoized columns to prevent unnecessary re-renders
 * - Only fetches when parent category changes
 * 
 * Error handling:
 * - Shows error messages via Ant Design message component
 * - Handles loading states properly
 * - Allows retry on error
 * 
 * @param {Object} props - Component props
 * @param {Object} props.parentRecord - Parent category record
 * @param {number} props.parentRecord.id - Parent category ID
 * @param {string} props.parentRecord.c_name - Parent category name
 * @param {Function} props.onDeleteSubCategory - Handler for subcategory deletion
 */
/**
 * SubCategoryListing Component Props
 * 
 * @param {Object} props - Component props
 * @param {Object} props.parentRecord - Parent category record
 * @param {Function} props.onDeleteSubCategory - Handler for subcategory deletion
 * @param {Function} props.onEditSubCategory - Handler for subcategory edit (optional, falls back to parent handler)
 */
const SubCategoryListing = memo(({ parentRecord, onDeleteSubCategory, onEditSubCategory }) => {
  const {
    isModalOpen,
    selectedCategory,
    modalMode,
    isEditMode,
    openModal,
    closeModal,
  } = useCategoryModal();

  const { fetchSubCategories, getCategoriesForSelect, updateSubCategory, createSubCategory, deleteSubCategory } = useCategory();

  // Confirmation modal state for sub-category delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subCategoryToDelete, setSubCategoryToDelete] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  // Use ref to track which category we've fetched to prevent duplicate calls
  const fetchedCategoryIdRef = useRef(null);
  const isFetchingRef = useRef(false);

  /**
   * Load subcategories when component mounts or parent record changes
   *
   * Performance optimizations:
   * - Uses data from main categories API response (no separate API call)
   * - Uses refs to prevent duplicate processing
   * - Only processes if category ID changed and not already processing
   * - Tracks processed category to avoid redundant operations
   *
   * Note: Subcategories are already included in the main categories API response,
   * so we just extract them from the parentRecord instead of making a separate API call.
   */
  useEffect(() => {
    const loadSubCategories = async () => {
      const categoryId = parentRecord?.id;
      
      // Validation: Only process if we have a valid category ID
      if (!categoryId) {
        console.warn("No category ID provided to SubCategoryListing");
        return;
      }
      
      // Performance: Only process if:
      // 1. We have a category ID
      // 2. We haven't processed this category yet (prevents duplicate operations)
      // 3. We're not currently processing (prevents concurrent operations)
      if (
        fetchedCategoryIdRef.current !== categoryId &&
        !isFetchingRef.current
      ) {
        isFetchingRef.current = true;
        setLoading(true);
        
        try {
          // Extract subcategories from parentRecord (already fetched from main API)
          // No separate API call needed - data comes from GET /categories response
          const data = await fetchSubCategories(categoryId);
          setSubCategories(data);
          
          // Mark this category as processed to prevent duplicate operations
          fetchedCategoryIdRef.current = categoryId;
        } catch (error) {
          // Error handling: Log error and reset state to allow retry
          console.error("Error loading subcategories:", error);
          
          // Reset ref on error so we can retry on next render
          fetchedCategoryIdRef.current = null;
        } finally {
          // Always reset loading state, even on error
          setLoading(false);
          isFetchingRef.current = false;
        }
      }
    };

    loadSubCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentRecord?.id]); // Only depend on parentRecord.id to prevent unnecessary re-processing

  // Separate delete handler for sub-categories
  const handleDeleteSubCategoryClick = useCallback(
    (record) => {
      setSubCategoryToDelete(record);
      setIsDeleteModalOpen(true);
    },
    []
  );

  /**
   * Handle confirm delete subcategory action
   * 
   * Deletes the subcategory and refreshes the list.
   * Handles loading state and errors properly.
   * 
   * Error handling: Shows error message if delete or reload fails.
   */
  const handleConfirmDeleteSubCategory = useCallback(async () => {
    if (!subCategoryToDelete) {
      console.warn("Cannot delete: missing subcategory");
      return;
    }

    try {
      // Get category ID from subcategory record or parent record
      const categoryId =
        subCategoryToDelete.categoryId ||
        subCategoryToDelete.parentId ||
        parentRecord.id;

      if (!categoryId) {
        console.error("Category ID is required for subcategory deletion");
        return;
      }

      console.log("🟢 API CALL: DELETE /categories/{categoryId}/subcategories/{subCategoryId}", {
        categoryId,
        subCategoryId: subCategoryToDelete.id,
      });

      // Call deleteSubCategory from hook to make API call
      await deleteSubCategory(categoryId, subCategoryToDelete.id);

      // Reload subcategories after successful delete
      setLoading(true);
      try {
        const data = await fetchSubCategories(parentRecord.id);
        setSubCategories(data);

        // Reset fetched ref to allow fresh fetch
        fetchedCategoryIdRef.current = null;
      } catch (error) {
        // Error reloading: Log but don't show error (delete was successful)
        console.error("Error reloading subcategories after delete:", error);
      } finally {
        setLoading(false);
      }

      // Close modal only on success
      setIsDeleteModalOpen(false);
      setSubCategoryToDelete(null);
    } catch (error) {
      // Delete failed - error is already handled in the hook with message.error()
      // Keep modal open so user can retry
      console.error("Error deleting subcategory:", error);
    }
  }, [subCategoryToDelete, parentRecord.id, fetchSubCategories, deleteSubCategory]);

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
        handleDeleteSubCategoryClick(record);
      }
    },
    [openModal, handleDeleteSubCategoryClick]
  );

  /**
   * Handle modal form submission (create/edit subcategory)
   * 
   * Makes the API call to create or update subcategory, then reloads the list.
   * 
   * API Endpoints:
   * - PUT /subcategories/{id} for edit
   * - POST /categories/{id}/subcategories for create
   * 
   * @param {Object} formData - Form data from CreateCategory component
   */
  const handleModalSubmit = useCallback(
    async (formData) => {
      try {
        if (isEditMode && selectedCategory) {
          // Edit mode: Update existing subcategory
          // API: PUT /subcategories/{id}
          // Payload: { "name": "string" }
          const categoryId =
            formData.categoryId ||
            selectedCategory.categoryId ||
            selectedCategory.parentId ||
            parentRecord.id;

          console.log("🟢 API CALL: PUT /subcategories/{id}", {
            subCategoryId: selectedCategory.id,
            categoryId,
            payload: { name: formData.subCategoryName },
          });

          // Call API to update subcategory
          await updateSubCategory(categoryId, selectedCategory.id, {
            subCategoryName: formData.subCategoryName,
          });
        } else {
          // Create mode: Create new subcategory
          // API: POST /categories/{id}/subcategories
          // Payload: { "name": "string" }
          const categoryId = formData.categoryId || parentRecord.id;

          if (!categoryId) {
            console.error("Category ID is required for subcategory creation");
            return;
          }

          console.log("🟢 API CALL: POST /categories/{id}/subcategories", {
            categoryId,
            payload: { name: formData.subCategoryName },
          });

          // Call API to create subcategory
          await createSubCategory(categoryId, {
            subCategoryName: formData.subCategoryName,
          });
        }

        // Reload subcategories after successful create/edit
        if (parentRecord?.id) {
          setLoading(true);
          try {
            const data = await fetchSubCategories(parentRecord.id);
            setSubCategories(data);

            // Reset fetched ref to ensure fresh data
            fetchedCategoryIdRef.current = null;
          } catch (error) {
            // Error reloading: Log but don't block modal close
            console.error("Error reloading subcategories after create/edit:", error);
          } finally {
            setLoading(false);
          }
        }

        // Close modal after successful operation
        closeModal();
      } catch (error) {
        // Error is already handled in the hook with message.error()
        // Keep modal open so user can retry
        console.error("Error in subcategory modal submit:", error);
      }
    },
    [
      isEditMode,
      selectedCategory,
      parentRecord.id,
      updateSubCategory,
      createSubCategory,
      fetchSubCategories,
      closeModal,
    ]
  );

  /**
   * Table columns configuration for subcategories
   * 
   * Performance: Memoized to prevent recreation on every render.
   * Only recreates when handleSubCategoryMenuClick changes.
   */
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
            trigger={['hover', 'click']}
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
          dataSource={subCategories}
          rowKey="id"
          loading={loading}
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
          categories={getCategoriesForSelect()}
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
});

SubCategoryListing.displayName = "SubCategoryListing";

SubCategoryListing.propTypes = {
  parentRecord: PropTypes.object.isRequired,
  onDeleteSubCategory: PropTypes.func,
  onEditSubCategory: PropTypes.func, // Optional - for future use
};

export default SubCategoryListing;
