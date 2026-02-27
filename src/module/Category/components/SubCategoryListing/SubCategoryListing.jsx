import Icon from "@/components/Icon";
import { Dropdown, Table, Modal, Space, message, Button } from "antd";
import CreateSubCategoryForm from "../CreateSubCategoryForm";
import {
  ACTION_MENU_ITEMS,
  MODAL_MODES,
} from "../../constants/categoryConstants";
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
 * SubCategoryListing Component
 *
 * Displays subcategories for a parent category in an expandable table row.
 * Handles CRUD operations for subcategories with proper loading and error states.
 *
 * API Integration:
 * - Fetches subcategories from separate API endpoint: GET /subcategories?categoryId={id}&page={page}&limit={limit}
 * - Only makes API call when row is expanded (lazy loading for better performance)
 * - Supports pagination with page and limit parameters
 *
 * Performance Optimizations:
 * - Uses refs (fetchedCategoryIdRef, fetchedPaginationRef) to prevent duplicate API calls
 * - Uses isFetchingRef to prevent concurrent API calls
 * - Only fetches when category ID changes (new row expanded)
 * - Only fetches when pagination actually changes (page or pageSize)
 * - Memoized columns configuration to prevent unnecessary re-renders
 * - Component is wrapped in React.memo to prevent re-renders when props haven't changed
 *
 * Error Handling:
 * - Shows error messages via Ant Design message component
 * - Handles loading states properly
 * - Resets refs on error to allow retry
 * - Gracefully handles API failures
 *
 * @param {Object} props - Component props
 * @param {Object} props.parentRecord - Parent category record
 * @param {number} props.parentRecord.id - Parent category ID
 * @param {string} props.parentRecord.c_name - Parent category name
 * @param {Function} props.onDeleteSubCategory - Handler for subcategory deletion (optional)
 * @param {Function} props.onEditSubCategory - Handler for subcategory edit (optional)
 * @param {Function} props.onRefresh - Callback to refresh parent categories list (optional)
 */
