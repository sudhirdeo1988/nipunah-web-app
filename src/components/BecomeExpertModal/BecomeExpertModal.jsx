"use client";

import React, { useCallback, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Alert,
  Divider,
  message,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { EMPLOYMENT_TYPES, INITIAL_VALUES } from "./constants";
import "./BecomeExpertModal.scss";

const { TextArea } = Input;

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
  title = "Become an Expert",
  okText = "Submit",
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        const payload = {
          workExperience: Array.isArray(values.workExperience)
            ? values.workExperience
            : [],
          skills: (values.skills ?? []).filter(Boolean),
          education: (values.education ?? []).map((e) => ({
            title: e?.title ?? "",
            schoolCollege: e?.schoolCollege ?? "",
            timePeriod: e?.timePeriod ?? "",
            description: e?.description ?? "",
          })),
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
        message.success("Application submitted successfully.");
        handleClose();
      } catch (err) {
        setError(err?.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [onSubmit, submitApiUrl, handleClose]
  );

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
        initialValues={INITIAL_VALUES}
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
                    <div className="becomeExpertModal__twoColRow">
                      <Form.Item
                        name={[name, "company"]}
                        label="Company"
                      >
                        <Input placeholder="Company name" />
                      </Form.Item>
                      <Form.Item
                        name={[name, "companyWorkDuration"]}
                        label="Company work duration"
                      >
                        <Input placeholder="e.g. 2020 – Present or 2 years" />
                      </Form.Item>
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
                        companyWorkDuration: "",
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
                      <Form.Item
                        name={[name, "timePeriod"]}
                        label="Time period"
                      >
                        <Input placeholder="e.g. 2015 – 2019" />
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
                          timePeriod: "",
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
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {okText}
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default BecomeExpertModal;
