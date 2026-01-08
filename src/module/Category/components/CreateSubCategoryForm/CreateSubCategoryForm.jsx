import { Form, Input, Select, Space, Spin } from "antd";
import React, { useEffect } from "react";
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
              onClick={onCancel}
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
