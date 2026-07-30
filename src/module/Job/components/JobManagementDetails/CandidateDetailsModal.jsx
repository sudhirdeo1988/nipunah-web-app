"use client";

import React, { memo, useEffect, useMemo } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  TimePicker,
  Collapse,
  message,
} from "antd";
import dayjs from "dayjs";
import Icon from "@/components/Icon";
import { sanitizeHtml } from "@/components/RichTextEditor";
import {
  APPLICATION_STATUS,
  UPDATABLE_APPLICATION_STATUSES,
  INTERVIEW_MODES,
  getStatusLabel,
} from "../../constants/applicationStatuses";
import { downloadCandidateResume } from "../../utils/downloadCandidateResume";
import "@/components/RichTextEditor/RichTextEditor.scss";
import "./JobManagementDetails.scss";

const { TextArea } = Input;

const CandidateDetailsModal = memo(
  ({
    open,
    candidate,
    onCancel,
    onScheduleInterview,
    onReject,
    onUpdateStatus,
  }) => {
    const [form] = Form.useForm();
    const selectedStatus = Form.useWatch("status", form);
    const interviewMode = Form.useWatch("interviewMode", form);

    const canManage =
      candidate &&
      candidate.status !== APPLICATION_STATUS.REJECTED &&
      candidate.status !== APPLICATION_STATUS.SELECTED;

    const showInterviewFields =
      canManage &&
      (selectedStatus === APPLICATION_STATUS.INTERVIEW_SCHEDULED ||
        selectedStatus === APPLICATION_STATUS.SHORTLISTED);

    const remarksRequired =
      selectedStatus === APPLICATION_STATUS.REJECTED;

    const stageHistory = useMemo(() => {
      if (!candidate) return [];
      if (Array.isArray(candidate.stageHistory) && candidate.stageHistory.length) {
        return candidate.stageHistory;
      }
      return [
        {
          id: "fallback-applied",
          status: APPLICATION_STATUS.APPLIED,
          label: "Applied",
          remarks: "Application received.",
          date: candidate.appliedDate || "",
          interview: null,
        },
      ];
    }, [candidate]);

    const previousStatuses = useMemo(() => {
      const set = new Set(
        stageHistory.map((s) => s.status).filter(Boolean)
      );
      if (candidate?.status) set.add(candidate.status);
      return set;
    }, [stageHistory, candidate?.status]);

    const statusOptions = useMemo(() => {
      const keys = [
        APPLICATION_STATUS.APPLIED,
        ...UPDATABLE_APPLICATION_STATUSES,
      ];
      const unique = [...new Set(keys)];
      return unique.map((key) => ({
        value: key,
        label: getStatusLabel(key),
        disabled: previousStatuses.has(key),
      }));
    }, [previousStatuses]);

    const nextDefaultStatus = useMemo(() => {
      const next = UPDATABLE_APPLICATION_STATUSES.find(
        (key) => !previousStatuses.has(key)
      );
      return next || APPLICATION_STATUS.UNDER_REVIEW;
    }, [previousStatuses]);

    useEffect(() => {
      if (!open || !candidate) return;

      form.setFieldsValue({
        status: nextDefaultStatus,
        remarks: "",
        interviewDate: candidate.interview?.date
          ? dayjs(candidate.interview.date)
          : null,
        interviewTime: candidate.interview?.time
          ? dayjs(candidate.interview.time, "HH:mm")
          : null,
        interviewMode: candidate.interview?.mode || "video",
        location: candidate.interview?.location || "",
        meetingLink: candidate.interview?.meetingLink || "",
      });
    }, [open, candidate, form, nextDefaultStatus]);

    if (!candidate) return null;

    const initials = String(candidate.name || "")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const handleDownloadCv = () => {
      downloadCandidateResume(candidate);
      message.success(`Downloading ${candidate.resumeName || "Resume.pdf"}`);
    };

    const buildInterviewPayload = (values) => ({
      date: values.interviewDate?.format("YYYY-MM-DD"),
      time: values.interviewTime?.format("HH:mm"),
      mode: values.interviewMode,
      location: values.location || "",
      meetingLink: values.meetingLink || "",
    });

    const handleSave = async () => {
      if (!canManage) {
        onCancel?.();
        return;
      }

      try {
        const values = await form.validateFields();
        const status = values.status;
        const remarks = values.remarks?.trim() || "";

        if (previousStatuses.has(status)) {
          message.info("This status was already used. Choose a later stage.");
          return;
        }

        if (status === APPLICATION_STATUS.APPLIED) {
          message.info("Select a new status to update this application");
          return;
        }

        if (status === APPLICATION_STATUS.REJECTED) {
          await onReject?.(candidate, remarks);
          return;
        }

        if (status === APPLICATION_STATUS.INTERVIEW_SCHEDULED) {
          const interview = buildInterviewPayload(values);
          if (!interview.date || !interview.time) {
            message.error("Please set interview date and time");
            return;
          }
          await onScheduleInterview?.(candidate, interview, remarks);
          return;
        }

        if (
          status === APPLICATION_STATUS.SHORTLISTED &&
          values.interviewDate &&
          values.interviewTime
        ) {
          await onScheduleInterview?.(
            candidate,
            buildInterviewPayload(values),
            remarks
          );
          return;
        }

        if (status === APPLICATION_STATUS.SHORTLISTED) {
          await onUpdateStatus?.(
            candidate,
            APPLICATION_STATUS.SHORTLISTED,
            remarks
          );
          return;
        }

        await onUpdateStatus?.(candidate, status, remarks);
      } catch {
        // form validation or API error (API toast in hook)
      }
    };

    return (
      <Modal
        className="candidate-details-modal-wrap"
        title={null}
        open={open}
        onCancel={onCancel}
        footer={null}
        width={780}
        centered
        destroyOnClose
      >
        <div className="candidate-details-modal">
          <header className="candidate-details-modal__hero">
            <div className="candidate-details-modal__avatar" aria-hidden>
              {initials}
            </div>
            <div className="candidate-details-modal__hero-main">
              <div className="candidate-details-modal__hero-top">
                <h3 className="candidate-details-modal__name">
                  {candidate.name}
                </h3>
                <span
                  className={`applicant-status-pill applicant-status-pill--${
                    candidate.status || "applied"
                  }`}
                >
                  {getStatusLabel(candidate.status)}
                </span>
              </div>
              <div className="candidate-details-modal__applied-row">
                <div className="candidate-details-modal__applied">
                  <Icon name="schedule" size="small" />
                  Applied on {candidate.appliedDate || "N/A"}
                </div>
                <span
                  className="candidate-details-modal__interview-sep"
                  aria-hidden
                >
                  |
                </span>
                <a
                  href="#"
                  className="candidate-details-modal__resume-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownloadCv();
                  }}
                  title="Download resume"
                >
                  <span className="candidate-details-modal__resume-link-name">
                    {candidate.resumeName || "Resume.pdf"}
                  </span>
                  <Icon name="download" size="extra-small" />
                </a>
              </div>
              <div className="candidate-details-modal__meta-inline">
                <span className="candidate-details-modal__interview-pair">
                  <span className="candidate-details-modal__info-label">
                    Email:
                  </span>{" "}
                  <span className="candidate-details-modal__info-value">
                    {candidate.email || "N/A"}
                  </span>
                </span>
                <span className="candidate-details-modal__interview-sep">
                  |
                </span>
                <span className="candidate-details-modal__interview-pair">
                  <span className="candidate-details-modal__info-label">
                    Phone:
                  </span>{" "}
                  <span className="candidate-details-modal__info-value">
                    {candidate.phone || "N/A"}
                  </span>
                </span>
                <span className="candidate-details-modal__interview-sep">
                  |
                </span>
                <span className="candidate-details-modal__interview-pair">
                  <span className="candidate-details-modal__info-label">
                    Experience:
                  </span>{" "}
                  <span className="candidate-details-modal__info-value">
                    {candidate.experience || "N/A"}
                  </span>
                </span>
              </div>
              {(candidate.skills || []).length > 0 ? (
                <div className="candidate-details-modal__skills">
                  {(candidate.skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="candidate-details-modal__skill"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </header>

          <Collapse
            accordion
            bordered={false}
            className="candidate-details-accordion"
            defaultActiveKey={["history"]}
            expandIconPosition="end"
            expandIcon={({ isActive }) => (
              <Icon
                name={isActive ? "expand_less" : "expand_more"}
              />
            )}
            items={[
              {
                key: "cover",
                label: (
                  <span className="candidate-details-accordion__label">
                    <span className="candidate-details-accordion__icon">
                      <Icon name="article" size="small" />
                    </span>
                    <span className="candidate-details-accordion__title">
                      Cover letter
                    </span>
                  </span>
                ),
                children: (
                  <div
                    className="candidate-details-modal__cover rte-content"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(
                        candidate.coverLetter ||
                          "<p>No cover letter provided.</p>"
                      ),
                    }}
                  />
                ),
              },
              {
                key: "history",
                label: (
                  <span className="candidate-details-accordion__label">
                    <span className="candidate-details-accordion__icon">
                      <Icon name="timeline" size="small" />
                    </span>
                    <span className="candidate-details-accordion__title">
                      Process history
                    </span>
                    <span className="candidate-details-accordion__badge">
                      {stageHistory.length}
                    </span>
                  </span>
                ),
                children: (
                  <div className="candidate-stage-timeline">
                    {stageHistory.map((stage, index) => {
                      const isLatest = index === stageHistory.length - 1;
                      return (
                        <div
                          key={stage.id || `${stage.status}-${index}`}
                          className={`candidate-stage-timeline__item${
                            isLatest ? " is-latest" : ""
                          }${
                            stage.status === APPLICATION_STATUS.REJECTED
                              ? " is-rejected"
                              : ""
                          }${
                            stage.status === APPLICATION_STATUS.SELECTED
                              ? " is-selected"
                              : ""
                          }`}
                        >
                          <div
                            className="candidate-stage-timeline__rail"
                            aria-hidden
                          >
                            <span className="candidate-stage-timeline__dot" />
                            {index < stageHistory.length - 1 ? (
                              <span className="candidate-stage-timeline__line" />
                            ) : null}
                          </div>
                          <div className="candidate-stage-timeline__body">
                            <div className="candidate-stage-timeline__head">
                              <span
                                className={`applicant-status-pill applicant-status-pill--${
                                  stage.status || "applied"
                                }`}
                              >
                                {stage.label || getStatusLabel(stage.status)}
                              </span>
                              <span className="candidate-stage-timeline__date">
                                {stage.date || "—"}
                              </span>
                            </div>
                            {stage.remarks ? (
                              <p className="candidate-stage-timeline__remarks">
                                {stage.remarks}
                              </p>
                            ) : (
                              <p className="candidate-stage-timeline__remarks is-muted">
                                No remarks for this stage.
                              </p>
                            )}
                            {stage.interview?.date ? (
                              <div className="candidate-details-modal__meta-inline candidate-stage-timeline__interview">
                                <span className="candidate-details-modal__interview-pair">
                                  <span className="candidate-details-modal__info-label">
                                    Date:
                                  </span>{" "}
                                  <span className="candidate-details-modal__info-value">
                                    {stage.interview.date}
                                  </span>
                                </span>
                                {stage.interview.time ? (
                                  <>
                                    <span className="candidate-details-modal__interview-sep">
                                      |
                                    </span>
                                    <span className="candidate-details-modal__interview-pair">
                                      <span className="candidate-details-modal__info-label">
                                        Time:
                                      </span>{" "}
                                      <span className="candidate-details-modal__info-value">
                                        {stage.interview.time}
                                      </span>
                                    </span>
                                  </>
                                ) : null}
                                {stage.interview.mode ? (
                                  <>
                                    <span className="candidate-details-modal__interview-sep">
                                      |
                                    </span>
                                    <span className="candidate-details-modal__interview-pair">
                                      <span className="candidate-details-modal__info-label">
                                        Mode:
                                      </span>{" "}
                                      <span className="candidate-details-modal__info-value">
                                        {INTERVIEW_MODES.find(
                                          (m) =>
                                            m.value === stage.interview.mode
                                        )?.label || stage.interview.mode}
                                      </span>
                                    </span>
                                  </>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ),
              },
            ]}
          />

          {canManage ? (
            <Collapse
              bordered={false}
              className="candidate-details-accordion candidate-details-accordion--update"
              defaultActiveKey={["update"]}
              expandIconPosition="end"
              expandIcon={({ isActive }) => (
                <Icon name={isActive ? "expand_less" : "expand_more"} />
              )}
              items={[
                {
                  key: "update",
                  label: (
                    <span className="candidate-details-accordion__label">
                      <span className="candidate-details-accordion__icon">
                        <Icon name="tune" size="small" />
                      </span>
                      <span className="candidate-details-accordion__title">
                        Update application
                      </span>
                    </span>
                  ),
                  children: (
                    <div className="candidate-details-modal__manage-body">
                      <Form
                        form={form}
                        layout="vertical"
                        className="candidate-details-modal__form"
                      >
                        <Form.Item
                          name="status"
                          label="Application status"
                          rules={[
                            { required: true, message: "Select a status" },
                          ]}
                        >
                          <Select size="large" options={statusOptions} />
                        </Form.Item>

                        {showInterviewFields ? (
                          <div className="candidate-details-modal__interview-form">
                            <div className="candidate-details-modal__interview-form-title">
                              <Icon name="event" size="small" />
                              {selectedStatus ===
                              APPLICATION_STATUS.INTERVIEW_SCHEDULED
                                ? "Schedule interview"
                                : "Schedule interview (optional)"}
                            </div>
                            <div className="row g-2">
                              <div className="col-sm-6">
                                <Form.Item
                                  name="interviewDate"
                                  label="Date"
                                  rules={
                                    selectedStatus ===
                                    APPLICATION_STATUS.INTERVIEW_SCHEDULED
                                      ? [
                                          {
                                            required: true,
                                            message: "Select date",
                                          },
                                        ]
                                      : []
                                  }
                                >
                                  <DatePicker className="w-100" size="large" />
                                </Form.Item>
                              </div>
                              <div className="col-sm-6">
                                <Form.Item
                                  name="interviewTime"
                                  label="Time"
                                  rules={
                                    selectedStatus ===
                                    APPLICATION_STATUS.INTERVIEW_SCHEDULED
                                      ? [
                                          {
                                            required: true,
                                            message: "Select time",
                                          },
                                        ]
                                      : []
                                  }
                                >
                                  <TimePicker
                                    className="w-100"
                                    size="large"
                                    format="HH:mm"
                                  />
                                </Form.Item>
                              </div>
                              <div className="col-sm-6">
                                <Form.Item
                                  name="interviewMode"
                                  label="Mode"
                                  rules={
                                    selectedStatus ===
                                    APPLICATION_STATUS.INTERVIEW_SCHEDULED
                                      ? [
                                          {
                                            required: true,
                                            message: "Select mode",
                                          },
                                        ]
                                      : []
                                  }
                                >
                                  <Select
                                    size="large"
                                    options={INTERVIEW_MODES.map((m) => ({
                                      value: m.value,
                                      label: m.label,
                                    }))}
                                  />
                                </Form.Item>
                              </div>
                              <div className="col-sm-6">
                                {interviewMode === "in_person" ? (
                                  <Form.Item
                                    name="location"
                                    label="Location"
                                    rules={
                                      selectedStatus ===
                                      APPLICATION_STATUS.INTERVIEW_SCHEDULED
                                        ? [
                                            {
                                              required: true,
                                              message: "Enter location",
                                            },
                                          ]
                                        : []
                                    }
                                  >
                                    <Input
                                      size="large"
                                      placeholder="Office address / room"
                                    />
                                  </Form.Item>
                                ) : (
                                  <Form.Item
                                    name="meetingLink"
                                    label="Meeting link"
                                    rules={
                                      selectedStatus ===
                                        APPLICATION_STATUS.INTERVIEW_SCHEDULED &&
                                      interviewMode === "video"
                                        ? [
                                            {
                                              required: true,
                                              message: "Enter meeting link",
                                            },
                                          ]
                                        : []
                                    }
                                  >
                                    <Input
                                      size="large"
                                      placeholder="https://meet.example.com/..."
                                    />
                                  </Form.Item>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : null}

                        <div
                          className={`candidate-remarks-field${
                            remarksRequired ? " is-required" : ""
                          }`}
                        >
                          <Form.Item
                            name="remarks"
                            label={
                              <span className="candidate-remarks-field__label">
                                Remarks for this stage
                                {!remarksRequired ? (
                                  <span className="candidate-remarks-field__optional">
                                    {" "}
                                    (optional)
                                  </span>
                                ) : null}
                              </span>
                            }
                            rules={
                              remarksRequired
                                ? [
                                    {
                                      required: true,
                                      message:
                                        "Remarks are required when rejecting",
                                    },
                                    {
                                      min: 5,
                                      message: "Please add a bit more detail",
                                    },
                                  ]
                                : []
                            }
                            extra="Saved into process history for this status update."
                            className="mb-0"
                          >
                            <TextArea
                              className="candidate-remarks-field__input"
                              rows={3}
                              placeholder={
                                remarksRequired
                                  ? "Explain why this candidate is rejected..."
                                  : "Add notes for this stage..."
                              }
                              maxLength={1000}
                              showCount
                            />
                          </Form.Item>
                        </div>

                        <div className="candidate-details-modal__manage-footer">
                          <button
                            type="button"
                            className="C-button is-filled"
                            onClick={handleSave}
                          >
                            Save updates
                          </button>
                        </div>
                      </Form>
                    </div>
                  ),
                },
              ]}
            />
          ) : candidate.interview ? (
            <section className="candidate-details-modal__section">
              <h4 className="candidate-details-modal__section-title">
                <Icon name="event" size="small" />
                Latest interview
              </h4>
              <div className="candidate-details-modal__interview candidate-details-modal__interview--inline">
                <span className="candidate-details-modal__interview-pair">
                  <span className="candidate-details-modal__info-label">
                    Date:
                  </span>{" "}
                  <span className="candidate-details-modal__info-value">
                    {candidate.interview.date || "N/A"}
                  </span>
                </span>
                <span className="candidate-details-modal__interview-sep">
                  |
                </span>
                <span className="candidate-details-modal__interview-pair">
                  <span className="candidate-details-modal__info-label">
                    Time:
                  </span>{" "}
                  <span className="candidate-details-modal__info-value">
                    {candidate.interview.time || "N/A"}
                  </span>
                </span>
                <span className="candidate-details-modal__interview-sep">
                  |
                </span>
                <span className="candidate-details-modal__interview-pair">
                  <span className="candidate-details-modal__info-label">
                    Mode:
                  </span>{" "}
                  <span className="candidate-details-modal__info-value">
                    {INTERVIEW_MODES.find(
                      (m) => m.value === candidate.interview.mode
                    )?.label ||
                      candidate.interview.mode ||
                      "N/A"}
                  </span>
                </span>
                {candidate.interview.location ? (
                  <>
                    <span className="candidate-details-modal__interview-sep">
                      |
                    </span>
                    <span className="candidate-details-modal__interview-pair">
                      <span className="candidate-details-modal__info-label">
                        Location:
                      </span>{" "}
                      <span className="candidate-details-modal__info-value">
                        {candidate.interview.location}
                      </span>
                    </span>
                  </>
                ) : null}
                {candidate.interview.meetingLink ? (
                  <>
                    <span className="candidate-details-modal__interview-sep">
                      |
                    </span>
                    <span className="candidate-details-modal__interview-pair is-link">
                      <span className="candidate-details-modal__info-label">
                        Link:
                      </span>{" "}
                      <a
                        href={candidate.interview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="candidate-details-modal__link"
                      >
                        {candidate.interview.meetingLink}
                      </a>
                    </span>
                  </>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      </Modal>
    );
  }
);

CandidateDetailsModal.displayName = "CandidateDetailsModal";

export default CandidateDetailsModal;
