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
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  EMPLOYMENT_TYPES,
  INITIAL_VALUES,
  formatMonthYearRange,
  parseMonthYearRange,
} from "./constants";
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
 * - Work experience: parses `companyWorkDuration`.
 * - Education: parses `timePeriod`.
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
    : [];
  const workExperience = incomingWE.length
    ? incomingWE.map((entry) => {
        const parsed = parseMonthYearRange(entry?.companyWorkDuration);
        return {
          jobTitle: entry?.jobTitle ?? "",
          employmentType: entry?.employmentType,
          company: entry?.company ?? "",
          companyWorkDurationFrom:
            toDayjs(entry?.companyWorkDurationFrom) ?? parsed.from,
          companyWorkDurationTo:
            toDayjs(entry?.companyWorkDurationTo) ?? parsed.to,
        };
      })
    : INITIAL_VALUES.workExperience;

  const incomingEdu = Array.isArray(base.education) ? base.education : [];
  const education = incomingEdu.length
    ? incomingEdu.map((entry) => {
        const parsed = parseMonthYearRange(entry?.timePeriod);
        return {
          title: entry?.title ?? "",
          schoolCollege: entry?.schoolCollege ?? "",
          timePeriodFrom: toDayjs(entry?.timePeriodFrom) ?? parsed.from,
          timePeriodTo: toDayjs(entry?.timePeriodTo) ?? parsed.to,
          description: entry?.description ?? "",
        };
      })
    : INITIAL_VALUES.education;

  return {
    workExperience,
    skills:
      Array.isArray(base.skills) && base.skills.length
        ? base.skills
        : INITIAL_VALUES.skills,
    education,
  };
};

/**
 * Reusable "Become an expert" modal with full form.
 * Handles: Work Experience, Roles & Responsibilities, Skills, Education.
 * Loading and error states included. Pass onSubmit and API base URL or use default.
 */
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
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isPageVariant = variant === "page";

  // Normalize once per incoming initialValues reference so an edit-profile
  // caller can pass existing data (including the wire-format
  // `companyWorkDuration` string) and have all selects pre-populated.
  const normalizedInitialValues = useMemo(
    () => normalizeInitialValues(initialValues),
    [initialValues]
  );

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
        const workExperience = Array.isArray(values.workExperience)
          ? values.workExperience.map((entry) => ({
              jobTitle: entry?.jobTitle ?? "",
              employmentType: entry?.employmentType,
              company: entry?.company ?? "",
              // Recombine the two month-year pickers into the single string
              // the API expects ("MMM YYYY - MMM YYYY"). Payload shape stays
              // a single `companyWorkDuration` string field.
              companyWorkDuration: formatMonthYearRange(
                toDayjs(entry?.companyWorkDurationFrom),
                toDayjs(entry?.companyWorkDurationTo)
              ),
            }))
          : [];

        const education = (values.education ?? []).map((e) => ({
          title: e?.title ?? "",
          schoolCollege: e?.schoolCollege ?? "",
          // Same pattern: combine the two month-year pickers into the API
          // `timePeriod` string. Single-string shape preserved.
          timePeriod: formatMonthYearRange(
            toDayjs(e?.timePeriodFrom),
            toDayjs(e?.timePeriodTo)
          ),
          description: e?.description ?? "",
        }));

        const payload = {
          workExperience,
          skills: (values.skills ?? []).filter(Boolean),
          education,
        };

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
    [onSubmit, submitApiUrl, handleClose, closeAfterSubmit, successMessage, onSuccess]
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
