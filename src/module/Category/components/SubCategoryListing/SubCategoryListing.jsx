import Icon from "@/components/Icon";
import { Dropdown, Table, Modal, Space, message } from "antd";
import CreateSubCategoryForm from "../CreateSubCategoryForm";
import {
  ACTION_MENU_ITEMS,
  MODAL_MODES,
} from "../../constants/categoryConstants";
import { getModalTitle } from "../../utils/categoryUtils";
import { useCategoryModal } from "../../hooks/useCategoryModal";
import { categoryService } from "@/utilities/apiServices";
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
const SubCategoryListing = memo(
  ({ parentRecord, onDeleteSubCategory, onEditSubCategory, onRefresh }) => {
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
    const [subCategories, setSubCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    // Use ref to track which category we've fetched to prevent duplicate calls
    const fetchedCategoryIdRef = useRef(null);
    const isFetchingRef = useRef(false);
    // Ref to store form reset function
    const formResetRef = useRef(null);

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
    // Store previous subcategories data to detect changes
    const prevSubCategoriesRef = useRef(null);

    useEffect(() => {
      const loadSubCategories = async () => {
        const categoryId = parentRecord?.id;

        // Validation: Only process if we have a valid category ID
        if (!categoryId) {
          console.warn("No category ID provided to SubCategoryListing");
          return;
        }

        // Get current subcategories items
        const currentItems = parentRecord?.subCategories?.items || [];
        // Create a stringified version to detect changes
        const currentItemsKey = JSON.stringify(currentItems.map(item => ({ id: item.id, name: item.name })));
        const prevItemsKey = prevSubCategoriesRef.current;

        // Performance: Only process if:
        // 1. We have a category ID
        // 2. We haven't processed this category yet OR subcategories data changed
        // 3. We're not currently processing (prevents concurrent operations)
        const shouldRefresh = fetchedCategoryIdRef.current === null || 
                              fetchedCategoryIdRef.current !== categoryId ||
                              currentItemsKey !== prevItemsKey;
        
        if (shouldRefresh && !isFetchingRef.current) {
          isFetchingRef.current = true;
          setLoading(true);

          try {
            // Extract and transform subcategories from parentRecord
            const items = currentItems;

            // Transform to component format
            const transformedData = items.map((item) => ({
              id: item.id,
              c_name: item.name,
              createDate: item.createdAt
                ? new Date(parseInt(item.createdAt) * 1000).toLocaleDateString()
                : "N/A",
              createdBy: "Admin",
              parentId: item.categoryId,
              categoryId: item.categoryId,
            }));

            setSubCategories(transformedData);

            // Mark this category as processed and store current items key
            fetchedCategoryIdRef.current = categoryId;
            prevSubCategoriesRef.current = currentItemsKey;
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
    }, [parentRecord?.id, parentRecord?.subCategories]); // Depend on both id and subCategories to refresh when data changes

    // Separate delete handler for sub-categories
    const handleDeleteSubCategoryClick = useCallback((record) => {
      setSubCategoryToDelete(record);
      setIsDeleteModalOpen(true);
    }, []);

    /**
     * Handle confirm delete subcategory action
     *
     * Deletes the subcategory and refreshes the list.
     * Handles loading state and errors properly.
     *
     * Error handling: Shows error message if delete or reload fails.
     */
    /**
     * Handle delete subcategory - SIMPLIFIED VERSION
     * Calls API service directly
     */
    const handleConfirmDeleteSubCategory = useCallback(async () => {
      if (!subCategoryToDelete) {
        message.warning("No subcategory selected");
        return;
      }

      setLoading(true);

      try {
        const categoryId =
          subCategoryToDelete.categoryId ||
          subCategoryToDelete.parentId ||
          parentRecord.id;

        if (!categoryId) {
          message.error("Category ID is required");
          return;
        }

        console.log("🗑️ Deleting subcategory:", {
          categoryId,
          subCategoryId: subCategoryToDelete.id,
        });

        // Direct API call - Delete subcategory
        await categoryService.deleteSubCategory(
          categoryId,
          subCategoryToDelete.id
        );

        message.success("Subcategory deleted successfully");

        // Refresh data
        if (onRefresh) {
          await onRefresh();
        }

        // Reset local state
        fetchedCategoryIdRef.current = null;

        // Close modal
        setIsDeleteModalOpen(false);
        setSubCategoryToDelete(null);
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        message.error(error.message || "Failed to delete subcategory");
      } finally {
        setLoading(false);
      }
    }, [subCategoryToDelete, parentRecord.id, onRefresh]);

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
    /**
     * Handle modal form submission - SUPER SIMPLE VERSION
     * Uses dedicated API functions
     */
    const handleModalSubmit = useCallback(
      async (formData) => {
        console.log("📝 Form submitted:", formData);

        setLoading(true);

        try {
          if (isEditMode && selectedCategory) {
            // ============ EDIT MODE ============
            const categoryId =
              formData.categoryId ||
              selectedCategory.categoryId ||
              selectedCategory.parentId ||
              parentRecord.id;

            console.log("✏️ Updating subcategory...");

            // Update subcategory with payload format: { "categoryId": 0, "subcategoryName": "string" }
            await categoryService.updateSubCategory(
              categoryId,
              selectedCategory.id,
              {
                categoryId: parseInt(categoryId, 10),
                subcategoryName: formData.subCategoryName,
              }
            );

            message.success("Subcategory updated!");

            // Call onRefresh to fetch all categories after update
            if (onRefresh) {
              console.log("🔄 Calling onRefresh to fetch all categories after update...");
              await onRefresh();
            }
          } else {
            // ============ CREATE MODE ============
            const categoryId = formData.categoryId || parentRecord.id;
            const subcategoryName = formData.subCategoryName;

            // Simple validation
            if (!categoryId || !subcategoryName) {
              message.error("Please fill all required fields");
              return;
            }

            // Call the simple create function
            await categoryService.createNewSubCategory(
              categoryId,
              subcategoryName
            );

            message.success("Subcategory created!");

            // Call onRefresh to fetch all categories after create
            if (onRefresh) {
              await onRefresh();
            }
          }

          // Reset refs to force refresh when parentRecord updates
          fetchedCategoryIdRef.current = null;
          prevSubCategoriesRef.current = null;
          
          // Close modal
          closeModal();
        } catch (error) {
          console.error("❌ Error creating/updating subcategory:", error);
          const errorMessage =
            error?.message ||
            error?.error ||
            (typeof error === "string" ? error : "Failed to save subcategory");
          message.error(errorMessage);
        } finally {
          setLoading(false);
        }
      },
      [isEditMode, selectedCategory, parentRecord.id, closeModal, onRefresh]
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
          render: (text) => (
            <span className="C-heading size-6 mb-0">{text}</span>
          ),
        },
        {
          title: "Created By",
          dataIndex: "createdBy",
          key: "createdBy",
          width: "30%",
          render: (text) => (
            <span className="C-heading size-6 mb-0">{text}</span>
          ),
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
              trigger={["hover", "click"]}
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
              {isEditMode ? "Edit Sub Category" : "Add Sub Category"}
            </span>
          }
          closable={{ "aria-label": "Custom Close Button" }}
          open={isModalOpen}
          width={600}
          centered
          footer={null}
          onCancel={() => {
            // Reset form to original values before closing
            if (formResetRef.current) {
              formResetRef.current();
            }
            closeModal();
          }}
        >
          <CreateSubCategoryForm
            selectedSubCategory={selectedCategory}
            categories={[]} // Will be provided by parent if needed
            defaultCategoryId={parentRecord.id}
            onCancel={() => {
              // Reset form is handled inside CreateSubCategoryForm's handleCancel
              closeModal();
            }}
            onSubmit={handleModalSubmit}
            loading={loading}
            onFormReset={(resetFn) => {
              formResetRef.current = resetFn;
            }}
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
  }
);

SubCategoryListing.displayName = "SubCategoryListing";

SubCategoryListing.propTypes = {
  parentRecord: PropTypes.object.isRequired,
  onDeleteSubCategory: PropTypes.func,
  onEditSubCategory: PropTypes.func,
  onRefresh: PropTypes.func, // Callback to refresh parent data
};

export default SubCategoryListing;
