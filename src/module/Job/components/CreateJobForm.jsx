"use client";

/**
 * CreateJobForm Component
 *
 * Full-page form for creating / editing jobs.
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
  richTextMinLength,
} from "../constants/jobFormOptions";
import { mapJobToFormValues } from "../utils/jobFormMapper";
import "./CreateJobForm.scss";

const { TextArea } = Input;

const fieldLabel = (text) => (
  <span className="C-heading size-xs semiBold mb-0">{text}</span>
);

const FormSection = ({ icon, title, description, children }) => (
  <div className="create-job-form__section">
    <div className="create-job-form__section-head">
      <div className="create-job-form__section-icon">
        <Icon name={icon} />
      </div>
      <div className="create-job-form__section-copy">
        <h5 className="create-job-form__section-title">{title}</h5>
        {description ? (
          <p className="create-job-form__section-desc">{description}</p>
        ) : null}
      </div>
    </div>
    <Row gutter={[16, 0]}>{children}</Row>
  </div>
);

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

    useEffect(() => {
      form.resetFields();
      if (isEdit && initialJob) {
        form.setFieldsValue(mapJobToFormValues(initialJob));
        return;
      }
      form.setFieldsValue({
        status: "pending",
        isActive: true,
        work_mode: "Office",
        openings: 1,
        salary_not_disclosed: false,
        employment_nature: "Permanent",
        job_posted_date: dayjs(),
      });
    }, [form, isEdit, initialJob]);

    /** Accept free text or numeric ranges; no currency symbol. */
    const parseSalaryRange = useCallback((rangeString) => {
      if (!rangeString) return { min: "", max: "" };

      const trimmed = String(rangeString).trim();
      if (!trimmed) return { min: "", max: "" };

      const match = trimmed.match(/^(.+?)\s*-\s*(.+)$/);
      if (match) {
        return {
          min: match[1].trim(),
          max: match[2].trim(),
        };
      }

      return { min: trimmed, max: trimmed };
    }, []);

    const handleSubmit = useCallback(async () => {
      try {
        setIsSubmitting(true);

        const values = await form.validateFields();

        const salaryNotDisclosedValue = !!values.salary_not_disclosed;
        const salaryRange = salaryNotDisclosedValue
          ? { min: "Not Disclosed", max: "Not Disclosed" }
          : parseSalaryRange(values.salary_range);

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
          skillsRequired: values.required_skills || "",
          weOffer: values.we_offer || "",
          qualifications: values.qualifications || "",
          employmentType: values.employment_type,
          employmentNature: values.employment_nature || "Permanent",
          workMode: values.work_mode || "Office",
          openings: values.openings != null ? Number(values.openings) : 1,
          jobPostedDate: values.job_posted_date
            ? dayjs(values.job_posted_date).format("YYYY-MM-DD")
            : null,
          applicationDeadline: values.application_deadline
            ? dayjs(values.application_deadline).format("YYYY-MM-DD")
            : null,
          status: "pending",
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

    return (
      <Spin spinning={isBusy} tip={isEdit ? "Updating job..." : "Posting job..."}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: "pending",
            isActive: true,
            work_mode: "Office",
            openings: 1,
            salary_not_disclosed: false,
            employment_nature: "Permanent",
            job_posted_date: dayjs(),
          }}
          className="create-job-form"
          disabled={isBusy}
        >
          <FormSection
            icon="badge"
            title="Basic Details"
            description="Core job information candidates see first"
          >
            <Col span={24}>
              <Form.Item
                label={fieldLabel("Job Title")}
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

            <Col xs={24} md={12}>
              <Form.Item
                label={fieldLabel("Experience Required")}
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

            <Col xs={24} md={12}>
              <Form.Item
                label={fieldLabel("Employment Type")}
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

            <Col xs={24} md={12}>
              <Form.Item
                label={fieldLabel("Employment Nature")}
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

            <Col xs={24} md={12}>
              <Form.Item
                label={fieldLabel("Work Mode")}
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

            <Col xs={24} md={12}>
              <Form.Item
                label={fieldLabel("Number of Openings")}
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

            <Col span={24}>
              <Form.Item
                label={fieldLabel("Qualifications")}
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
          </FormSection>

          <FormSection
            icon="payments"
            title="Compensation"
            description="Salary details shown on the job listing"
          >
            <Col span={24}>
              <Form.Item
                name="salary_not_disclosed"
                valuePropName="checked"
                className="mb-2"
              >
                <Checkbox>Salary not disclosed</Checkbox>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={fieldLabel("Salary Range")}
                name="salary_range"
                rules={
                  salaryNotDisclosed
                    ? []
                    : [
                        {
                          required: true,
                          message: "Please enter salary range",
                        },
                      ]
                }
                extra={
                  salaryNotDisclosed
                    ? "Salary will show as Not Disclosed"
                    : "Enter text or numbers — e.g. 50000-80000, 10-15 LPA, Competitive"
                }
              >
                <Input
                  placeholder="e.g., 50000-80000 or 10-15 LPA"
                  size="large"
                  disabled={salaryNotDisclosed}
                />
              </Form.Item>
            </Col>
          </FormSection>

          <FormSection
            icon="location_on"
            title="Job Location"
            description="Where the role is based"
          >
            <Col xs={24} md={12}>
              <Form.Item
                label={fieldLabel("Country")}
                name={["location", "country"]}
                rules={[
                  { required: true, message: "Please select country" },
                ]}
              >
                <Select
                  placeholder="Select Country"
                  size="large"
                  showSearch
                  filterOption={(input, option) => {
                    const query = String(input ?? "")
                      .trim()
                      .toLowerCase();
                    if (!query) return true;
                    const label = String(option?.label ?? "")
                      .trim()
                      .toLowerCase();
                    return label.startsWith(query);
                  }}
                  options={countrySelectOptions}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={fieldLabel("State/Province")}
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

            <Col xs={24} md={12}>
              <Form.Item
                label={fieldLabel("City")}
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

            <Col xs={24} md={12}>
              <Form.Item
                label={fieldLabel("Pincode/ZIP")}
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
          </FormSection>

          <FormSection
            icon="description"
            title="Job Content"
            description="Description, responsibilities, skills, and what you offer"
          >
            <Col span={24}>
              <Form.Item
                label={fieldLabel("Job Description / Summary")}
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
                label={fieldLabel("Key Responsibilities")}
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
                label={fieldLabel("Required Skills")}
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
                label={fieldLabel("We Offer")}
                name="we_offer"
                rules={[
                  {
                    required: true,
                    validator: richTextMinLength(
                      3,
                      "Please add what the company offers"
                    ),
                  },
                ]}
                trigger="onChange"
                validateTrigger={["onChange", "onBlur"]}
                extra="Benefits, Insurance, Bonus, Accommodation, Food, Transportation, Paid Leave, Training, and other employee benefits"
              >
                <RichTextEditor
                  placeholder="What the company offers — benefits, insurance, bonus, accommodation, food, transportation, paid leave, training..."
                  minHeight={120}
                />
              </Form.Item>
            </Col>
          </FormSection>

          <FormSection
            icon="publish"
            title="Publishing"
            description="Posted date, deadline, and visibility settings"
          >
            <Col xs={24} md={8}>
              <Form.Item
                label={fieldLabel("Job Posted Date")}
                name="job_posted_date"
                rules={[
                  {
                    required: true,
                    message: "Please select job posted date",
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

            <Col xs={24} md={8}>
              <Form.Item
                label={fieldLabel("Application Deadline")}
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

            <Col xs={24} md={8}>
              <Form.Item
                label={fieldLabel("Active Status")}
                name="isActive"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
              </Form.Item>
            </Col>
          </FormSection>

          <div className="create-job-form__actions">
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
