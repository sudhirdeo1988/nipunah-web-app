"use client";

import React, { memo, useEffect } from "react";
import { Modal, Form, Input } from "antd";
import "./JobManagementDetails.scss";

const { TextArea } = Input;

const RejectCandidateModal = memo(
  ({ open, candidate, onCancel, onSubmit, loading = false }) => {
    const [form] = Form.useForm();

    useEffect(() => {
      if (!open) return;
      form.setFieldsValue({ remarks: "" });
    }, [open, form]);

    const handleOk = async () => {
      try {
        const values = await form.validateFields();
        onSubmit?.(values.remarks?.trim() || "");
      } catch {
        // validation errors
      }
    };

    return (
      <Modal
        title={`Reject candidate${candidate?.name ? ` — ${candidate.name}` : ""}`}
        open={open}
        onCancel={onCancel}
        onOk={handleOk}
        okText="Reject"
        okButtonProps={{ danger: true }}
        confirmLoading={loading}
        destroyOnClose
        width={480}
      >
        <div className="candidate-remarks-field">
          <p className="candidate-remarks-field__hint mb-2">
            Remarks are visible to your hiring team — be clear and specific.
          </p>
          <Form form={form} layout="vertical">
            <Form.Item
              name="remarks"
              label={
                <span className="candidate-remarks-field__label">
                  Comments / remarks
                </span>
              }
              rules={[
                { required: true, message: "Please add rejection remarks" },
                { min: 5, message: "Please add a bit more detail" },
              ]}
            >
              <TextArea
                className="candidate-remarks-field__input"
                rows={4}
                placeholder="e.g. Experience does not match the required range..."
                maxLength={1000}
                showCount
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  }
);

RejectCandidateModal.displayName = "RejectCandidateModal";

export default RejectCandidateModal;
