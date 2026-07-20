"use client";

/**
 * EditJobModal Component
 *
 * Modal for editing (PUT) existing jobs — Naukri-aligned field set + rich text.
 */

import React, { memo, useCallback, useState, useEffect, useMemo } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Checkbox,
  Row,
  Col,
  Button,
  message,
  Spin,
  InputNumber,
} from "antd";
import Icon from "@/components/Icon";
import CountryDetails from "@/utilities/CountryDetails.json";
import { startsWithSelectFilter } from "@/utilities/selectFilters";
import { map as _map, find as _find } from "lodash-es";
import dayjs from "dayjs";
import DigitsOnlyInput from "@/components/DigitsOnlyInput";
import { digitsOnlyNormalize } from "@/utilities/numericInput";
import RichTextEditor from "@/components/RichTextEditor";
import {
  EMPLOYMENT_TYPES,
  EMPLOYMENT_NATURES,
  EXPERIENCE_RANGES,
  WORK_MODES,
  ROLE_CATEGORIES,
  DEPARTMENTS,
  INDUSTRIES,
  EDUCATION_OPTIONS,
  EDUCATION_SPECIALIZATIONS,
  richTextMinLength,
} from "../../constants/jobFormOptions";

const { TextArea } = Input;

/**
 * Normalize skills from API (array of tags or HTML string) for the RTE.
 */
const normalizeSkillsForForm = (skills) => {
  if (!skills) return "";
  if (typeof skills === "string") return skills;
  if (Array.isArray(skills)) {
    const unique = [...new Set(skills.filter(Boolean))];
    if (unique.length === 0) return "";
    return `<ul>${unique.map((s) => `<li>${s}</li>`).join("")}</ul>`;
  }
  return "";
};

const normalizeTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return [...new Set(tags.filter(Boolean))];
  if (typeof tags === "string" && tags.trim()) return [tags.trim()];
  return [];
};

