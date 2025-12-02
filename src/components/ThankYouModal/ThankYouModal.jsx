"use client";

import React from "react";
import { Modal, Button } from "antd";
import Icon from "@/components/Icon";

/**
 * ThankYouModal Component
 * Displays a thank you message after successful registration
 */
const ThankYouModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
      closable={true}
      maskClosable={false}
      className="thank-you-modal"
    >
      <div className="thank-you-content text-center py-4">
        {/* Success Icon */}
        <div className="mb-4">
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto",
              background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name="check_circle"
              isFilled
              color="#ffffff"
              size="large"
              style={{ fontSize: "48px" }}
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="C-heading size-4 extraBold mb-3">Thank You!</h3>

        {/* Message */}
        <p className="C-heading size-6 color-light mb-4" style={{ lineHeight: "1.6" }}>
          Thank you for submitting your profile. We're reviewing it now. High
          traffic is causing a slight delay, and the process may take longer than
          expected. Thank you for your patience.
        </p>

        {/* Close Button */}
        <Button
          type="primary"
          size="large"
          onClick={onClose}
          className="C-button is-filled"
          style={{
            minWidth: "150px",
            height: "48px",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default ThankYouModal;

