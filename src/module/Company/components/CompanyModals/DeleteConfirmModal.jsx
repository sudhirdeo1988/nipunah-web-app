"use client";

import React, { memo } from "react";
import { Modal, Button, Space } from "antd";
import Icon from "@/components/Icon";

/**
 * DeleteConfirmModal Component
 *
 * Displays confirmation modal for single and bulk delete operations
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {boolean} props.isBulk - Whether it's a bulk delete operation
 * @param {Object} props.company - Company to delete (single delete)
 * @param {Array} props.companies - Companies to delete (bulk delete)
 * @param {Function} props.onConfirm - Handler for confirm action
 * @param {Function} props.onCancel - Handler for cancel action
 * @param {boolean} props.loading - Loading state for delete operation
 * @returns {JSX.Element} The DeleteConfirmModal component
 */
const DeleteConfirmModal = memo(
  ({ isOpen, isBulk = false, company, companies = [], onConfirm, onCancel, loading = false }) => {
    if (!isOpen) return null;

    const getModalTitle = () => {
      if (isBulk) {
        return `Delete ${companies.length} Compan${companies.length > 1 ? "ies" : "y"}`;
      }
      return `Delete Company: ${company?.name || ""}`;
    };

    const getModalSubtitle = () => {
      if (isBulk) {
        return `Are you sure you want to delete ${companies.length} compan${companies.length > 1 ? "ies" : "y"}? This action cannot be undone.`;
      }
      return "Are you sure you want to delete this company? This action cannot be undone.";
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
              Delete
            </Button>
          </div>
        }
        confirmLoading={loading}
        width={400}
        className="delete-confirm-modal"
      >
        <p className="C-heading size-xs text-muted mb-0">
          {getModalSubtitle()}
        </p>
      </Modal>
    );
  }
);

DeleteConfirmModal.displayName = "DeleteConfirmModal";

export default DeleteConfirmModal;
