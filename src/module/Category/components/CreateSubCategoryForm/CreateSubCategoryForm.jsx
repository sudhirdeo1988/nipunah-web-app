import { Form, Input, Select, Space, Spin } from "antd";
import React, { useEffect, useCallback } from "react";
import PropTypes from "prop-types";

/**
 * Simple SubCategory Form
 * Only for creating/editing subcategories
 */
const CreateSubCategoryForm = ({
  selectedSubCategory,
  categories = [],
  defaultCategoryId,
  onCancel,
  onSubmit,
  loading = false,
  onFormReset,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedSubCategory) {
      // Edit mode - populate form
      form.setFieldsValue({
        categoryId:
          selectedSubCategory.categoryId || selectedSubCategory.parentId,
        subCategoryName: selectedSubCategory.c_name || selectedSubCategory.name,
      });
    } else {
      // Create mode - set default category if provided
      form.setFieldsValue({
        categoryId: defaultCategoryId,
        subCategoryName: "",
      });
    }
  }, [selectedSubCategory, defaultCategoryId, form]);

  const handleSubmit = (values) => {
    console.log("📝 SubCategory form submitted:", values);
    onSubmit(values);
    form.resetFields();
  };

  /**
   * Reset form to original values
   * This function can be called from parent component
   */
  const resetForm = useCallback(() => {
    if (selectedSubCategory) {
      // Reset to original values from selectedSubCategory
      form.setFieldsValue({
        categoryId:
          selectedSubCategory.categoryId || selectedSubCategory.parentId,
        subCategoryName: selectedSubCategory.c_name || selectedSubCategory.name,
      });
    } else {
      // Reset to empty state for create mode
      form.resetFields();
    }
  }, [selectedSubCategory, form]);

  /**
   * Handle cancel button click
   *
   * Resets form to original values before closing modal.
   * This ensures that if user edits and cancels, changes are reverted.
   */
  const handleCancel = useCallback(() => {
    // Reset form to original values
    resetForm();
    // Call parent's onCancel handler
    onCancel();
  }, [resetForm, onCancel]);

  // Expose reset function to parent via callback
  useEffect(() => {
    if (onFormReset) {
      onFormReset(resetForm);
    }
  }, [onFormReset, resetForm]);

  return (
    <Spin spinning={loading} tip="Saving...">
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        className="py-3"
      >
        {/* Show category dropdown only in create mode (when selectedSubCategory is null) */}
        {!selectedSubCategory ? (
          <Form.Item
            name="categoryId"
            label={
              <span className="C-heading size-xs semiBold mb-0">
                Select Category
              </span>
            }
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select
              placeholder="Select Category"
              size="large"
              options={categories}
              showSearch
              optionFilterProp="label"
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
          label={
            <span className="C-heading size-xs semiBold mb-0">
              Sub Category Name
            </span>
          }
          rules={[
            { required: true, message: "Please enter sub category name" },
          ]}
        >
          <Input placeholder="Enter Sub Category Name" size="large" />
        </Form.Item>

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
              {selectedSubCategory ? "Update Sub Category" : "Add Sub Category"}
            </button>
          </Space>
        </div>
      </Form>
    </Spin>
  );
};

CreateSubCategoryForm.propTypes = {
  selectedSubCategory: PropTypes.object,
  categories: PropTypes.array,
  defaultCategoryId: PropTypes.number,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default CreateSubCategoryForm;
