"use client";

import React, { memo } from "react";
import { Modal } from "antd";
import JobDetailsView from "./JobDetailsView";
import "./JobDetailsModal.scss";

/**
 * Compact Job Details modal — shared view body.
 */
const JobDetailsModal = memo(({ isOpen, job, onCancel }) => {
  if (!job) return null;

  return (
    <Modal
      title={
        <span className="C-heading size-5 semiBold mb-0">Job Details</span>
      }
      open={isOpen}
      onCancel={onCancel}
      footer={
        <button
          type="button"
          className="C-button is-bordered"
          onClick={onCancel}
        >
          Close
        </button>
      }
      width={720}
      centered
      destroyOnClose
      className="job-details-modal"
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
          paddingTop: 12,
        },
      }}
    >
      <JobDetailsView job={job} />
    </Modal>
  );
});

JobDetailsModal.displayName = "JobDetailsModal";

export default JobDetailsModal;
