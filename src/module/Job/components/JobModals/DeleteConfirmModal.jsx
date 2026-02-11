"use client";

import React, { memo } from "react";
import { Modal, Button, Space } from "antd";
import Icon from "@/components/Icon";

/**
 * DeleteConfirmModal Component
 *
 * Confirmation modal for deleting single or multiple jobs
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {boolean} props.isBulk - Whether this is a bulk delete operation
 * @param {Object} props.job - Single job to delete (for single delete)
 * @param {Array} props.jobs - Multiple jobs to delete (for bulk delete)
 * @param {Function} props.onConfirm - Handler for confirm action
 * @param {Function} props.onCancel - Handler for cancel action
 * @param {boolean} props.loading - Loading state for delete operation
 * @returns {JSX.Element} The DeleteConfirmModal component
 */
const DeleteConfirmModal = memo(
  ({ isOpen, isBulk = false, job, jobs = [], onConfirm, onCancel, loading = false }) => {
    if (!isOpen) return null;

    const getModalTitle = () => {
      if (isBulk) {
        return `Delete ${jobs.length} Job${jobs.length > 1 ? "s" : ""}`;
      }
      return `Delete Job: ${job?.title}`;
    };

    const getModalContent = () => {
      if (isBulk) {
        return (
          <div>
            <p className="C-heading size-xs mb-3">
              Are you sure you want to delete the following {jobs.length} job
              {jobs.length > 1 ? "s" : ""}?
            </p>
            <div
              className="job-list mb-3"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              {jobs.map((jobItem) => (
                <div
                  key={jobItem.id}
                  className="d-flex align-items-center justify-content-between p-2 border-bottom"
                >
                  <div>
                    <span className="C-heading size-xs semiBold">
                      {jobItem.title}
                    </span>
                    <div className="C-heading size-xss text-muted">
                      {jobItem.jobId} - {jobItem.postedBy.companyName}
                    </div>
                  </div>
                  <Icon
                    name="delete"
                    size="small"
                    style={{ color: "#ff4d4f" }}
                  />
                </div>
              ))}
            </div>
            <p className="C-heading size-xs text-danger mb-0">
              <Icon name="warning" className="me-1" />
              This action cannot be undone.
            </p>
          </div>
        );
      }

      return (
        <div>
          <p className="C-heading size-xs mb-3">
            Are you sure you want to delete this job?
          </p>
          <div className="job-details p-3 border rounded mb-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="C-heading size-xs semiBold mb-1">
                  {job?.title}
                </h5>
                <div className="C-heading size-xss text-muted mb-1">
                  Job ID: {job?.jobId}
                </div>
                <div className="C-heading size-xss text-muted mb-0">
                  Posted by: {job?.postedBy?.companyName}
                </div>
              </div>
              <Icon name="delete" size="large" style={{ color: "#ff4d4f" }} />
            </div>
          </div>
          <p className="C-heading size-xs text-danger mb-0">
            <Icon name="warning" className="me-1" />
            This action cannot be undone.
          </p>
        </div>
      );
    };

    return (
      <Modal
        title={
          <div className="d-flex align-items-center">
            <Icon name="delete" className="me-2" style={{ color: "#ff4d4f" }} />
            <span className="C-heading size-5 semiBold mb-0">
              {getModalTitle()}
            </span>
          </div>
        }
        open={isOpen}
        onCancel={onCancel}
        footer={
          <div className="d-flex justify-content-end gap-2">
            <Button 
              onClick={onCancel} 
              className="C-button is-bordered small"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              onClick={onConfirm}
              className="C-button is-filled small"
              loading={loading}
            >
              <Space>
                <Icon name="delete" />
                Delete{" "}
                {isBulk
                  ? `${jobs.length} Job${jobs.length > 1 ? "s" : ""}`
                  : "Job"}
              </Space>
            </Button>
          </div>
        }
        confirmLoading={loading}
        width={isBulk ? 500 : 400}
        className="delete-confirm-modal"
      >
        {getModalContent()}
      </Modal>
    );
  }
);

DeleteConfirmModal.displayName = "DeleteConfirmModal";

export default DeleteConfirmModal;
