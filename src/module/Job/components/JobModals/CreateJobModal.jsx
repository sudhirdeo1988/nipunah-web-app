"use client";

/**
 * CreateJobModal Component
 * 
 * Simple modal for creating (POST) new jobs
 * 
 * @param {boolean} isOpen - Whether modal is open
 * @param {Function} onCancel - Cancel handler
 * @param {Function} onSubmit - Submit handler (receives payload)
 * @param {Object} companyInfo - Optional company info
 */

import React, { memo, useCallback, useState, useEffect, useMemo } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Row,
  Col,
  Button,
  message,
  Spin,
} from "antd";
import Icon from "@/components/Icon";
import CountryDetails from "@/utilities/CountryDetails.json";
import { map as _map, find as _find, isEmpty as _isEmpty } from "lodash-es";
import { jobService } from "@/utilities/apiServices";
import dayjs from "dayjs";
import { useRole } from "@/hooks/useRole";

const { TextArea } = Input;

const EMPLOYMENT_TYPES = [
  { label: "Full-time", value: "Full-time" },
  { label: "Part-time", value: "Part-time" },
  { label: "Contract", value: "Contract" },
  { label: "Internship", value: "Internship" },
];

const EXPERIENCE_RANGES = [
  { label: "0-1 years", value: "0-1 years" },
  { label: "1-3 years", value: "1-3 years" },
  { label: "3-5 years", value: "3-5 years" },
  { label: "5-8 years", value: "5-8 years" },
  { label: "8-10 years", value: "8-10 years" },
  { label: "10+ years", value: "10+ years" },
];

