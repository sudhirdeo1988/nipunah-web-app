"use client";

import React, { memo, useEffect, useState } from "react";
import { Modal, Radio, Space } from "antd";
import Icon from "@/components/Icon";
import {
  JOB_CLOSURE_OPTIONS,
  JOB_HIRING_STATUS,
} from "../../constants/jobHiringStatuses";

/**
 * Confirm marking a job as Filled or Closed (moves to job history).
 */
const CloseJobModal = memo(
  ({
    isOpen,
    job,
    onConfirm,
    onCancel,
    loading = false,
  }) => {
    const [hiringStatus, setHiringStatus] = useState(
      JOB_HIRING_STATUS.FILLED
    );

    useEffect(() => {
      if (isOpen) {
        setHiringStatus(JOB_HIRING_STATUS.FILLED);
      }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <Modal
        title={
          <div className="d-flex align-items-center">
            <Icon name="task_alt" className="me-2" />
            <span className="C-heading size-5 semiBold mb-0">
              Close job
            </span>
          </div>
        }
        open={isOpen}
        onCancel={onCancel}
        footer={
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="C-button is-outlined small"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="C-button is-filled small"
              onClick={() => onConfirm?.(hiringStatus)}
              disabled={loading}
            >
              {loading ? "Saving..." : "Confirm"}
            </button>
          </div>
        }
        width={440}
        destroyOnClose
      >
        <p className="C-heading size-xs text-muted mb-3">
          Once hiring is complete, mark{" "}
          <strong>{job?.title || "this job"}</strong> as Filled or Closed. It
          will be removed from active listings and moved to job history.
        </p>

        <Radio.Group
          value={hiringStatus}
          onChange={(e) => setHiringStatus(e.target.value)}
          className="w-100"
        >
          <Space direction="vertical" size={12} className="w-100">
            {JOB_CLOSURE_OPTIONS.map((option) => (
              <Radio key={option.value} value={option.value}>
                <span className="C-heading size-xs semiBold mb-0 d-block">
                  {option.label}
                </span>
                <span className="C-heading size-xss text-muted mb-0 d-block">
                  {option.description}
                </span>
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </Modal>
    );
  }
);

CloseJobModal.displayName = "CloseJobModal";

export default CloseJobModal;