const EditJobModal = memo(({ isOpen, selectedJob, onCancel, onUpdate }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const salaryNotDisclosed = Form.useWatch("salary_not_disclosed", form);

  const countrySelectOptions = useMemo(
    () =>
      _map(CountryDetails, (country) => ({
        label: country.countryName,
        value: country.countryCode,
      })),
    []
  );

  const currencyOptions = useMemo(() => {
    const seenCurrencyCodes = new Set();
    return _map(CountryDetails, (c) => {
      const code = String(c?.currencyCode || "").trim();
      if (!code || seenCurrencyCodes.has(code)) return null;
      seenCurrencyCodes.add(code);
      const symbol = String(c?.currencySymbol || "").trim();
      return {
        label: symbol ? `${code} (${symbol})` : code,
        value: code,
        symbol,
      };
    }).filter(Boolean);
  }, []);

  const formatPostedOnDate = useMemo(() => {
    if (!selectedJob) return "N/A";

    const dateValue =
      selectedJob.createdOn ||
      selectedJob.created_on ||
      selectedJob.postedOn ||
      selectedJob.posted_on ||
      "";
    if (!dateValue) return "N/A";

    try {
      if (typeof dateValue === "number") {
        return dayjs(dateValue).format("YYYY-MM-DD");
      }
      if (typeof dateValue === "string") {
        const parsed = dayjs(dateValue);
        if (parsed.isValid()) {
          return parsed.format("YYYY-MM-DD");
        }
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

  useEffect(() => {
    if (isOpen && selectedJob) {
      const job = selectedJob;

      // Derive salary range input from stored min/max strings
      let salaryRangeValue = "";
      let salaryNotDisclosedValue = !!(
        job.salaryNotDisclosed || job.salary_not_disclosed
      );
      const salaryObj = job.salary_range || job.salaryRange;
      if (salaryObj && typeof salaryObj === "object") {
        const minRaw = String(salaryObj.min || "");
        const maxRaw = String(salaryObj.max || "");
        if (
          /not\s*disclosed/i.test(minRaw) ||
          /not\s*disclosed/i.test(maxRaw)
        ) {
          salaryNotDisclosedValue = true;
        } else {
          const minStr = minRaw.replace(/[^0-9.]/g, "");
          const maxStr = maxRaw.replace(/[^0-9.]/g, "");
          if (minStr && maxStr) {
            const minNum = parseFloat(minStr);
            const maxNum = parseFloat(maxStr);
            if (minNum >= 1000000 || maxNum >= 1000000) {
              salaryRangeValue = `${(minNum / 1000000).toFixed(
                minNum % 1000000 === 0 ? 0 : 1
              )}-${(maxNum / 1000000).toFixed(
                maxNum % 1000000 === 0 ? 0 : 1
              )}M`;
            } else if (minNum >= 1000 || maxNum >= 1000) {
              salaryRangeValue = `${(minNum / 1000).toFixed(
                minNum % 1000 === 0 ? 0 : 1
              )}-${(maxNum / 1000).toFixed(maxNum % 1000 === 0 ? 0 : 1)}K`;
            } else {
              salaryRangeValue = `${minNum}-${maxNum}`;
            }
          }
        }
      } else if (typeof job.salaryRange === "string" && job.salaryRange) {
        if (/not\s*disclosed/i.test(job.salaryRange)) {
          salaryNotDisclosedValue = true;
        } else {
          salaryRangeValue = job.salaryRange
            .replace(/[^0-9.\-MK\s]/gi, "")
            .trim();
        }
      }

      const locationObj =
        job.locationObj ||
        (typeof job.location === "object" ? job.location : {}) ||
        {};
      const city = locationObj.city || "";
      const state = locationObj.state || "";
      const pincode = locationObj.pinCode || locationObj.pincode || "";
      let countryCode = locationObj.countryCode || locationObj.country || "";

      if (countryCode && countryCode.length > 2) {
        const countryData = _find(
          CountryDetails,
          (c) => c.countryName === countryCode
        );
        if (countryData) {
          countryCode = countryData.countryCode;
        }
      }

      let deadlineValue = null;
      if (job.applicationDeadline) {
        deadlineValue = dayjs(job.applicationDeadline);
      } else if (job.application_deadline) {
        deadlineValue = dayjs(job.application_deadline);
      }

      const requiredSkillsHtml = normalizeSkillsForForm(
        job.requiredSkills ||
          job.required_skills ||
          job.skillsRequired ||
          job.skills_required
      );

      form.setFieldsValue({
        title: job.title || "",
        experience_required:
          job.experienceRequired || job.experience_required || "",
        employment_type: job.employmentType || job.employment_type || "",
        employment_nature:
          job.employmentNature || job.employment_nature || "Permanent",
        work_mode: job.workMode || job.work_mode || "Office",
        openings: job.openings != null ? Number(job.openings) : 1,
        role: job.role || "",
        role_category: job.roleCategory || job.role_category || "",
        department: job.department || "",
        industry: job.industry || "",
        education: job.education || "",
        education_specialization:
          job.educationSpecialization ||
          job.education_specialization ||
          "Any Specialization",
        qualifications: job.qualifications || "",
        currency: "USD",
        salary_not_disclosed: salaryNotDisclosedValue,
        salary_range: salaryRangeValue,
        description: job.description || "",
        key_responsibilities:
          job.keyResponsibilities || job.key_responsibilities || "",
        required_skills: requiredSkillsHtml,
        preferred_skills:
          job.preferredSkills || job.preferred_skills || "",
        key_skills: normalizeTags(job.keySkills || job.key_skills),
        preferred_key_skills: normalizeTags(
          job.preferredKeySkills || job.preferred_key_skills
        ),
        application_deadline: deadlineValue,
        status: job.status || "pending",
        isActive:
          job.isActive !== undefined
            ? job.isActive
            : job.is_active !== undefined
            ? job.is_active
            : true,
        location: {
          city,
          state,
          pincode,
          country: countryCode,
        },
      });

      setTimeout(() => {
        form.setFieldsValue({
          location: {
            city,
            state,
            pincode,
            country: countryCode,
          },
        });
      }, 300);
    }
  }, [isOpen, form, selectedJob]);

  const parseSalaryRange = useCallback((rangeString, currencySymbol) => {
    if (!rangeString) return { min: "", max: "" };

    const normalized = rangeString.trim().toUpperCase();
    const match = normalized.match(
      /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*([MK])?/
    );

    if (match) {
      const min = parseFloat(match[1]);
      const max = parseFloat(match[2]);
      const unit = match[3] || "M";
      const multiplier = unit === "K" ? 1000 : 1000000;

      const minValue = min * multiplier;
      const maxValue = max * multiplier;

      const formatNumber = (num) =>
        num.toLocaleString("en-US", { maximumFractionDigits: 0 });

      return {
        min: `${currencySymbol}${formatNumber(minValue)}`,
        max: `${currencySymbol}${formatNumber(maxValue)}`,
      };
    }

    return { min: "", max: "" };
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);

      if (!selectedJob) {
        throw new Error("No job selected for editing");
      }

      let jobId =
        selectedJob?.id || selectedJob?.jobId || selectedJob?.job_id || null;

      if (typeof jobId === "string" && jobId.startsWith("JOB-")) {
        const numericId = jobId.replace("JOB-", "");
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

      const salaryNotDisclosedValue = !!values.salary_not_disclosed;
      const salaryRange = salaryNotDisclosedValue
        ? { min: "Not Disclosed", max: "Not Disclosed" }
        : parseSalaryRange(values.salary_range, currencySymbol);

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
        salaryNotDisclosed: salaryNotDisclosedValue,
        salaryRange: {
          min: salaryRange.min,
          max: salaryRange.max,
        },
        location: {
          city: values.location?.city || "",
          state: values.location?.state || "",
          pinCode: values.location?.pincode || "",
          countryCode: countryCode,
          country: countryName,
        },
        description: values.description || "",
        keyResponsibilities: values.key_responsibilities || "",
        requiredSkills: values.required_skills || "",
        preferredSkills: values.preferred_skills || "",
        skillsRequired: values.required_skills || "",
        keySkills: values.key_skills || [],
        preferredKeySkills: values.preferred_key_skills || [],
        qualifications: values.qualifications || "",
        employmentType: values.employment_type,
        employmentNature: values.employment_nature || "Permanent",
        workMode: values.work_mode || "Office",
        openings: values.openings != null ? Number(values.openings) : 1,
        role: values.role || "",
        roleCategory: values.role_category || "",
        department: values.department || "",
        industry: values.industry || "",
        education: values.education || "",
        educationSpecialization: values.education_specialization || "",
        applicationDeadline: values.application_deadline
          ? dayjs(values.application_deadline).format("YYYY-MM-DD")
          : null,
        status: values.status || "pending",
        isActive: values.isActive !== undefined ? values.isActive : true,
      };

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
  }, [
    form,
    onUpdate,
    onCancel,
    selectedJob,
    currencyOptions,
    parseSalaryRange,
  ]);

  const handleCancel = useCallback(() => {
    if (!isSubmitting) {
      form.resetFields();
      onCancel();
    }
  }, [form, onCancel, isSubmitting]);

  const sectionTitle = (label) => (
    <Col span={24}>
      <div className="border-top pt-3 mt-2 mb-3">
        <h5 className="C-heading size-xs bold mb-0">{label}</h5>
      </div>
    </Col>
  );

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
      width={1000}
      centered
      closable={!isSubmitting}
      mask={{ closable: !isSubmitting }}
      styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
    >
      <Spin spinning={isSubmitting} tip="Updating job...">
        <div className="mb-3 pb-2 border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <span className="C-heading size-xs text-muted mb-0">Posted On:</span>
            <span className="C-heading size-xs semiBold mb-0">
              {formatPostedOnDate}
            </span>
          </div>
        </div>

        <Form form={form} layout="vertical" className="py-3">
          <Row gutter={16}>
            {sectionTitle("Basic Details")}

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
                  placeholder="e.g., Hiring ServiceNow Professionals"
                  size="large"
                  prefix={<Icon name="work" isFilled color="#ccc" />}
                />
              </Form.Item>
            </Col>

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

            <Col span={12}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Employment Nature
                  </span>
                }
                name="employment_nature"
                rules={[
                  {
                    required: true,
                    message: "Please select employment nature",
                  },
                ]}
              >
                <Select
                  placeholder="e.g., Permanent"
                  size="large"
                  options={EMPLOYMENT_NATURES}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Work Mode
                  </span>
                }
                name="work_mode"
                rules={[
                  { required: true, message: "Please select work mode" },
                ]}
              >
                <Select
                  placeholder="Select work mode"
                  size="large"
                  options={WORK_MODES}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Number of Openings
                  </span>
                }
                name="openings"
                rules={[
                  {
                    required: true,
                    message: "Please enter number of openings",
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={999}
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="e.g., 5"
                />
              </Form.Item>
            </Col>

            {sectionTitle("Compensation")}

            <Col span={24}>
              <Form.Item
                name="salary_not_disclosed"
                valuePropName="checked"
                className="mb-2"
              >
                <Checkbox>Salary not disclosed</Checkbox>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Currency
                  </span>
                }
                name="currency"
                rules={
                  salaryNotDisclosed
                    ? []
                    : [
                        {
                          required: true,
                          message: "Please select currency",
                        },
                      ]
                }
              >
                <Select
                  placeholder="Select Currency"
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  options={currencyOptions}
                  disabled={salaryNotDisclosed}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Salary Range
                  </span>
                }
                name="salary_range"
                rules={
                  salaryNotDisclosed
                    ? []
                    : [
                        {
                          required: true,
                          message: "Please enter salary range",
                        },
                        {
                          pattern: /^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?\s*[MK]?$/i,
                          message:
                            "Format: 1-2M or 10-30M (e.g., 1-2M, 10-30M)",
                        },
                      ]
                }
                extra={
                  salaryNotDisclosed
                    ? "Salary will show as Not Disclosed"
                    : "Enter range like: 1-2M, 10-30M, 50-100K"
                }
              >
                <Input
                  placeholder="e.g., 1-2M or 10-30M"
                  size="large"
                  disabled={salaryNotDisclosed}
                  prefix={<Icon name="attach_money" isFilled color="#ccc" />}
                />
              </Form.Item>
            </Col>

            {sectionTitle("Job Location")}

            <Col span={6}>
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
                  filterOption={startsWithSelectFilter}
                  options={countrySelectOptions}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    State/Province
                  </span>
                }
                name={["location", "state"]}
                rules={[
                  { required: true, message: "Please enter state/province" },
                  {
                    pattern: /^[A-Za-z\s]+$/,
                    message: "Only alphabets and spaces are allowed.",
                  },
                ]}
              >
                <Input
                  placeholder="State/Province"
                  size="large"
                  prefix={<Icon name="location_on" isFilled color="#ccc" />}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">City</span>
                }
                name={["location", "city"]}
                rules={[{ required: true, message: "Please enter city" }]}
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

            <Col span={6}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Pincode/ZIP
                  </span>
                }
                name={["location", "pincode"]}
                normalize={digitsOnlyNormalize(10)}
                rules={[
                  { required: true, message: "Please enter pincode" },
                  {
                    pattern: /^\d{4,10}$/,
                    message: "Pincode must be 4-10 digits.",
                  },
                ]}
              >
                <DigitsOnlyInput
                  placeholder="Pincode"
                  maxLength={10}
                  size="large"
                  prefix={<Icon name="pin_drop" isFilled color="#ccc" />}
                />
              </Form.Item>
            </Col>

            {sectionTitle("Role Classification")}

            <Col span={12}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">Role</span>
                }
                name="role"
                rules={[
                  { required: true, message: "Please enter role" },
                  { min: 2, message: "Role must be at least 2 characters" },
                ]}
              >
                <Input
                  placeholder="e.g., ServiceNow Developer"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Role Category
                  </span>
                }
                name="role_category"
                rules={[
                  { required: true, message: "Please select role category" },
                ]}
              >
                <Select
                  placeholder="Select role category"
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  options={ROLE_CATEGORIES}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Department
                  </span>
                }
                name="department"
                rules={[
                  { required: true, message: "Please select department" },
                ]}
              >
                <Select
                  placeholder="Select department"
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  options={DEPARTMENTS}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Industry
                  </span>
                }
                name="industry"
                rules={[
                  { required: true, message: "Please select industry" },
                ]}
              >
                <Select
                  placeholder="Select industry"
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  options={INDUSTRIES}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Education (UG / Degree)
                  </span>
                }
                name="education"
                rules={[
                  { required: true, message: "Please select education" },
                ]}
              >
                <Select
                  placeholder="e.g., B.Tech / B.E."
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  options={EDUCATION_OPTIONS}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Specialization
                  </span>
                }
                name="education_specialization"
                rules={[
                  {
                    required: true,
                    message: "Please select specialization",
                  },
                ]}
              >
                <Select
                  placeholder="e.g., Any Specialization"
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  options={EDUCATION_SPECIALIZATIONS}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Qualifications
                  </span>
                }
                name="qualifications"
                rules={[
                  {
                    required: true,
                    message: "Please enter qualifications",
                  },
                  {
                    min: 10,
                    message: "Qualifications must be at least 10 characters",
                  },
                ]}
                extra="e.g., Bachelor's or Master's degree in Computer Science, IT, Engineering, or a related field."
              >
                <TextArea
                  rows={3}
                  placeholder="Describe education / qualification requirements..."
                  size="large"
                />
              </Form.Item>
            </Col>

            {sectionTitle("Job Content")}

            <Col span={24}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Job Description / Summary
                  </span>
                }
                name="description"
                rules={[
                  {
                    required: true,
                    validator: richTextMinLength(
                      20,
                      "Description must be at least 20 characters"
                    ),
                  },
                ]}
                trigger="onChange"
                validateTrigger={["onChange", "onBlur"]}
              >
                <RichTextEditor
                  placeholder="Job summary — who you are hiring and what the role involves..."
                  minHeight={140}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Key Responsibilities
                  </span>
                }
                name="key_responsibilities"
                rules={[
                  {
                    required: true,
                    validator: richTextMinLength(
                      10,
                      "Please add key responsibilities"
                    ),
                  },
                ]}
                trigger="onChange"
                validateTrigger={["onChange", "onBlur"]}
              >
                <RichTextEditor
                  placeholder="Use a bullet list for key responsibilities..."
                  minHeight={140}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Required Skills
                  </span>
                }
                name="required_skills"
                rules={[
                  {
                    required: true,
                    validator: richTextMinLength(
                      3,
                      "Please add required skills"
                    ),
                  },
                ]}
                trigger="onChange"
                validateTrigger={["onChange", "onBlur"]}
              >
                <RichTextEditor
                  placeholder="Bullet list of must-have technical and soft skills..."
                  minHeight={120}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Preferred Skills
                  </span>
                }
                name="preferred_skills"
                trigger="onChange"
                validateTrigger={["onChange", "onBlur"]}
                extra="Optional — nice-to-have skills and certifications"
              >
                <RichTextEditor
                  placeholder="Bullet list of preferred skills / certifications..."
                  minHeight={100}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Key Skills (tags)
                  </span>
                }
                name="key_skills"
                rules={[
                  {
                    type: "array",
                    min: 1,
                    message: "Add at least one key skill tag",
                  },
                ]}
                extra="Press Enter or comma to add — shown as skill chips"
              >
                <Select
                  mode="tags"
                  placeholder="e.g., ServiceNow, ITSM, Project Manager"
                  size="large"
                  tokenSeparators={[","]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Preferred Key Skills (tags)
                  </span>
                }
                name="preferred_key_skills"
                extra="Starred / preferred skill chips on Naukri-style listings"
              >
                <Select
                  mode="tags"
                  placeholder="e.g., CSA, CIS, CAD"
                  size="large"
                  tokenSeparators={[","]}
                />
              </Form.Item>
            </Col>

            {sectionTitle("Publishing")}

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
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
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
