import { Form, Input, Space, Spin } from "antd";
import React, { useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Simple Category Form
 * Only for creating/editing main categories
 */
const CreateCategoryForm = ({
  selectedCategory,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedCategory) {
      // Edit mode - populate form
      form.setFieldsValue({
        categoryName: selectedCategory.c_name || selectedCategory.name,
      });
    } else {
      // Create mode - reset form
      form.resetFields();
    }
  }, [selectedCategory, form]);

  const handleSubmit = (values) => {
    console.log("📝 Category form submitted:", values);
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
        <Form.Item
          name="categoryName"
          label={
            <span className="C-heading size-xs semiBold mb-0">
              Category Name
            </span>
          }
          rules={[{ required: true, message: "Please enter category name" }]}
        >
          <Input placeholder="Enter Category Name" size="large" />
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
              {selectedCategory ? "Update Category" : "Create Category"}
            </button>
          </Space>
        </div>
      </Form>
    </Spin>
  );
};

CreateCategoryForm.propTypes = {
  selectedCategory: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default CreateCategoryForm;
