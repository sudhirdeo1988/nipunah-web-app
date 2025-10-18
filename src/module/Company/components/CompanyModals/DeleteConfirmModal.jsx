"use client";

import React, { memo } from "react";
import { Modal, Button } from "antd";

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
 * @returns {JSX.Element} The DeleteConfirmModal component
 */
const DeleteConfirmModal = memo(
  ({ isOpen, isBulk, company, companies, onConfirm, onCancel }) => {
    const title = isBulk ? "Delete Selected Companies" : "Delete Company";
    const okText = isBulk ? "Delete All" : "Delete";
    const count = isBulk ? companies.length : 1;

    return (
      <Modal
        title={<span className="C-heaidng size-5 mb-0 bold">{title}</span>}
        open={isOpen}
        onOk={onConfirm}
        onCancel={onCancel}
        okText={okText}
        cancelText="Cancel"
        okButtonProps={{ className: "C-button is-filled" }}
        cancelButtonProps={{ className: "C-button is-bordered" }}
        centered
      >
        <div className="py-3">
          <p className="C-heading size-6 bold mb-3">
            Are you sure you want to delete {count} company
            {count > 1 ? "(ies)" : ""}? <br /> This action cannot be undone.
          </p>

          {isBulk && companies.length > 0 && (
            <div className="bg-light p-3 rounded">
              <p className="C-heading size-xs mb-2 text-muted">
                Selected Companies:
              </p>
              {companies.map((comp) => (
                <div key={comp.id} className="mb-2">
                  <p className="C-heading size-6 mb-0 bold">
                    {comp.name} - {comp.industry}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!isBulk && company && (
            <div className="bg-light p-3 rounded">
              <p className="C-heading size-xs mb-1 text-muted">Company Name:</p>
              <p className="C-heading size-6 mb-0 bold">{company.name}</p>
              <p className="C-heading size-xs mb-1 text-muted">Industry:</p>
              <p className="C-heading size-6 mb-0">{company.industry}</p>
            </div>
          )}
        </div>
      </Modal>
    );
  }
);

DeleteConfirmModal.displayName = "DeleteConfirmModal";

export default DeleteConfirmModal;