const SubCategoryListing = memo(
  ({ parentRecord, onDeleteSubCategory, onEditSubCategory, onRefresh, permissions = {} }) => {
    const canEditSubCategory = Boolean(permissions.edit_sub_category);
    const canDeleteSubCategory = Boolean(permissions.delete_sub_category);

    const getActionMenuItems = useCallback(() => {
      const permMap = { edit: canEditSubCategory, delete: canDeleteSubCategory };
      return ACTION_MENU_ITEMS.filter((item) => permMap[item.key]).map((item) => ({
        ...item,
        label: (
          <Space align="center">
            <Icon name={item.key} size="small" />
            <span className="C-heading size-xs mb-0">{item.label}</span>
          </Space>
        ),
      }));
    }, [canEditSubCategory, canDeleteSubCategory]);

    // Subcategory pagination state
    const [subPagination, setSubPagination] = useState({
      current: 1,
      pageSize: 5,
      total: 0,
    });
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
    // Performance optimization: Refs to prevent duplicate API calls
    // Track which category and pagination we've already fetched
    const fetchedCategoryIdRef = useRef(null);
    const fetchedPaginationRef = useRef({ page: null, pageSize: null });
    const isFetchingRef = useRef(false); // Prevent concurrent API calls
    // Ref to store form reset function
    const formResetRef = useRef(null);

    /**
     * Fetch subcategories from API with pagination
     *
     * Performance optimizations:
     * - Uses refs to prevent duplicate API calls for the same category + pagination
     * - Prevents concurrent calls using isFetchingRef
     * - Only makes API call if category or pagination has changed
     *
     * API Endpoint: GET /subcategories?categoryId={categoryId}&page={page}&limit={pageSize}
     *
     * @param {number} categoryId - ID of the parent category
     * @param {number} page - Page number (default: 1)
     * @param {number} pageSize - Items per page (default: 5)
     * @returns {Promise<void>}
     */
    const fetchSubCategories = useCallback(
      async (categoryId, page = 1, pageSize = 5) => {
        if (!categoryId) {
          console.warn("No category ID provided to fetchSubCategories");
          return;
        }

        // Performance: Prevent duplicate API calls for the same category + pagination
        const paginationKey = `${categoryId}-${page}-${pageSize}`;
        if (
          fetchedCategoryIdRef.current === categoryId &&
          fetchedPaginationRef.current.page === page &&
          fetchedPaginationRef.current.pageSize === pageSize &&
          !isFetchingRef.current
        ) {
          console.log("⏸️ Subcategories already fetched for this category and pagination, skipping");
          return;
        }

        // Performance: Prevent concurrent API calls
        if (isFetchingRef.current) {
          console.log("⏸️ Subcategories fetch already in progress, skipping duplicate call");
          return;
        }

        isFetchingRef.current = true;
        setLoading(true);
        try {
          console.log("🟢 Fetching subcategories:", {
            categoryId,
            page,
            pageSize,
          });

          const response = await categoryService.getSubCategories(categoryId, {
            page,
            limit: pageSize,
          });

          if (response.success && response.data) {
            const items = response.data.items || [];

            // Format timestamp to DD/MM/YYYY
            const formatDate = (timestamp) => {
              if (!timestamp) return "N/A";
              try {
                const ts =
                  typeof timestamp === "string"
                    ? parseInt(timestamp, 10)
                    : timestamp;

                if (isNaN(ts)) {
                  return "N/A";
                }

                const timestampLength = ts.toString().length;
                let date;

                if (timestampLength === 10) {
                  date = new Date(ts * 1000);
                } else if (timestampLength === 13) {
                  date = new Date(ts);
                } else {
                  const year2000 = 946684800000;
                  if (ts > year2000) {
                    date = new Date(ts);
                  } else {
                    date = new Date(ts * 1000);
                  }
                }

                if (isNaN(date.getTime())) return "N/A";

                const day = String(date.getUTCDate()).padStart(2, "0");
                const month = String(date.getUTCMonth() + 1).padStart(2, "0");
                const year = date.getUTCFullYear();
                return `${day}/${month}/${year}`;
              } catch (error) {
                return "N/A";
              }
            };

            // Transform to component format
            const transformedData = items.map((item) => ({
              id: item.id,
              c_name: item.name,
              createDate: formatDate(item.createdAt),
              createdBy: "Admin",
              parentId: item.categoryId,
              categoryId: item.categoryId,
            }));

            setSubCategories(transformedData);

            // Update pagination from API response
            setSubPagination({
              current: response.data.page || page,
              pageSize: response.data.limit || pageSize,
              total: response.data.total || 0,
            });

            // Performance: Mark this category + pagination as fetched to prevent duplicate calls
            fetchedCategoryIdRef.current = categoryId;
            fetchedPaginationRef.current = { page, pageSize };

            console.log("✅ Subcategories fetched:", {
              count: transformedData.length,
              total: response.data.total || 0,
              page: response.data.page || page,
            });
          } else {
            console.warn("Invalid API response structure:", response);
            setSubCategories([]);
            setSubPagination({
              current: 1,
              pageSize: 5,
              total: 0,
            });
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
          message.error(
            error.message || "Failed to load subcategories. Please try again."
          );
          setSubCategories([]);
          setSubPagination({
            current: 1,
            pageSize: 5,
            total: 0,
          });
          // Reset refs on error to allow retry
          fetchedCategoryIdRef.current = null;
          fetchedPaginationRef.current = { page: null, pageSize: null };
        } finally {
          setLoading(false);
          isFetchingRef.current = false;
        }
      },
      [] // Empty deps - function is stable and doesn't depend on props/state
    );

    /**
     * Load subcategories when component mounts or parent record changes
     *
     * Performance optimizations:
     * - Only fetches when category ID changes (when row is expanded for a new category)
     * - Resets pagination to page 1 when switching categories
     * - Uses refs to prevent duplicate fetches
     *
     * Fetches subcategories from separate API endpoint: GET /subcategories?categoryId={id}&page=1&limit=5
     */
    useEffect(() => {
      const categoryId = parentRecord?.id;

      if (!categoryId) {
        console.warn("No category ID provided to SubCategoryListing");
        return;
      }

      // Performance: Only fetch if category changed (new row expanded)
      // Reset pagination when category changes
      if (fetchedCategoryIdRef.current !== categoryId) {
        setSubPagination({
          current: 1,
          pageSize: 5,
          total: 0,
        });
        // Reset pagination ref to allow fetch for new category
        fetchedPaginationRef.current = { page: null, pageSize: null };
      }

      // Fetch subcategories from API (only if category changed)
      // fetchSubCategories has its own duplicate prevention logic
      fetchSubCategories(categoryId, subPagination.current, subPagination.pageSize);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parentRecord?.id]); // Only depend on category ID - fetch on expand

    // Separate delete handler for sub-categories
    const handleDeleteSubCategoryClick = useCallback((record) => {
      setSubCategoryToDelete(record);
      setIsDeleteModalOpen(true);
    }, []);

    /**
     * Handle confirm delete subcategory action
     *
     * Deletes the subcategory via API and refreshes both subcategories list and main categories list.
     * 
     * Performance optimizations:
     * - Resets refs after delete to force fresh fetch
     * - Handles pagination edge case: if deleting last item on page, goes to previous page
     * - Refreshes main categories list to update subcategory count
     *
     * API Endpoint: DELETE /categories/{categoryId}/subcategories/{subCategoryId}
     *
     * Error handling:
     * - Shows error message if delete fails
     * - Keeps modal open on error so user can retry
     * - Closes modal only on success
     *
     * @returns {Promise<void>}
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

        // Performance: Reset refs to force fresh fetch after delete
        fetchedCategoryIdRef.current = null;
        fetchedPaginationRef.current = { page: null, pageSize: null };

        // Refresh main categories list first to update subcategory count
        // This ensures the count is accurate before refreshing subcategories
        if (onRefresh) {
          await onRefresh();
        }

        // Refresh subcategories after delete
        // If current page becomes empty after delete (was last item on page), go to previous page
        const currentItemCount = subCategories.length;
        const newPage = subPagination.current > 1 && currentItemCount === 1
          ? subPagination.current - 1
          : subPagination.current;

        // Update pagination state before fetching
        if (newPage !== subPagination.current) {
          setSubPagination((prev) => ({
            ...prev,
            current: newPage,
          }));
        }

        await fetchSubCategories(
          parentRecord.id,
          newPage,
          subPagination.pageSize
        );

        // Close modal
        setIsDeleteModalOpen(false);
        setSubCategoryToDelete(null);
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        message.error(error.message || "Failed to delete subcategory");
      } finally {
        setLoading(false);
      }
    }, [subCategoryToDelete, parentRecord.id, fetchSubCategories, subPagination.current, subPagination.pageSize, subCategories.length, onRefresh]);

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
     * Makes the API call to create or update subcategory, then refreshes both lists.
     *
     * Performance optimizations:
     * - Resets refs after create/update to force fresh fetch
     * - Refreshes main categories list to update subcategory count
     * - Maintains current pagination after operations
     *
     * API Endpoints:
     * - PUT /subcategories/{id} for edit
     *   Payload: { "categoryId": number, "subcategoryName": "string" }
     * - POST /categories/{categoryId}/subcategories for create
     *   Payload: { "categoryId": number, "subcategoryName": "string" }
     *
     * Error handling:
     * - Shows error message if operation fails
     * - Keeps modal open on error so user can retry
     * - Closes modal only on success
     *
     * @param {Object} formData - Form data from CreateSubCategoryForm component
     * @param {number} formData.categoryId - ID of the parent category
     * @param {string} formData.subCategoryName - Name of the subcategory
     * @returns {Promise<void>}
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

            // Performance: Reset refs to force fresh fetch after update
            fetchedCategoryIdRef.current = null;
            fetchedPaginationRef.current = { page: null, pageSize: null };

            // Refresh subcategories after update
            await fetchSubCategories(
              parentRecord.id,
              subPagination.current,
              subPagination.pageSize
            );

            // Refresh main categories list to update subcategory count (if needed)
            if (onRefresh) {
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

            // Performance: Reset refs to force fresh fetch after create
            fetchedCategoryIdRef.current = null;
            fetchedPaginationRef.current = { page: null, pageSize: null };

            // Refresh subcategories after create
            // After create, we might want to go to the last page to see the new item
            // But for now, stay on current page
            await fetchSubCategories(
              parentRecord.id,
              subPagination.current,
              subPagination.pageSize
            );

            // Refresh main categories list to update subcategory count
            if (onRefresh) {
              await onRefresh();
            }
          }

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
      [isEditMode, selectedCategory, parentRecord.id, closeModal, fetchSubCategories, subPagination.current, subPagination.pageSize]
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
          render: (_, record) => {
            const items = getActionMenuItems();
            if (items.length === 0) return null;
            return (
              <Dropdown
                menu={{
                  items,
                  onClick: (menuInfo) =>
                    handleSubCategoryMenuClick(menuInfo, record),
                }}
                trigger={["hover", "click"]}
              >
                <button className="C-settingButton is-clean small">
                  <Icon name="more_vert" />
                </button>
              </Dropdown>
            );
          },
        },
      ],
      [handleSubCategoryMenuClick, getActionMenuItems]
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
            pagination={{
              current: subPagination.current,
              pageSize: subPagination.pageSize,
              total: subPagination.total,
              pageSizeOptions: ["5", "10", "20", "50", "100"],
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} subcategories`,
            }}
            onChange={(newPagination) => {
              const { current, pageSize } = newPagination;
              console.log("🔄 Subcategory pagination changed:", {
                current,
                pageSize,
                currentTotal: subPagination.total,
              });
              
              // Performance: Only fetch if pagination actually changed
              if (
                current === subPagination.current &&
                pageSize === subPagination.pageSize
              ) {
                console.log("⏸️ Pagination unchanged, skipping API call");
                return;
              }
              
              // Update local state immediately for better UX
              setSubPagination((prev) => ({
                current: current || 1,
                pageSize: pageSize || 5,
                total: prev.total, // Keep total until API response updates it
              }));
              
              // Fetch with new pagination
              // fetchSubCategories has duplicate prevention, but we check here too for better UX
              fetchSubCategories(parentRecord.id, current || 1, pageSize || 5);
            }}
            size="small"
          />
        </div>

        <Modal
          title={
            <span className="C-heading size-5 mb-0 bold">
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
            <div className="d-flex align-items-center">
              <Icon name="delete" className="me-2" style={{ color: "#ff4d4f" }} />
              <span className="C-heading size-5 semiBold mb-0">
                Delete Sub-Category: {subCategoryToDelete?.c_name || ""}
              </span>
            </div>
          }
          open={isDeleteModalOpen}
          onCancel={handleCancelDeleteSubCategory}
          footer={
            <div className="d-flex justify-content-end gap-2">
              <Button 
                onClick={handleCancelDeleteSubCategory} 
                className="C-button is-bordered small"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                danger
                onClick={handleConfirmDeleteSubCategory}
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
            Are you sure you want to delete this sub-category? This action cannot be undone.
          </p>
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
  onRefresh: PropTypes.func,
  permissions: PropTypes.object,
};

export default SubCategoryListing;
