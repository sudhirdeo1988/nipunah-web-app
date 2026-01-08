import { Form, Input, Select, Space, Spin } from "antd";
import React, { useCallback, useEffect, useMemo, memo } from "react";
import PropTypes from "prop-types";

/**
 * CreateCategory Component
 *
 * A reusable form component for creating and editing categories and subcategories.
 * Handles both main categories and subcategories with appropriate form fields.
 *
 * Features:
 * - Dynamic form fields based on modal mode (category vs subcategory)
 * - Pre-populates form when editing existing items
 * - Loading state with spinner during API operations
 * - Form validation with required field checks
 * - Disabled buttons during submission to prevent double-submission
 *
 * @param {Object} props - Component props
 * @param {Object|null} props.selectedCategory - Category/subcategory being edited (null for create)
 * @param {string} props.modalMode - Mode: "category" or "sub_category"
 * @param {Function} props.onCancel - Handler for cancel button click
 * @param {Function} props.onSubmit - Handler for form submission
 * @param {Array} props.categories - List of categories for subcategory parent selection
 * @param {boolean} props.loading - Loading state (shows spinner and disables buttons)
 */
/**
 * CreateCategory Component (Memoized)
 *
 * Performance: Wrapped in React.memo to prevent unnecessary re-renders.
 * Only re-renders when props actually change.
 */