const CreateJobModal = memo(
  ({ isOpen, onCancel, onSubmit, companyInfo: propCompanyInfo }) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const { user } = useRole();

    // Get company information
    const companyInfo = useMemo(() => {
      if (propCompanyInfo) return propCompanyInfo;
      if (user) {
        return {
          company_id: user.company_id || user.id,
          company_name: user.company_name || user.name || user.companyName,
          company_short_name:
            user.company_short_name || user.shortName || user.companyShortName,
        };
      }
      return null;
    }, [propCompanyInfo, user]);

    // Country options
    const countrySelectOptions = useMemo(
      () =>
        _map(CountryDetails, (country) => ({
          label: country.countryName,
          value: country.countryCode,
        })),
      []
    );

    const selectedCountryData = useMemo(
      () =>
        _find(CountryDetails, (country) => country.countryCode === selectedCountry),
      [selectedCountry]
    );

    const states = useMemo(
      () => (selectedCountryData ? selectedCountryData.states : []),
      [selectedCountryData]
    );

    const stateSelectOptions = useMemo(
      () =>
        _map(states, (state) => ({
          label: state,
          value: state,
        })),
      [states]
    );

    // Currency options
    const currencyOptions = useMemo(
      () =>
        _map(CountryDetails, (c) => ({
          label: `${c.currencyCode} (${c.currencySymbol})`,
          value: c.currencyCode,
          symbol: c.currencySymbol,
        })),
      []
    );

    // Reset form when modal opens
    useEffect(() => {
      if (isOpen) {
        form.resetFields();
        setSelectedCountry(null);
        form.setFieldsValue({
          status: "pending",
          isActive: true,
          currency: "USD",
          skills_required: ["React", "React"],
        });
      }
    }, [isOpen, form]);

    // Handle country change
    const handleCountryChange = useCallback(
      (value) => {
        setSelectedCountry(value);
        form.setFieldsValue({
          location: {
            ...form.getFieldValue("location"),
            state: undefined,
          },
        });
      },
      [form]
    );

    // Parse salary range
    const parseSalaryRange = useCallback((rangeString, currencySymbol) => {
      if (!rangeString) return { min: "", max: "" };

      const normalized = rangeString.trim().toUpperCase();
      const match = normalized.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*([MK])?/);

      if (match) {
        const min = parseFloat(match[1]);
        const max = parseFloat(match[2]);
        const unit = match[3] || "M";
        const multiplier = unit === "K" ? 1000 : 1000000;

        const minValue = min * multiplier;
        const maxValue = max * multiplier;

        const formatNumber = (num) => {
          return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
        };

        return {
          min: `${currencySymbol}${formatNumber(minValue)}`,
          max: `${currencySymbol}${formatNumber(maxValue)}`,
        };
      }

      return { min: "", max: "" };
    }, []);

    // Handle form submission - POST only
    const handleSubmit = useCallback(async () => {
      try {
        setIsSubmitting(true);

        const values = await form.validateFields();

        const selectedCurrency = currencyOptions.find(
          (c) => c.value === values.currency
        );
        const currencySymbol = selectedCurrency?.symbol || "$";

        const salaryRange = parseSalaryRange(values.salary_range, currencySymbol);

        // Get country code and country name
        const countryCode = values.location?.country || "";
        let countryName = "";
        if (countryCode) {
          const countryData = _find(
            CountryDetails,
            (c) => c.countryCode === countryCode
          );
          countryName = countryData ? countryData.countryName : "";
        }

        const payload = {
          title: values.title,
          postedBy: {
            companyId: companyInfo?.company_id || values.company_id || null,
            companyName: companyInfo?.company_name || values.company_name || "",
            companyShortName:
              companyInfo?.company_short_name ||
              values.company_short_name ||
              "",
          },
          experienceRequired: values.experience_required,
          salaryRange: {
            min: salaryRange.min,
            max: salaryRange.max,
          },
          location: {
            city: values.location?.city || "",
            state: values.location?.state || "",
            pinCode: values.location?.pincode || "",
            address: values.location?.address || "",
            countryCode: countryCode,
            country: countryName, // Store country name as well
          },
          description: values.description,
          employmentType: values.employment_type,
          skillsRequired: values.skills_required || [],
          applicationDeadline: values.application_deadline
            ? dayjs(values.application_deadline).format("YYYY-MM-DD")
            : null,
          status: values.status || "pending",
          isActive: values.isActive !== undefined ? values.isActive : true,
        };

        console.log("➕ CREATE JOB PAYLOAD:", JSON.stringify(payload, null, 2));
        console.log("🌍 Location in payload:", {
          countryCode: payload.location.countryCode,
          country: payload.location.country,
        });

        // Call onSubmit callback which handles the API call and success message
        // This prevents duplicate success messages (hook will show the message)
        if (onSubmit && typeof onSubmit === "function") {
          await onSubmit(payload);
          // Reset form after successful submission
          form.resetFields();
          setSelectedCountry(null);
          onCancel();
        } else {
          // Fallback: call API directly if no callback provided
          const response = await jobService.createJob(payload);
          const isSuccess =
            response?.success !== false &&
            (response?.data !== undefined ||
              response?.id !== undefined ||
              response?.job_id !== undefined);

          if (isSuccess) {
            message.success("Job posted successfully!");
            form.resetFields();
            setSelectedCountry(null);
            onCancel();
          } else {
            const errorMessage =
              response?.message ||
              response?.error ||
              "Failed to post job. Please try again.";
            message.error(errorMessage);
          }
        }
      } catch (error) {
        console.error("Create job error:", error);

        if (error?.errorFields) {
          message.error("Please fill all required fields correctly");
          return;
        }

        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to post job. Please try again.";
        message.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }, [form, onSubmit, onCancel, companyInfo, currencyOptions, parseSalaryRange]);

    const handleCancel = useCallback(() => {
      if (!isSubmitting) {
        form.resetFields();
        setSelectedCountry(null);
        onCancel();
      }
    }, [form, onCancel, isSubmitting]);

    return (
      <Modal
        title={<span className="C-heading size-5 mb-0 bold">Post a Job</span>}
        open={isOpen}
        onCancel={handleCancel}
        footer={[
          <Button
            key="cancel"
            onClick={handleCancel}
            className="C-button is-bordered"
            disabled={isSubmitting}
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
            {isSubmitting ? "Posting..." : "Post Job"}
          </Button>,
        ]}
        width={900}
        centered
        closable={!isSubmitting}
        maskClosable={!isSubmitting}
      >
        <Spin spinning={isSubmitting} tip="Posting job...">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              status: "pending",
              isActive: true,
              currency: "USD",
              skills_required: ["React", "React"],
            }}
            className="py-3"
          >
            <Row gutter={16}>
              {/* Job Title */}
              <Col span={24}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Job Title
                    </span>
                  }
                  name="title"
                  rules={[
                    { required: true, message: "Please enter job title" },
                    {
                      min: 3,
                      message: "Job title must be at least 3 characters",
                    },
                  ]}
                >
                  <Input
                    placeholder="e.g., Senior Software Engineer"
                    size="large"
                    prefix={<Icon name="work" isFilled color="#ccc" />}
                  />
                </Form.Item>
              </Col>

              {/* Experience Required */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Experience Required
                    </span>
                  }
                  name="experience_required"
                  rules={[
                    {
                      required: true,
                      message: "Please select experience range",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select experience range"
                    size="large"
                    options={EXPERIENCE_RANGES}
                  />
                </Form.Item>
              </Col>

              {/* Employment Type */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Employment Type
                    </span>
                  }
                  name="employment_type"
                  rules={[
                    {
                      required: true,
                      message: "Please select employment type",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select employment type"
                    size="large"
                    options={EMPLOYMENT_TYPES}
                  />
                </Form.Item>
              </Col>

              {/* Currency */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Currency
                    </span>
                  }
                  name="currency"
                  rules={[
                    { required: true, message: "Please select currency" },
                  ]}
                >
                  <Select
                    placeholder="Select Currency"
                    size="large"
                    showSearch
                    optionFilterProp="label"
                    options={currencyOptions}
                  />
                </Form.Item>
              </Col>

              {/* Salary Range */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Salary Range
                    </span>
                  }
                  name="salary_range"
                  rules={[
                    { required: true, message: "Please enter salary range" },
                    {
                      pattern: /^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?\s*[MK]?$/i,
                      message:
                        "Format: 1-2M or 10-30M (e.g., 1-2M, 10-30M)",
                    },
                  ]}
                  extra="Enter range like: 1-2M, 10-30M, 50-100K"
                >
                  <Input
                    placeholder="e.g., 1-2M or 10-30M"
                    size="large"
                    prefix={<Icon name="attach_money" isFilled color="#ccc" />}
                  />
                </Form.Item>
              </Col>

              {/* Address Section */}
              <Col span={24}>
                <div className="border-top pt-3 mt-2 mb-3">
                  <h5 className="C-heading size-xs bold mb-3">Job Location</h5>
                </div>
              </Col>

              {/* Country */}
              <Col span={!_isEmpty(states) ? 6 : 12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Country
                    </span>
                  }
                  name={["location", "country"]}
                  rules={[
                    { required: true, message: "Please select country" },
                  ]}
                >
                  <Select
                    placeholder="Select Country"
                    size="large"
                    showSearch
                    optionFilterProp="label"
                    onChange={handleCountryChange}
                    filterOption={(input, option) =>
                      (option?.label || "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={countrySelectOptions}
                  />
                </Form.Item>
              </Col>

              {/* State */}
              {!_isEmpty(states) && (
                <Col span={6}>
                  <Form.Item
                    label={
                      <span className="C-heading size-xs semiBold mb-0">
                        State/Province
                      </span>
                    }
                    name={["location", "state"]}
                    rules={[
                      { required: true, message: "Please select state" },
                    ]}
                  >
                    <Select
                      placeholder="Select State/Province"
                      size="large"
                      showSearch
                      optionFilterProp="label"
                      disabled={!selectedCountry || states.length === 0}
                      filterOption={(input, option) =>
                        (option?.label || "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={stateSelectOptions}
                    />
                  </Form.Item>
                </Col>
              )}

              {/* Detail Address */}
              <Col span={24}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Detail Address
                    </span>
                  }
                  name={["location", "address"]}
                  rules={[
                    { required: true, message: "Please enter address" },
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Enter detailed address"
                    size="large"
                  />
                </Form.Item>
              </Col>

              {/* City */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      City
                    </span>
                  }
                  name={["location", "city"]}
                  rules={[
                    { required: true, message: "Please enter city" },
                  ]}
                >
                  <Input
                    placeholder="Enter City"
                    size="large"
                    prefix={
                      <Icon name="location_city" isFilled color="#ccc" />
                    }
                  />
                </Form.Item>
              </Col>

              {/* Pincode */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Pincode/ZIP Code
                    </span>
                  }
                  name={["location", "pincode"]}
                  rules={[
                    { required: true, message: "Please enter pincode" },
                    {
                      pattern: /^[0-9A-Za-z\s-]{3,10}$/,
                      message: "Please enter a valid pincode",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter Pincode"
                    size="large"
                    prefix={<Icon name="pin_drop" isFilled color="#ccc" />}
                  />
                </Form.Item>
              </Col>

              {/* Description */}
              <Col span={24}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Job Description
                    </span>
                  }
                  name="description"
                  rules={[
                    {
                      required: true,
                      message: "Please enter job description",
                    },
                    {
                      min: 20,
                      message: "Description must be at least 20 characters",
                    },
                  ]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Enter detailed job description..."
                    size="large"
                  />
                </Form.Item>
              </Col>

              {/* Skills Required */}
              <Col span={24}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Skills Required
                    </span>
                  }
                  name="skills_required"
                  rules={[
                    {
                      type: "array",
                      min: 1,
                      message: "Please add at least one skill",
                    },
                  ]}
                  extra="Press Enter or comma to add skills"
                >
                  <Select
                    mode="tags"
                    placeholder="Add skills (press Enter to add)"
                    size="large"
                    tokenSeparators={[","]}
                  />
                </Form.Item>
              </Col>

              {/* Application Deadline */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Application Deadline
                    </span>
                  }
                  name="application_deadline"
                  rules={[
                    {
                      required: true,
                      message: "Please select application deadline",
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    size="large"
                    format="YYYY-MM-DD"
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                  />
                </Form.Item>
              </Col>

              {/* Status */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Status
                    </span>
                  }
                  name="status"
                  rules={[
                    { required: true, message: "Please select status" },
                  ]}
                >
                  <Select
                    placeholder="Select Status"
                    size="large"
                    options={[
                      { label: "Pending", value: "pending" },
                      { label: "Approved", value: "approved" },
                      { label: "Blocked", value: "blocked" },
                    ]}
                  />
                </Form.Item>
              </Col>

              {/* Is Active */}
              <Col span={24}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Active Status
                    </span>
                  }
                  name="isActive"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>
    );
  }
);

CreateJobModal.displayName = "CreateJobModal";

export default CreateJobModal;
