import { Form, Input, Select, Space } from "antd";
import React, { useCallback, useEffect, useMemo } from "react";

const CreateCategory = ({
  selectedCategory,
  modalMode,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  // Mock categories data - replace with your actual data source
  const categories = [
    { value: 1, label: "Technology" },
    { value: 2, label: "Business" },
    { value: 3, label: "Education" },
    { value: 4, label: "Health" },
  ];

  useEffect(() => {
    if (selectedCategory) {
      if (modalMode === "sub_category") {
        form.setFieldsValue({
          categoryId: selectedCategory.categoryId || selectedCategory.parentId,
          subCategoryName: selectedCategory.c_name,
        });
      } else {
        form.setFieldsValue({
          categoryName: selectedCategory.c_name,
        });
      }
    } else {
      form.resetFields();
    }
  }, [selectedCategory, modalMode, form]);

  const initialValues = useMemo(() => {
    if (modalMode === "sub_category") {
      return {
        categoryId:
          selectedCategory?.categoryId ||
          selectedCategory?.parentId ||
          undefined,
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
      <span className="C-heading size-xs semiBold mb-0">Sub Category Name</span>
    ),
    []
  );

  const categorySelectLabel = useMemo(
    () => (
      <span className="C-heading size-xs semiBold mb-0">Select Category</span>
    ),
    []
  );

  // Handle form submission
  const handleFormSubmit = useCallback(
    (values) => {
      console.log({ values, modalMode });
      onSubmit(values);
      form.resetFields();
    },
    [modalMode, onSubmit, form]
  );

  return (
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
          <Form.Item
            name="categoryId"
            label={categorySelectLabel}
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select
              placeholder="Select Category"
              size="large"
              options={categories}
            />
          </Form.Item>
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
          rules={[{ required: true, message: "Please enter category name" }]}
        >
          <Input placeholder="Enter Category Name" size="large" />
        </Form.Item>
      )}

      <div className="text-right">
        <Space>
          <button
            className="C-button is-bordered"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button className="C-button is-filled" type="submit">
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
  );
};

export default CreateCategory;