const CreateCategory = memo(
  ({
    selectedCategory,
    modalMode,
    onCancel,
    onSubmit,
    categories = [],
    loading = false,
  }) => {
    const [form] = Form.useForm();

    /**
     * Update form fields when selectedCategory or modalMode changes
     *
     * Pre-populates form fields when editing an existing category/subcategory.
     * Resets form when creating a new item.
     */
    useEffect(() => {
      if (selectedCategory) {
        // Editing mode: Pre-populate form with existing data
        if (modalMode === "sub_category") {
          // Normalize categoryId to match option value type
          const rawCategoryId = selectedCategory.categoryId || selectedCategory.parentId;
          const categoryId = rawCategoryId != null ? Number(rawCategoryId) : undefined;
          
          // Set form values - categoryId will be set when categories are available
          // The normalize function in Form.Item will ensure type matching
          form.setFieldsValue({
            categoryId,
            subCategoryName: selectedCategory.c_name,
          });
        } else {
          // Main category edit mode
          form.setFieldsValue({
            categoryName: selectedCategory.c_name,
          });
        }
      } else {
        // Create mode: Reset form to empty state
        form.resetFields();
      }
    }, [selectedCategory, modalMode, form]);
    
    // Update categoryId when categories are loaded to ensure Select can find the option
    useEffect(() => {
      if (modalMode === "sub_category" && selectedCategory && categories.length > 0) {
        const rawCategoryId = selectedCategory.categoryId || selectedCategory.parentId;
        const categoryId = rawCategoryId != null ? Number(rawCategoryId) : undefined;
        
        if (categoryId != null) {
          // Verify the category exists in options
          const categoryExists = categories.some(cat => Number(cat.value) === categoryId);
          if (categoryExists) {
            // Update the form value to ensure Select displays the label
            form.setFieldValue('categoryId', categoryId);
          }
        }
      }
    }, [categories, modalMode, selectedCategory, form]);

    const initialValues = useMemo(() => {
      if (modalMode === "sub_category") {
        // Don't set categoryId in initialValues - set it in useEffect after categories load
        // This ensures the Select can find the matching option
        return {
          subCategoryName: selectedCategory?.c_name || "",
        };
      }
      return {
        categoryName: selectedCategory?.c_name || "",
      };
    }, [selectedCategory, modalMode]);

    const categoryNameLabel = useMemo(
      () => (
        <span className="C-heading size-xs semiBold mb-0">Category Name</span>
      ),
      []
    );

    const subCategoryNameLabel = useMemo(
      () => (
        <span className="C-heading size-xs semiBold mb-0">
          Sub Category Name
        </span>
      ),
      []
    );

    const categorySelectLabel = useMemo(
      () => (
        <span className="C-heading size-xs semiBold mb-0">Select Category</span>
      ),
      []
    );

    /**
     * Handle cancel button click
     *
     * Resets form to original values before closing modal.
     * This ensures that if user edits and cancels, changes are reverted.
     */
    const handleCancel = useCallback(() => {
      // Reset form to original selectedCategory values or empty state
      if (selectedCategory) {
        // Reset to original values from selectedCategory
        if (modalMode === "sub_category") {
          const rawCategoryId = selectedCategory.categoryId || selectedCategory.parentId;
          const categoryId = rawCategoryId != null ? Number(rawCategoryId) : undefined;
          form.setFieldsValue({
            categoryId,
            subCategoryName: selectedCategory.c_name,
          });
        } else {
          form.setFieldsValue({
            categoryName: selectedCategory.c_name,
          });
        }
      } else {
        // Reset to empty state for create mode
        form.resetFields();
      }
      // Call parent's onCancel handler
      onCancel();
    }, [selectedCategory, modalMode, form, onCancel]);

    /**
     * Handle form submission
     *
     * Validates and submits form data to parent component.
     * Resets form after submission for clean state.
     *
     * @param {Object} values - Form values from Ant Design Form
     */
    const handleFormSubmit = useCallback(
      (values) => {
        console.log({ values });
        // Log for debugging (remove in production if needed)
        console.log("📝 FORM: Form submission:", {
          values,
          modalMode,
          allKeys: Object.keys(values),
          subCategoryName: values.subCategoryName,
          categoryId: values.categoryId,
        });

        // Submit to parent component (handles API call)
        onSubmit(values);

        // Reset form after submission for clean state
        form.resetFields();
      },
      [modalMode, onSubmit, form]
    );

    return (
      <Spin spinning={loading} tip="Saving...">
        <Form
          layout="vertical"
          form={form}
          name="control-hooks"
          style={{ maxWidth: 600 }}
          className="py-3"
          initialValues={initialValues}
          onFinish={handleFormSubmit}
        >
          {modalMode === "sub_category" ? (
            <>
              {/* Show category dropdown only in create mode (when selectedCategory is null) */}
              {!selectedCategory ? (
                <Form.Item
                  name="categoryId"
                  label={categorySelectLabel}
                  rules={[
                    { required: true, message: "Please select a category" },
                  ]}
                  getValueFromEvent={(value) => {
                    // Ensure value is always a number
                    return value != null ? Number(value) : undefined;
                  }}
                  normalize={(value) => {
                    // Normalize the value to ensure it matches option values
                    return value != null ? Number(value) : undefined;
                  }}
                >
                  <Select
                    key={`category-select-${categories.length}`}
                    placeholder="Select Category"
                    size="large"
                    options={categories}
                    showSearch
                    optionFilterProp="label"
                    notFoundContent={categories.length === 0 ? "Loading categories..." : "No categories found"}
                  />
                </Form.Item>
              ) : (
                // Hide category dropdown in edit mode, but keep categoryId in form
                <Form.Item name="categoryId" hidden>
                  <Input type="hidden" />
                </Form.Item>
              )}
              <Form.Item
                name="subCategoryName"
                label={subCategoryNameLabel}
                rules={[
                  { required: true, message: "Please enter sub category name" },
                ]}
              >
                <Input placeholder="Enter Sub Category Name" size="large" />
              </Form.Item>
            </>
          ) : (
            <Form.Item
              name="categoryName"
              label={categoryNameLabel}
              rules={[
                { required: true, message: "Please enter category name" },
              ]}
            >
              <Input placeholder="Enter Category Name" size="large" />
            </Form.Item>
          )}

          <div className="text-right">
            <Space>
              <button
                className="C-button is-bordered"
                type="button"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="C-button is-filled"
                type="submit"
                disabled={loading}
              >
                {modalMode === "sub_category"
                  ? selectedCategory
                    ? "Update Sub Category"
                    : "Add Sub Category"
                  : selectedCategory
                  ? "Update Category"
                  : "Save"}
              </button>
            </Space>
          </div>
        </Form>
      </Spin>
    );
  }
);

CreateCategory.displayName = "CreateCategory";

CreateCategory.propTypes = {
  selectedCategory: PropTypes.object,
  modalMode: PropTypes.oneOf(["category", "sub_category"]).isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  categories: PropTypes.array,
  loading: PropTypes.bool,
};

export default CreateCategory;
