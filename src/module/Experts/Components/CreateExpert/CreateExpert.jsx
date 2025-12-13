import { Form, Input, Space, Spin } from "antd";
import React, { useCallback, useEffect, useMemo, memo } from "react";
import PropTypes from "prop-types";

/**
 * CreateExpert Component
 *
 * A reusable form component for creating and editing experts.
 * Handles expert form fields including name, email, contact, and country.
 *
 * Features:
 * - Pre-populates form when editing existing experts
 * - Loading state with spinner during API operations
 * - Form validation with required field checks
 * - Disabled buttons during submission to prevent double-submission
 *
 * @param {Object} props - Component props
 * @param {Object|null} props.selectedExpert - Expert being edited (null for create)
 * @param {string} props.modalMode - Mode: "expert"
 * @param {Function} props.onCancel - Handler for cancel button click
 * @param {Function} props.onSubmit - Handler for form submission
 * @param {boolean} props.loading - Loading state (shows spinner and disables buttons)
 */
/**
 * CreateExpert Component (Memoized)
 *
 * Performance: Wrapped in React.memo to prevent unnecessary re-renders.
 * Only re-renders when props actually change.
 */
const CreateExpert = memo(
  ({ selectedExpert, modalMode, onCancel, onSubmit, loading = false }) => {
    const [form] = Form.useForm();

    /**
     * Update form fields when selectedExpert or modalMode changes
     *
     * Pre-populates form fields when editing an existing expert.
     * Resets form when creating a new expert.
     */
    useEffect(() => {
      if (selectedExpert) {
        // Editing mode: Pre-populate form with existing data
        form.setFieldsValue({
          name: selectedExpert.userName,
          email: selectedExpert.email,
          contact: selectedExpert.contact,
          country: selectedExpert.country,
        });
      } else {
        // Create mode: Reset form to empty state
        form.resetFields();
      }
    }, [selectedExpert, modalMode, form]);

    const initialValues = useMemo(() => {
      return {
        name: selectedExpert?.userName || "",
        email: selectedExpert?.email || "",
        contact: selectedExpert?.contact || "",
        country: selectedExpert?.country || "",
      };
    }, [selectedExpert]);

    const nameLabel = useMemo(
      () => (
        <span className="C-heading size-xs semiBold mb-0">Expert Name</span>
      ),
      []
    );

    const emailLabel = useMemo(
      () => <span className="C-heading size-xs semiBold mb-0">Email</span>,
      []
    );

    const contactLabel = useMemo(
      () => <span className="C-heading size-xs semiBold mb-0">Contact</span>,
      []
    );

    const countryLabel = useMemo(
      () => <span className="C-heading size-xs semiBold mb-0">Country</span>,
      []
    );

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
        // Log for debugging (remove in production if needed)
        console.log("Form submission:", { values, modalMode });

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
          <Form.Item
            name="name"
            label={nameLabel}
            rules={[{ required: true, message: "Please enter expert name" }]}
          >
            <Input placeholder="Enter Expert Name" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label={emailLabel}
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              placeholder="Enter Email"
              size="large"
              type="email"
              disabled={!!selectedExpert}
            />
          </Form.Item>

          <Form.Item
            name="contact"
            label={contactLabel}
            rules={[{ required: true, message: "Please enter contact number" }]}
          >
            <Input placeholder="Enter Contact Number" size="large" />
          </Form.Item>

          <Form.Item
            name="country"
            label={countryLabel}
            rules={[{ required: true, message: "Please enter country" }]}
          >
            <Input placeholder="Enter Country" size="large" />
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
                {selectedExpert ? "Update Expert" : "Save"}
              </button>
            </Space>
          </div>
        </Form>
      </Spin>
    );
  }
);

CreateExpert.displayName = "CreateExpert";

CreateExpert.propTypes = {
  selectedExpert: PropTypes.object,
  modalMode: PropTypes.oneOf(["expert"]).isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default CreateExpert;

