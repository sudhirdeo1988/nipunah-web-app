"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Alert,
  Divider,
  DatePicker,
  message,
  Radio,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  EMPLOYMENT_TYPES,
  INITIAL_VALUES,
  formatMonthYearToken,
  parseMonthYearRange,
  parseMonthYearToken,
} from "./constants";
import CountryDetails from "@/utilities/CountryDetails.json";
import { expertBasicInfoFormValues } from "@/utilities/expertProfileNormalize";
import DigitsOnlyInput from "@/components/DigitsOnlyInput";
import { digitsOnlyNormalize } from "@/utilities/numericInput";
import "./BecomeExpertModal.scss";

const { TextArea } = Input;

/** Coerce arbitrary form values into a dayjs instance (or null). */
const toDayjs = (value) => {
  if (!value) return null;
  if (typeof value?.isValid === "function") {
    return value.isValid() ? value : null;
  }
  const candidate = dayjs(value);
  return candidate.isValid() ? candidate : null;
};

/**
 * Disable months strictly after the current month so the user can pick the
 * current month-and-year but not any future one. Antd's month-picker passes
 * a dayjs at the start of each candidate month.
 */
const disableFutureMonths = (current) => {
  if (!current) return false;
  const candidate = current.startOf("month");
  const thisMonth = dayjs().startOf("month");
  return candidate.isAfter(thisMonth);
};

/**
 * Normalize incoming form values so the From / To year pickers are populated
 * from an existing wire-format string (edit-profile flow).
 *
 * - Work experience: `fromDate` / `toDate` ("MMM YYYY") or legacy `companyWorkDuration`.
 * - Education: `fromDate` / `toDate` or legacy `timePeriod`.
 *
 * Falls back to the default INITIAL_VALUES shape if nothing usable is passed.
 */
const normalizeInitialValues = (incoming) => {
  const base =
    incoming && typeof incoming === "object" && !Array.isArray(incoming)
      ? incoming
      : {};

  const incomingWE = Array.isArray(base.workExperience)
    ? base.workExperience
    : Array.isArray(base.workExperienceDTO)
    ? base.workExperienceDTO
    : [];
  const workExperience = incomingWE.length
    ? incomingWE.map((entry) => {
        const fromStr = entry?.fromDate;
        const toStr = entry?.toDate;
        const fromApi =
          typeof fromStr === "string" && fromStr.trim()
            ? parseMonthYearToken(fromStr.trim())
            : null;
        const toApi =
          typeof toStr === "string" && toStr.trim()
            ? parseMonthYearToken(toStr.trim())
            : null;
        const parsed = parseMonthYearRange(entry?.companyWorkDuration);
        return {
          jobTitle: entry?.jobTitle ?? "",
          employmentType: entry?.employmentType,
          company: entry?.company ?? "",
          isCurrentJob: Boolean(entry?.isCurrentJob),
          companyWorkDurationFrom:
            toDayjs(entry?.companyWorkDurationFrom) ??
            (fromApi && fromApi.isValid() ? fromApi : undefined) ??
            parsed.from,
          companyWorkDurationTo:
            toDayjs(entry?.companyWorkDurationTo) ??
            (toApi && toApi.isValid() ? toApi : undefined) ??
            parsed.to,
        };
      })
    : INITIAL_VALUES.workExperience;

  const incomingEdu = Array.isArray(base.education)
    ? base.education
    : Array.isArray(base.educationDTO)
    ? base.educationDTO
    : [];
  const education = incomingEdu.length
    ? incomingEdu.map((entry) => {
        const fromStr = entry?.fromDate;
        const toStr = entry?.toDate;
        const fromApi =
          typeof fromStr === "string" && fromStr.trim()
            ? parseMonthYearToken(fromStr.trim())
            : null;
        const toApi =
          typeof toStr === "string" && toStr.trim()
            ? parseMonthYearToken(toStr.trim())
            : null;
        const parsed = parseMonthYearRange(entry?.timePeriod);
        return {
          title: entry?.title ?? "",
          schoolCollege: entry?.schoolCollege ?? "",
          isCurrentlyServing: Boolean(entry?.isCurrentlyServing),
          timePeriodFrom:
            toDayjs(entry?.timePeriodFrom) ??
            (fromApi && fromApi.isValid() ? fromApi : undefined) ??
            parsed.from,
          timePeriodTo:
            toDayjs(entry?.timePeriodTo) ??
            (toApi && toApi.isValid() ? toApi : undefined) ??
            parsed.to,
          description: entry?.description ?? "",
        };
      })
    : INITIAL_VALUES.education;

  const rawSkills = Array.isArray(base.skills)
    ? base.skills
    : Array.isArray(base.skillDTO)
    ? base.skillDTO.map((item) =>
        typeof item === "string" ? item : item?.skill ?? ""
      )
    : [];

  return {
    workExperience,
    skills: rawSkills.length ? rawSkills : INITIAL_VALUES.skills,
    education,
  };
};

