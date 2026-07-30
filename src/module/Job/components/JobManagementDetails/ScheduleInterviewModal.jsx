"use client";

import React, { memo, useEffect } from "react";
import { Modal, Form, DatePicker, TimePicker, Select, Input } from "antd";
import dayjs from "dayjs";
import { INTERVIEW_MODES } from "../../constants/applicationStatuses";

const ScheduleInterviewModal = memo(
  ({ open, candidate, onCancel, onSubmit, loading = false }) => {
    const [form] = Form.useForm();
    const mode = Form.useWatch("mode", form);

    useEffect(() => {
      if (!open) return;
      const interview = candidate?.interview;
      form.setFieldsValue({
        date: interview?.date ? dayjs(interview.date) : null,
        time: interview?.time
          ? dayjs(interview.time, "HH:mm")
          : null,
        mode: interview?.mode || "video",
        location: interview?.location || "",
        meetingLink: interview?.meetingLink || "",
      });
    }, [open, candidate, form]);

    const handleOk = async () => {
      try {
        const values = await form.validateFields();
        onSubmit?.({
          date: values.date?.format("YYYY-MM-DD"),
          time: values.time?.format("HH:mm"),
          mode: values.mode,
          location: values.location || "",
          meetingLink: values.meetingLink || "",
        });
      } catch {
        // validation errors shown by form
      }
    };

    return (
      <Modal
        title={`Schedule Interview${candidate?.name ? ` — ${candidate.name}` : ""}`}
        open={open}
        onCancel={onCancel}
        onOk={handleOk}
        okText="Schedule"
        confirmLoading={loading}
        destroyOnClose
        width={520}
      >
        <Form form={form} layout="vertical" className="mt-2">
          <Form.Item
            name="date"
            label="Interview date"
            rules={[{ required: true, message: "Select a date" }]}
          >
            <DatePicker className="w-100" size="large" />
          </Form.Item>
          <Form.Item
            name="time"
            label="Interview time"
            rules={[{ required: true, message: "Select a time" }]}
          >
            <TimePicker className="w-100" size="large" format="HH:mm" />
          </Form.Item>
          <Form.Item
            name="mode"
            label="Mode"
            rules={[{ required: true, message: "Select mode" }]}
          >
            <Select
              size="large"
              options={INTERVIEW_MODES.map((m) => ({
                value: m.value,
                label: m.label,
              }))}
            />
          </Form.Item>
          {mode === "in_person" ? (
            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: "Enter location" }]}
            >
              <Input size="large" placeholder="Office address / room" />
            </Form.Item>
          ) : (
            <Form.Item
              name="meetingLink"
              label="Meeting link"
              rules={[
                { required: mode === "video", message: "Enter meeting link" },
              ]}
            >
              <Input size="large" placeholder="https://meet.example.com/..." />
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  }
);

ScheduleInterviewModal.displayName = "ScheduleInterviewModal";

export default ScheduleInterviewModal;
