"use client";

import React, { memo, useEffect } from "react";
import { Modal, Form, Select, Input } from "antd";
import {
  APPLICATION_STATUS,
  UPDATABLE_APPLICATION_STATUSES,
  getStatusLabel,
} from "../../constants/applicationStatuses";
import "./JobManagementDetails.scss";

const { TextArea } = Input;

const UpdateStatusModal = memo(
  ({ open, candidate, onCancel, onSubmit, loading = false }) => {
    const [form] = Form.useForm();
    const status = Form.useWatch("status", form);

    useEffect(() => {
      if (!open || !candidate) return;
      form.setFieldsValue({
        status: UPDATABLE_APPLICATION_STATUSES.includes(candidate.status)
          ? candidate.status
          : APPLICATION_STATUS.UNDER_REVIEW,
        remarks: candidate.remarks || "",
      });
    }, [open, candidate, form]);

    const handleOk = async () => {
      try {
        const values = await form.validateFields();
        onSubmit?.(values.status, values.remarks?.trim() || "");
      } catch {
        // validation
      }
    };

    return (
      <Modal
        title={`Update status${candidate?.name ? ` — ${candidate.name}` : ""}`}
        open={open}
        onCancel={onCancel}
        onOk={handleOk}
        okText="Update"
        confirmLoading={loading}
        destroyOnClose
        width={480}
      >
        <Form form={form} layout="vertical" className="mt-2">
          <Form.Item
            name="status"
            label="Application status"
            rules={[{ required: true, message: "Select a status" }]}
          >
            <Select
              size="large"
              options={UPDATABLE_APPLICATION_STATUSES.map((key) => ({
                value: key,
                label: getStatusLabel(key),
              }))}
            />
          </Form.Item>
          <Form.Item
            name="remarks"
            className="candidate-remarks-field"
            label={
              <span className="candidate-remarks-field__label">
                {status === APPLICATION_STATUS.REJECTED
                  ? "Comments / remarks"
                  : "Remarks"}
                {status !== APPLICATION_STATUS.REJECTED ? (
                  <span className="candidate-remarks-field__optional">
                    {" "}
                    (optional)
                  </span>
                ) : null}
              </span>
            }
            rules={
              status === APPLICATION_STATUS.REJECTED
                ? [
                    {
                      required: true,
                      message: "Remarks are required when rejecting",
                    },
                  ]
                : []
            }
            extra="Notes for your hiring team — shown on the candidate profile."
          >
            <TextArea
              className="candidate-remarks-field__input"
              rows={3}
              placeholder="Add a clear note for your team..."
              maxLength={1000}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

UpdateStatusModal.displayName = "UpdateStatusModal";

export default UpdateStatusModal;