/**
 * Reusable "Become an expert" modal with full form.
 * Handles: Work Experience, Roles & Responsibilities, Skills, Education.
 * Loading and error states included. Pass onSubmit and API base URL or use default.
 */
const startsWithFilter = (input, option) =>
  String(option?.label || "")
    .toLowerCase()
    .startsWith(String(input || "").toLowerCase());

const BecomeExpertModal = ({
  open,
  onCancel,
  onSubmit,
  submitApiUrl,
  title = "Upgrade to expert profile (Free)",
  okText = "Submit",
  variant = "modal",
  closeAfterSubmit = true,
  successMessage = "Application submitted successfully.",
  onSuccess,
  initialValues,
  includeBasicInfo = false,
  profileData = null,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isPageVariant = variant === "page";

  // Normalize once per incoming initialValues so edit flows can pass API
  // `fromDate`/`toDate` strings or legacy `companyWorkDuration` / `timePeriod`.
  const countryCodeOptions = useMemo(() => {
    if (!includeBasicInfo) return [];
    return (Array.isArray(CountryDetails) ? CountryDetails : []).map((c) => ({
      label: `${c.countryName} (${c.dailCode})`,
      value: c.dailCode,
      searchLabel: `${c.countryName} ${c.dailCode}`,
    }));
  }, [includeBasicInfo]);

  const countryOptions = useMemo(() => {
    if (!includeBasicInfo) return [];
    return (Array.isArray(CountryDetails) ? CountryDetails : []).map((c) => ({
      label: c.countryName,
      value: c.countryName,
    }));
  }, [includeBasicInfo]);

  const normalizedInitialValues = useMemo(() => {
    const career = normalizeInitialValues(initialValues);
    if (!includeBasicInfo) return career;
    const basic = expertBasicInfoFormValues(profileData || initialValues || {});
    return { ...basic, ...career };
  }, [initialValues, includeBasicInfo, profileData]);

  // If the caller hands us fresh initialValues after mount (e.g. async
  // edit-profile fetch resolves), reset the antd form so the UI reflects it.
  useEffect(() => {
    if (initialValues) {
      form.resetFields();
      form.setFieldsValue(normalizedInitialValues);
    }
  }, [normalizedInitialValues, initialValues, form]);

  const handleClose = useCallback(() => {
    setError(null);
    form.resetFields();
    onCancel?.();
  }, [form, onCancel]);

  const handleSubmit = useCallback(
    async (values) => {
      setError(null);
      setLoading(true);
      try {
        const merged = form.getFieldsValue(true);
        const workRows = Array.isArray(merged.workExperience)
          ? merged.workExperience
          : values.workExperience;
        const eduRows = Array.isArray(merged.education)
          ? merged.education
          : values.education;

        const workExperience = Array.isArray(workRows)
          ? workRows.map((entry) => {
              const fromD = toDayjs(entry?.companyWorkDurationFrom);
              const toD = toDayjs(entry?.companyWorkDurationTo);
              return {
                jobTitle: entry?.jobTitle ?? "",
                employmentType: entry?.employmentType,
                company: entry?.company ?? "",
                fromDate: formatMonthYearToken(fromD) || "",
                toDate: formatMonthYearToken(toD) || "",
                isCurrentJob: Boolean(entry?.isCurrentJob),
              };
            })
          : [];

        const education = (eduRows ?? []).map((e) => {
          const fromD = toDayjs(e?.timePeriodFrom);
          const toD = toDayjs(e?.timePeriodTo);
          return {
            title: e?.title ?? "",
            schoolCollege: e?.schoolCollege ?? "",
            fromDate: formatMonthYearToken(fromD) || "",
            toDate: formatMonthYearToken(toD) || "",
            description: e?.description ?? "",
            isCurrentlyServing: Boolean(e?.isCurrentlyServing),
          };
        });

        const payload = {
          workExperience,
          skills: (values.skills ?? []).filter(Boolean),
          education,
        };

        if (includeBasicInfo) {
          const mergedBasic = form.getFieldsValue(true);
          const email = mergedBasic.email ?? values.email ?? "";
          Object.assign(payload, {
            first_name: mergedBasic.first_name ?? values.first_name ?? "",
            last_name: mergedBasic.last_name ?? values.last_name ?? "",
            email,
            username: mergedBasic.username || email || "",
            contact_country_code:
              mergedBasic.contact_country_code ?? values.contact_country_code,
            contact_number:
              mergedBasic.contact_number ?? values.contact_number ?? "",
            address: mergedBasic.address ?? values.address ?? {},
          });
        }

        if (typeof onSubmit === "function") {
          await onSubmit(payload);
        } else if (submitApiUrl) {
          const res = await fetch(submitApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data?.message || data?.error || "Failed to submit");
          }
        }
        if (successMessage) {
          message.success(successMessage);
        }
        onSuccess?.();
        if (closeAfterSubmit) {
          handleClose();
        }
      } catch (err) {
        setError(err?.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [
      form,
      onSubmit,
      submitApiUrl,
      handleClose,
      closeAfterSubmit,
      successMessage,
      onSuccess,
      includeBasicInfo,
    ]
  );

  const content = (
    <>
      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          closable
          onClose={() => setError(null)}
          className="mb-3"
        />
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={normalizedInitialValues}
        onFinish={handleSubmit}
      >
        {includeBasicInfo ? (
          <>
            <div className="becomeExpertModal__section">
              <h4 className="becomeExpertModal__sectionTitle">Basic information</h4>
              <div className="becomeExpertModal__twoColRow">
                <Form.Item
                  name="first_name"
                  label="First name"
                  rules={[{ required: true, message: "First name is required." }]}
                >
                  <Input placeholder="First name" />
                </Form.Item>
                <Form.Item
                  name="last_name"
                  label="Last name"
                  rules={[{ required: true, message: "Last name is required." }]}
                >
                  <Input placeholder="Last name" />
                </Form.Item>
              </div>
              <div className="becomeExpertModal__twoColRow">
                <Form.Item name="email" label="Email">
                  <Input type="email" disabled />
                </Form.Item>
                <Form.Item name="username" label="Username">
                  <Input disabled placeholder="Same as email" />
                </Form.Item>
              </div>
              <Form.Item label="Contact number" required>
                <Space.Compact block>
                  <Form.Item
                    name="contact_country_code"
                    noStyle
                    rules={[{ required: true, message: "Select country code" }]}
                  >
                    <Select
                      showSearch
                      placeholder="Code"
                      style={{ width: "38%" }}
                      options={countryCodeOptions}
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        String(option?.searchLabel || "")
                          .toLowerCase()
                          .startsWith(String(input || "").toLowerCase())
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    name="contact_number"
                    noStyle
                    normalize={digitsOnlyNormalize(15)}
                    rules={[
                      { required: true, message: "Enter contact number" },
                      {
                        pattern: /^\d{7,15}$/,
                        message: "Enter a valid phone number (7-15 digits)",
                      },
                    ]}
                  >
                    <DigitsOnlyInput
                      placeholder="Phone number"
                      maxLength={15}
                      style={{ width: "62%" }}
                    />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
            </div>

            <div className="becomeExpertModal__section">
              <h4 className="becomeExpertModal__sectionTitle">Address</h4>
              <div className="becomeExpertModal__twoColRow">
                <Form.Item name={["address", "country"]} label="Country">
                  <Select
                    showSearch
                    placeholder="Select country"
                    options={countryOptions}
                    optionFilterProp="label"
                    filterOption={startsWithFilter}
                    allowClear
                  />
                </Form.Item>
                <Form.Item
                  name={["address", "state"]}
                  label="State"
                  rules={[
                    {
                      pattern: /^[A-Za-z\s]*$/,
                      message: "Only alphabets and spaces are allowed.",
                    },
                  ]}
                >
                  <Input placeholder="State / province" />
                </Form.Item>
              </div>
              <div className="becomeExpertModal__twoColRow">
                <Form.Item name={["address", "city"]} label="City">
                  <Input placeholder="City" />
                </Form.Item>
                <Form.Item
                  name={["address", "postal_code"]}
                  label="Postal code"
                  normalize={digitsOnlyNormalize(10)}
                  rules={[
                    {
                      pattern: /^\d{4,10}$/,
                      message: "Postal code must be 4-10 digits.",
                    },
                  ]}
                >
                  <DigitsOnlyInput placeholder="Postal code" maxLength={10} />
                </Form.Item>
              </div>
              <Form.Item name={["address", "location"]} label="Location">
                <Input placeholder="Street / area" />
              </Form.Item>
            </div>

            <Divider />
          </>
        ) : null}

        {/* Work Experience (multiple, with delete; at least one block) */}
        <div className="becomeExpertModal__section">
          <h4 className="becomeExpertModal__sectionTitle">Work Experience</h4>
          <Form.List name="workExperience">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }, index) => (
                  <div
                    key={key}
                    className="becomeExpertModal__educationBlock"
                  >
                    <div className="becomeExpertModal__twoColRow">
                      <Form.Item
                        {...rest}
                        name={[name, "jobTitle"]}
                        label="Job title"
                      >
                        <Input placeholder="e.g. Senior Engineer" />
                      </Form.Item>
                      <Form.Item
                        name={[name, "employmentType"]}
                        label="Employment type"
                      >
                        <Select
                          placeholder="Select type"
                          allowClear
                          options={EMPLOYMENT_TYPES}
                        />
                      </Form.Item>
                    </div>
                    <Form.Item
                      name={[name, "company"]}
                      label="Company"
                    >
                      <Input placeholder="Company name" />
                    </Form.Item>
                    <div className="becomeExpertModal__fieldGroup">
                      <div className="becomeExpertModal__fieldGroupTitle">
                        Company work duration (month &amp; year)
                      </div>
                      <div className="becomeExpertModal__twoColRow">
                        <Form.Item
                          name={[name, "companyWorkDurationFrom"]}
                          label="From"
                        >
                          <DatePicker
                            picker="month"
                            format="MMM YYYY"
                            placeholder="From month / year"
                            allowClear
                            style={{ width: "100%" }}
                            disabledDate={disableFutureMonths}
                          />
                        </Form.Item>
                        <Form.Item
                          name={[name, "companyWorkDurationTo"]}
                          label="To"
                          dependencies={[
                            ["workExperience", name, "companyWorkDurationFrom"],
                          ]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const to = toDayjs(value);
                                if (!to) return Promise.resolve();
                                const from = toDayjs(
                                  getFieldValue([
                                    "workExperience",
                                    name,
                                    "companyWorkDurationFrom",
                                  ])
                                );
                                if (
                                  from &&
                                  to.startOf("month").isBefore(from.startOf("month"))
                                ) {
                                  return Promise.reject(
                                    new Error(
                                      "To must be greater than or equal to From"
                                    )
                                  );
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                        >
                          <DatePicker
                            picker="month"
                            format="MMM YYYY"
                            placeholder="To month / year"
                            allowClear
                            style={{ width: "100%" }}
                            disabledDate={disableFutureMonths}
                          />
                        </Form.Item>
                      </div>
                    </div>
                    <Form.Item label="Current job">
                      <Radio
                        checked={Boolean(
                          form.getFieldValue(["workExperience", name, "isCurrentJob"])
                        )}
                        onChange={() => {
                          const list = form.getFieldValue("workExperience") || [];
                          const next = list.map((row, idx) => ({
                            ...row,
                            isCurrentJob: idx === name,
                          }));
                          form.setFieldsValue({ workExperience: next });
                        }}
                      >
                        This is my current job
                      </Radio>
                    </Form.Item>
                    <div className="becomeExpertModal__educationActions">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        disabled={fields.length === 1}
                      >
                        Delete experience
                      </Button>
                    </div>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() =>
                      add({
                        jobTitle: "",
                        employmentType: undefined,
                        company: "",
                        isCurrentJob: false,
                        companyWorkDurationFrom: undefined,
                        companyWorkDurationTo: undefined,
                      })
                    }
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Work Experience
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </div>

        <Divider />

          {/* Skills */}
          <div className="becomeExpertModal__section">
            <h4 className="becomeExpertModal__sectionTitle">
              Add Skills (text)
            </h4>
            <Form.List name="skills">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...rest }) => (
                    <div key={key} className="becomeExpertModal__listRow">
                      <Form.Item {...rest} name={name} noStyle>
                        <Input placeholder="Skill" />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        aria-label="Delete"
                        className="becomeExpertModal__deleteBtn"
                      />
                    </div>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add("")}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Skill
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          <Divider />

          {/* Education */}
          <div className="becomeExpertModal__section">
            <h4 className="becomeExpertModal__sectionTitle">Education</h4>
            <Form.List name="education">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...rest }) => (
                    <div key={key} className="becomeExpertModal__educationBlock">
                      <div className="becomeExpertModal__twoColRow">
                        <Form.Item
                          {...rest}
                          name={[name, "title"]}
                          label="Title"
                          rules={[{ required: false }]}
                        >
                          <Input placeholder="e.g. B.Tech, MBA" />
                        </Form.Item>
                        <Form.Item
                          name={[name, "schoolCollege"]}
                          label="School/College"
                        >
                          <Input placeholder="Institution name" />
                        </Form.Item>
                      </div>
                      <div className="becomeExpertModal__fieldGroup">
                        <div className="becomeExpertModal__fieldGroupTitle">
                          Time period (month &amp; year)
                        </div>
                        <div className="becomeExpertModal__twoColRow">
                          <Form.Item
                            name={[name, "timePeriodFrom"]}
                            label="From"
                          >
                            <DatePicker
                              picker="month"
                              format="MMM YYYY"
                              placeholder="From month / year"
                              allowClear
                              style={{ width: "100%" }}
                              disabledDate={disableFutureMonths}
                            />
                          </Form.Item>
                          <Form.Item
                            name={[name, "timePeriodTo"]}
                            label="To"
                            dependencies={[
                              ["education", name, "timePeriodFrom"],
                            ]}
                            rules={[
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  const to = toDayjs(value);
                                  if (!to) return Promise.resolve();
                                  const from = toDayjs(
                                    getFieldValue([
                                      "education",
                                      name,
                                      "timePeriodFrom",
                                    ])
                                  );
                                  if (
                                    from &&
                                    to
                                      .startOf("month")
                                      .isBefore(from.startOf("month"))
                                  ) {
                                    return Promise.reject(
                                      new Error(
                                        "To must be greater than or equal to From"
                                      )
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              }),
                            ]}
                          >
                            <DatePicker
                              picker="month"
                              format="MMM YYYY"
                              placeholder="To month / year"
                              allowClear
                              style={{ width: "100%" }}
                              disabledDate={disableFutureMonths}
                            />
                          </Form.Item>
                        </div>
                      </div>
                      <Form.Item label="Currently serving">
                        <Radio
                          checked={Boolean(
                            form.getFieldValue([
                              "education",
                              name,
                              "isCurrentlyServing",
                            ])
                          )}
                          onChange={() => {
                            const list = form.getFieldValue("education") || [];
                            const next = list.map((row, idx) => ({
                              ...row,
                              isCurrentlyServing: idx === name,
                            }));
                            form.setFieldsValue({ education: next });
                          }}
                        >
                          I am currently studying here
                        </Radio>
                      </Form.Item>
                      <Form.Item
                        name={[name, "description"]}
                        label="Description"
                      >
                        <TextArea rows={2} placeholder="Brief description" />
                      </Form.Item>
                      <div className="becomeExpertModal__educationActions">
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() =>
                        add({
                          title: "",
                          schoolCollege: "",
                          isCurrentlyServing: false,
                          timePeriodFrom: undefined,
                          timePeriodTo: undefined,
                          description: "",
                        })
                      }
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Education
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

        <div className="becomeExpertModal__footer">
          <Space>
            <Button onClick={handleClose} disabled={loading}>
              {isPageVariant ? "Back to dashboard" : "Cancel"}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {okText}
            </Button>
          </Space>
        </div>
      </Form>
    </>
  );

  if (isPageVariant) {
    return (
      <div className="becomeExpertModal becomeExpertModal--page">
        <div className="becomeExpertModal__pageCard">{content}</div>
      </div>
    );
  }

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={640}
      className="becomeExpertModal"
      destroyOnClose
      maskClosable={!loading}
      closable={!loading}
    >
      {content}
    </Modal>
  );
};

export default BecomeExpertModal;
