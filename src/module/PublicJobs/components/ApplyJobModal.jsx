"use client";

import React, { memo, useCallback, useEffect, useState } from "react";
import { Modal, Form, Upload, Button, message, Space } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import RichTextEditor from "@/components/RichTextEditor";
import { richTextMinLength } from "@/module/Job/constants/jobFormOptions";
import "./ApplyJobModal.scss";

const { Dragger } = Upload;

const ACCEPTED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_RESUME_MB = 5;

/**
 * Apply for Job modal — cover letter (rich text) + resume attach.
 */
const ApplyJobModal = memo(({ open, job, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFileList([]);
      setSubmitting(false);
    }
  }, [open, form]);

  const handleBeforeUpload = useCallback((file) => {
    const ext = `.${String(file.name || "")
      .split(".")
      .pop()
      .toLowerCase()}`;
    const typeOk =
      ACCEPTED_RESUME_TYPES.includes(file.type) ||
      ACCEPTED_EXTENSIONS.includes(ext);
    if (!typeOk) {
      message.error("Please upload a PDF or Word document (.pdf, .doc, .docx)");
      return Upload.LIST_IGNORE;
    }
    const sizeOk = file.size / 1024 / 1024 <= MAX_RESUME_MB;
    if (!sizeOk) {
      message.error(`Resume must be ${MAX_RESUME_MB}MB or smaller`);
      return Upload.LIST_IGNORE;
    }
    setFileList([file]);
    form.setFieldsValue({ resume: [file] });
    return false;
  }, [form]);

  const handleRemove = useCallback(() => {
    setFileList([]);
    form.setFieldsValue({ resume: [] });
  }, [form]);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const resumeFile = fileList[0] || values.resume?.[0]?.originFileObj || values.resume?.[0];

      const payload = {
        jobId: job?.id || job?.jobId,
        jobTitle: job?.title,
        companyName: job?.postedBy?.companyName,
        coverLetter: values.cover_letter || "",
        resume: resumeFile
          ? {
              name: resumeFile.name,
              size: resumeFile.size,
              type: resumeFile.type,
            }
          : null,
      };

      console.log("\n📨 APPLY JOB PAYLOAD:\n", JSON.stringify(payload, null, 2));

      if (onSubmit) {
        await onSubmit(payload, resumeFile);
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }
      message.success("Application submitted successfully!");
      form.resetFields();
      setFileList([]);
      onCancel?.();
    } catch (error) {
      if (error?.errorFields) {
        message.error("Please complete all required fields");
        return;
      }
      console.error("Apply job error:", error);
      message.error(
        error?.message || "Failed to submit application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }, [form, fileList, job, onSubmit, onCancel]);

  if (!job) return null;

  const locationLabel = [
    job.location?.city,
    job.location?.state,
    job.location?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Modal
      title={
        <span className="C-heading size-5 semiBold mb-0">Apply for Job</span>
      }
      open={open}
      onCancel={submitting ? undefined : onCancel}
      width={720}
      centered
      destroyOnClose
      className="apply-job-modal"
      footer={
        <Space>
          <Button
            className="C-button is-bordered"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            className="C-button is-filled"
            loading={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Submit application"}
          </Button>
        </Space>
      }
    >
      <div className="apply-job-modal__job">
        <div className="apply-job-modal__job-main">
          <h3 className="apply-job-modal__job-title">{job.title}</h3>
          <div className="apply-job-modal__job-meta">
            <span>{job.postedBy?.companyName || "Company"}</span>
            {job.experienceRequired ? (
              <>
                <span className="apply-job-modal__dot">·</span>
                <span>{job.experienceRequired}</span>
              </>
            ) : null}
            {locationLabel ? (
              <>
                <span className="apply-job-modal__dot">·</span>
                <span>{locationLabel}</span>
              </>
            ) : null}
            {job.workMode ? (
              <>
                <span className="apply-job-modal__dot">·</span>
                <span>{job.workMode}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        disabled={submitting}
        className="apply-job-modal__form"
        initialValues={{ cover_letter: "", resume: [] }}
      >
        <Form.Item
          label={
            <span className="C-heading size-xs semiBold mb-0">
              Cover letter
            </span>
          }
          name="cover_letter"
          rules={[
            {
              required: true,
              validator: richTextMinLength(
                20,
                "Please write a cover letter (at least 20 characters)"
              ),
            },
          ]}
          trigger="onChange"
          validateTrigger={["onChange", "onBlur"]}
          extra="Explain your interest and why you are a good fit for this role."
        >
          <RichTextEditor
            placeholder="Write a short cover message about your interest and suitability..."
            minHeight={220}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="C-heading size-xs semiBold mb-0">
              Attach resume
            </span>
          }
          name="resume"
          rules={[
            {
              required: true,
              validator: (_, value) => {
                const hasFile =
                  (Array.isArray(value) && value.length > 0) ||
                  fileList.length > 0;
                if (!hasFile) {
                  return Promise.reject(
                    new Error("Please attach your resume")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          extra={`PDF or Word (.pdf, .doc, .docx), max ${MAX_RESUME_MB}MB`}
        >
          <Dragger
            className="apply-job-modal__resume-upload"
            name="resume"
            multiple={false}
            maxCount={1}
            fileList={fileList.map((f, i) => ({
              uid: f.uid || `${i}`,
              name: f.name,
              status: "done",
              originFileObj: f,
            }))}
            beforeUpload={handleBeforeUpload}
            onRemove={handleRemove}
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag resume to upload
            </p>
          </Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
});

ApplyJobModal.displayName = "ApplyJobModal";

export default ApplyJobModal;
