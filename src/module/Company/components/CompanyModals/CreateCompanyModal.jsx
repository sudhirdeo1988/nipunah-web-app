"use client";

import React, { memo, useCallback, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Row,
  Col,
  Card,
  Button,
  message,
} from "antd";
import countryDetails from "@/utilities/CountryDetails.json";

/**
 * CreateCompanyModal Component
 *
 * Displays a comprehensive form for creating new companies
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onCancel - Handler for modal cancel
 * @param {Function} props.onSubmit - Handler for form submission
 * @returns {JSX.Element} The CreateCompanyModal component
 */
const CreateCompanyModal = memo(({ isOpen, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error("Form validation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, onSubmit]);

  /**
   * Handles modal cancel
   */
  const handleCancel = useCallback(() => {
    form.resetFields();
    onCancel();
  }, [form, onCancel]);

  return (
    <Modal
      title={
        <span className="C-heaidng size-5 mb-0 bold">Create New Company</span>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={[
        <Button
          key="cancel"
          onClick={handleCancel}
          className="C-button is-bordered"
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          className="C-button is-filled"
        >
          Create Company
        </Button>,
      ]}
      width={1000}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          subscriptionPlan: "free",
          isMnc: false,
          employeeCount: 1,
          turnOver: 0,
        }}
      >
        <Row gutter={16}>
          {/* Basic Information */}
          <Col span={24}>
            <Card title="Basic Information" size="small" className="mb-3">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Company Name"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter company name",
                      },
                      {
                        min: 2,
                        message: "Company name must be at least 2 characters",
                      },
                    ]}
                  >
                    <Input placeholder="Enter company name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Short Name"
                    name="shortName"
                    rules={[
                      { required: true, message: "Please enter short name" },
                      {
                        min: 2,
                        message: "Short name must be at least 2 characters",
                      },
                    ]}
                  >
                    <Input placeholder="Enter short name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Industry"
                    name="industry"
                    rules={[
                      { required: true, message: "Please select industry" },
                    ]}
                  >
                    <Select placeholder="Select industry">
                      <Select.Option value="Technology">
                        Technology
                      </Select.Option>
                      <Select.Option value="Logistics">Logistics</Select.Option>
                      <Select.Option value="Manufacturing">
                        Manufacturing
                      </Select.Option>
                      <Select.Option value="Healthcare">
                        Healthcare
                      </Select.Option>
                      <Select.Option value="Finance">Finance</Select.Option>
                      <Select.Option value="Education">Education</Select.Option>
                      <Select.Option value="Retail">Retail</Select.Option>
                      <Select.Option value="Other">Other</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Founded Year"
                    name="foundYear"
                    rules={[
                      {
                        required: true,
                        message: "Please enter founded year",
                      },
                      {
                        pattern: /^(19|20)\d{2}$/,
                        message: "Please enter a valid year",
                      },
                    ]}
                  >
                    <Input placeholder="e.g., 2020" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Employee Count"
                    name="employeeCount"
                    rules={[
                      {
                        required: true,
                        message: "Please enter employee count",
                      },
                      {
                        type: "number",
                        min: 1,
                        message: "Employee count must be at least 1",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="Enter employee count"
                      style={{ width: "100%" }}
                      min={1}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Annual Turnover ($)"
                    name="turnOver"
                    rules={[
                      {
                        required: true,
                        message: "Please enter annual turnover",
                      },
                      {
                        type: "number",
                        min: 0,
                        message: "Turnover must be a positive number",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="Enter annual turnover"
                      style={{ width: "100%" }}
                      min={0}
                      formatter={(value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Subscription Plan"
                    name="subscriptionPlan"
                    rules={[
                      {
                        required: true,
                        message: "Please select subscription plan",
                      },
                    ]}
                  >
                    <Select placeholder="Select subscription plan">
                      <Select.Option value="free">Free</Select.Option>
                      <Select.Option value="basic">Basic</Select.Option>
                      <Select.Option value="premium">Premium</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Is MNC (Multinational Corporation)"
                    name="isMnc"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Contact Information */}
          <Col span={24}>
            <Card title="Contact Information" size="small" className="mb-3">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Contact Email"
                    name="contactEmail"
                    rules={[
                      {
                        required: true,
                        message: "Please enter contact email",
                      },
                      {
                        type: "email",
                        message: "Please enter a valid email",
                      },
                    ]}
                  >
                    <Input placeholder="Enter contact email" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Contact Number"
                    name="contactNumber"
                    rules={[
                      {
                        required: true,
                        message: "Please enter contact number",
                      },
                      {
                        pattern: /^[\+]?[1-9][\d]{0,15}$/,
                        message: "Please enter a valid phone number",
                      },
                    ]}
                  >
                    <Input placeholder="Enter contact number" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Website URL"
                    name="websiteUrl"
                    rules={[
                      { required: true, message: "Please enter website URL" },
                      { type: "url", message: "Please enter a valid URL" },
                    ]}
                  >
                    <Input placeholder="https://example.com" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Company Description"
                    name="description"
                    rules={[
                      {
                        required: true,
                        message: "Please enter company description",
                      },
                      {
                        min: 10,
                        message: "Description must be at least 10 characters",
                      },
                    ]}
                  >
                    <Input.TextArea
                      placeholder="Enter company description"
                      rows={4}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Location Information */}
          <Col span={24}>
            <Card title="Primary Location" size="small" className="mb-3">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="City"
                    name={["locations", 0, "city"]}
                    rules={[{ required: true, message: "Please enter city" }]}
                  >
                    <Input placeholder="Enter city" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Country"
                    name={["locations", 0, "country"]}
                    rules={[
                      { required: true, message: "Please select country" },
                    ]}
                  >
                    <Select placeholder="Select country" showSearch>
                      {countryDetails.map((country) => (
                        <Select.Option
                          key={country.countryName}
                          value={country.countryName}
                        >
                          {country.countryName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Address"
                    name={["locations", 0, "address"]}
                    rules={[
                      { required: true, message: "Please enter address" },
                    ]}
                  >
                    <Input placeholder="Enter full address" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name={["locations", 0, "isPrimaryLocation"]}
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch
                      checkedChildren="Primary Location"
                      unCheckedChildren="Secondary Location"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Social Links */}
          <Col span={24}>
            <Card title="Social Media Links (Optional)" size="small">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="LinkedIn URL"
                    name={["socialLinks", 0, "url"]}
                  >
                    <Input placeholder="https://linkedin.com/company/..." />
                  </Form.Item>
                  <Form.Item
                    name={["socialLinks", 0, "platform"]}
                    initialValue="LinkedIn"
                    hidden
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Twitter URL"
                    name={["socialLinks", 1, "url"]}
                  >
                    <Input placeholder="https://twitter.com/..." />
                  </Form.Item>
                  <Form.Item
                    name={["socialLinks", 1, "platform"]}
                    initialValue="Twitter"
                    hidden
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Facebook URL"
                    name={["socialLinks", 2, "url"]}
                  >
                    <Input placeholder="https://facebook.com/..." />
                  </Form.Item>
                  <Form.Item
                    name={["socialLinks", 2, "platform"]}
                    initialValue="Facebook"
                    hidden
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
});

CreateCompanyModal.displayName = "CreateCompanyModal";

export default CreateCompanyModal;
