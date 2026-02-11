"use client";

/**
 * EditJobModal Component
 * 
 * Simple modal for editing (PUT) existing jobs
 * 
 * @param {boolean} isOpen - Whether modal is open
 * @param {Object} selectedJob - Job to edit (required)
 * @param {Function} onCancel - Cancel handler
 * @param {Function} onUpdate - Update handler (receives jobId, payload)
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
import dayjs from "dayjs";

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

const EditJobModal = memo(({ isOpen, selectedJob, onCancel, onUpdate }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);

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

  /**
   * Format Posted On date from createdOn or postedOn
   */
  const formatPostedOnDate = useMemo(() => {
    if (!selectedJob) return "N/A";
    
    const dateValue = selectedJob.createdOn || selectedJob.created_on || selectedJob.postedOn || selectedJob.posted_on || "";
    if (!dateValue) return "N/A";
    
    try {
      // If it's a timestamp (number)
      if (typeof dateValue === "number") {
        return dayjs(dateValue).format("YYYY-MM-DD");
      }
      
      // If it's a date string
      if (typeof dateValue === "string") {
        const parsed = dayjs(dateValue);
        if (parsed.isValid()) {
          return parsed.format("YYYY-MM-DD");
        }
        // If already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return dateValue;
        }
      }
      
      return "N/A";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  }, [selectedJob]);

  // Populate form when modal opens with selectedJob data
  useEffect(() => {
    if (isOpen && selectedJob) {
      const job = selectedJob;

      // Parse salary range
      let salaryRangeValue = "";
      if (job.salaryRange) {
        const match = job.salaryRange.match(/\$([\d,]+)\s*-\s*\$([\d,]+)/);
        if (match) {
          const min = parseInt(match[1].replace(/,/g, "")) / 1000000;
          const max = parseInt(match[2].replace(/,/g, "")) / 1000000;
          salaryRangeValue = `${min}-${max}M`;
        }
      } else if (job.salary_range) {
        const minStr = job.salary_range.min?.replace(/[^0-9]/g, "") || "";
        const maxStr = job.salary_range.max?.replace(/[^0-9]/g, "") || "";
        if (minStr && maxStr) {
          const min = parseInt(minStr);
          const max = parseInt(maxStr);
          if (min >= 1000000 || max >= 1000000) {
            const minM = min / 1000000;
            const maxM = max / 1000000;
            salaryRangeValue = `${minM}-${maxM}M`;
          } else {
            const minK = min / 1000;
            const maxK = max / 1000;
            salaryRangeValue = `${minK}-${maxK}K`;
          }
        }
      }

      // Parse location
      const locationObj = job.locationObj || (typeof job.location === "object" ? job.location : {}) || {};
      const city = locationObj.city || "";
      const state = locationObj.state || "";
      const pincode = locationObj.pinCode || locationObj.pincode || "";
      const address = locationObj.address || "";
      let countryCode = locationObj.countryCode || locationObj.country || "";

      // Convert country name to code if needed
      if (countryCode && countryCode.length > 2) {
        const countryData = _find(
          CountryDetails,
          (c) => c.countryName === countryCode
        );
        if (countryData) {
          countryCode = countryData.countryCode;
        }
      }

      if (countryCode) {
        setSelectedCountry(countryCode);
      }

      // Parse deadline
      let deadlineValue = null;
      if (job.applicationDeadline) {
        deadlineValue = dayjs(job.applicationDeadline);
      } else if (job.application_deadline) {
        deadlineValue = dayjs(job.application_deadline);
      }

      // Set form values
      form.setFieldsValue({
        title: job.title || "",
        experience_required: job.experienceRequired || job.experience_required || "",
        employment_type: job.employmentType || job.employment_type || "",
        currency: "USD",
        salary_range: salaryRangeValue,
        description: job.description || "",
        skills_required: job.skillsRequired || job.skills_required || [],
        application_deadline: deadlineValue,
        status: job.status || "pending",
        isActive: job.isActive !== undefined ? job.isActive : job.is_active !== undefined ? job.is_active : true,
        location: {
          city: city,
          state: state,
          pincode: pincode,
          address: address,
          country: countryCode,
        },
      });

      // Set again after delay for country dropdown
      setTimeout(() => {
        form.setFieldsValue({
          location: {
            city: city,
            state: state,
            pincode: pincode,
            address: address,
            country: countryCode,
          },
        });
      }, 300);
    }
  }, [isOpen, form, selectedJob]);

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

  // Handle form submission - PUT only
  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);

      if (!selectedJob) {
        throw new Error("No job selected for editing");
      }

      // Get jobId
      let jobId = selectedJob?.id || selectedJob?.jobId || selectedJob?.job_id || null;
      
      if (typeof jobId === 'string' && jobId.startsWith('JOB-')) {
        const numericId = jobId.replace('JOB-', '');
        jobId = /^\d+$/.test(numericId) ? numericId : jobId;
      }

      if (!jobId) {
        throw new Error("Job ID is required for update");
      }

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
          companyId: selectedJob.postedBy?.companyId || null,
          companyName: selectedJob.postedBy?.companyName || "",
          companyShortName: selectedJob.postedBy?.companyShortName || "",
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

      console.log("🔄 UPDATE JOB PAYLOAD:", JSON.stringify(payload, null, 2));
      console.log("🔄 Job ID:", jobId);
      console.log("🌍 Location in payload:", {
        countryCode: payload.location.countryCode,
        country: payload.location.country,
      });

      // Always use PUT via onUpdate callback
      if (onUpdate && typeof onUpdate === "function") {
        await onUpdate(jobId, payload);
        message.success("Job updated successfully!");
        onCancel();
      } else {
        throw new Error("onUpdate callback is required for editing");
      }
    } catch (error) {
      console.error("Update job error:", error);

      if (error?.errorFields) {
        message.error("Please fill all required fields correctly");
        return;
      }

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update job. Please try again.";
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, onUpdate, onCancel, selectedJob, currencyOptions, parseSalaryRange]);

  const handleCancel = useCallback(() => {
    if (!isSubmitting) {
      form.resetFields();
      setSelectedCountry(null);
      onCancel();
    }
  }, [form, onCancel, isSubmitting]);

  if (!selectedJob) {
    return null;
  }

  return (
    <Modal
      title={<span className="C-heading size-5 mb-0 bold">Edit Job</span>}
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
          {isSubmitting ? "Updating..." : "Update Job"}
        </Button>,
      ]}
      width={900}
      centered
      closable={!isSubmitting}
      maskClosable={!isSubmitting}
    >
      <Spin spinning={isSubmitting} tip="Updating job...">
        {/* Posted On Info */}
        <div className="mb-3 pb-2 border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <span className="C-heading size-xs text-muted mb-0">Posted On:</span>
            <span className="C-heading size-xs semiBold mb-0">{formatPostedOnDate}</span>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
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
                  <span className="C-heading size-xs semiBold mb-0">City</span>
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
});

EditJobModal.displayName = "EditJobModal";

export default EditJobModal;
