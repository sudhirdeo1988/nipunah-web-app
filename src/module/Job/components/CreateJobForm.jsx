"use client";

/**
 * CreateJobForm Component
 *
 * Full-page form for creating (POST) new jobs — Naukri-aligned field set + rich text.
 *
 * @param {Function} onCancel - Cancel / back handler
 * @param {Function} onSubmit - Submit handler (receives payload)
 * @param {Object} companyInfo - Optional company info
 */

import React, { memo, useCallback, useState, useEffect, useMemo } from "react";
import {
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
  Space,
} from "antd";
import Icon from "@/components/Icon";
import CountryDetails from "@/utilities/CountryDetails.json";
import { startsWithSelectFilter } from "@/utilities/selectFilters";
import { map as _map, find as _find } from "lodash-es";
import { jobService } from "@/utilities/apiServices";
import dayjs from "dayjs";
import { useRole } from "@/hooks/useRole";
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
} from "../constants/jobFormOptions";
import { mapJobToFormValues } from "../utils/jobFormMapper";

const { TextArea } = Input;

const CreateJobForm = memo(
  ({
    onCancel,
    onSubmit,
    companyInfo: propCompanyInfo,
    loading: externalLoading,
    mode = "create",
    initialJob = null,
  }) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const salaryNotDisclosed = Form.useWatch("salary_not_disclosed", form);
    const { user } = useRole();
    const isBusy = Boolean(externalLoading || isSubmitting);
    const isEdit = mode === "edit";

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

    useEffect(() => {
      form.resetFields();
      if (isEdit && initialJob) {
        form.setFieldsValue(mapJobToFormValues(initialJob));
        return;
      }
      form.setFieldsValue({
        status: "pending",
        isActive: true,
        currency: "USD",
        work_mode: "Office",
        openings: 1,
        salary_not_disclosed: false,
        employment_nature: "Permanent",
        key_skills: [],
        preferred_key_skills: [],
      });
    }, [form, isEdit, initialJob]);

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
          postedBy: isEdit
            ? {
                companyId:
                  initialJob?.postedBy?.companyId ||
                  companyInfo?.company_id ||
                  null,
                companyName:
                  initialJob?.postedBy?.companyName ||
                  companyInfo?.company_name ||
                  "",
                companyShortName:
                  initialJob?.postedBy?.companyShortName ||
                  companyInfo?.company_short_name ||
                  "",
              }
            : {
                companyId: companyInfo?.company_id || values.company_id || null,
                companyName:
                  companyInfo?.company_name || values.company_name || "",
                companyShortName:
                  companyInfo?.company_short_name ||
                  values.company_short_name ||
                  "",
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
          // Keep skillsRequired as requiredSkills HTML for backward compatibility
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

        console.log(
          `\n📦 ========== ${isEdit ? "UPDATE" : "CREATE"} JOB FORM PAYLOAD ==========`
        );
        console.log(JSON.stringify(payload, null, 2));
        console.log("📦 =================================================\n");

        if (onSubmit && typeof onSubmit === "function") {
          await onSubmit(payload);
          form.resetFields();
          onCancel();
        } else {
          const response = await jobService.createJob(payload);
          const isSuccess =
            response?.success !== false &&
            (response?.data !== undefined ||
              response?.id !== undefined ||
              response?.job_id !== undefined ||
              response?.jobId !== undefined);

          if (isSuccess) {
            message.success(
              response?.message || "Job posted successfully!"
            );
            form.resetFields();
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
        console.error(isEdit ? "Update job error:" : "Create job error:", error);

        if (error?.errorFields) {
          message.error("Please fill all required fields correctly");
          return;
        }

        // Parent (useJob) already toasts API errors when onSubmit is used
        if (!onSubmit) {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Failed to post job. Please try again.";
          message.error(errorMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
    }, [
      form,
      onSubmit,
      onCancel,
      companyInfo,
      currencyOptions,
      parseSalaryRange,
      isEdit,
      initialJob,
    ]);

    const handleCancel = useCallback(() => {
      if (!isBusy) {
        form.resetFields();
        onCancel();
      }
    }, [form, onCancel, isBusy]);

    const sectionTitle = (label) => (
      <Col span={24}>
        <div className="border-top pt-3 mt-2 mb-3">
          <h5 className="C-heading size-xs bold mb-0">{label}</h5>
        </div>
      </Col>
    );

    return (
      <Spin spinning={isBusy} tip={isEdit ? "Updating job..." : "Posting job..."}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: "pending",
            isActive: true,
            currency: "USD",
            work_mode: "Office",
            openings: 1,
            salary_not_disclosed: false,
            employment_nature: "Permanent",
            key_skills: [],
            preferred_key_skills: [],
          }}
          className="py-2"
          disabled={isBusy}
        >
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
                    <span className="C-heading size-xs semiBold mb-0">
                      City
                    </span>
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
                    <span className="C-heading size-xs semiBold mb-0">
                      Role
                    </span>
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

            <div className="d-flex justify-content-end border-top pt-3 mt-3">
              <Space>
                <Button
                  onClick={handleCancel}
                  className="C-button is-bordered"
                  disabled={isBusy}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={isBusy}
                  className="C-button is-filled"
                >
                  {isBusy
                    ? isEdit
                      ? "Updating..."
                      : "Posting..."
                    : isEdit
                    ? "Update Job"
                    : "Post Job"}
                </Button>
              </Space>
            </div>
          </Form>
        </Spin>
    );
  }
);

CreateJobForm.displayName = "CreateJobForm";

export default CreateJobForm;
