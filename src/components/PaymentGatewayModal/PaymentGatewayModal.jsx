"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Space, Divider } from "antd";
import Icon from "@/components/Icon";

/**
 * Payment Gateway Modal Component
 * Simulates Razorpay payment gateway UI for dummy/testing mode
 */
const PaymentGatewayModal = ({
  isOpen,
  onCancel,
  onSuccess,
  onFailure,
  orderData,
  amount,
  currency,
  planName,
  planId,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setCardNumber("");
      setCardName("");
      setExpiry("");
      setCvv("");
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      const dummyResponse = {
        razorpay_payment_id: `pay_dummy_${Date.now()}`,
        razorpay_order_id: orderData.id,
        razorpay_signature: `sig_dummy_${Date.now()}`,
      };
      onSuccess({
        ...dummyResponse,
        orderId: orderData.id,
        planId: planId || orderData.planId || orderData.id,
        planName: planName || orderData.planName,
        amount: amount,
      });
    }, 2000);
  };

  const handleCancel = () => {
    onFailure({ error: "Payment cancelled by user" });
    onCancel();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={480}
      centered
      closable={!isProcessing}
      maskClosable={!isProcessing}
      className="payment-gateway-modal"
    >
      <div className="payment-gateway-content">
        {/* Header */}
        <div className="payment-header text-center mb-4">
          <div className="mb-3">
            <div
              style={{
                width: "60px",
                height: "60px",
                margin: "0 auto",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              N
            </div>
          </div>
          <h3 className="C-heading size-4 extraBold mb-2">Nipunah</h3>
          <p className="C-heading size-6 color-light mb-0">
            Complete your payment
          </p>
        </div>

        <Divider />

        {/* Order Details */}
        <div className="order-details mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="C-heading size-6 color-light">Plan:</span>
            <span className="C-heading size-6 bold">{planName}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="C-heading size-6 color-light">Order ID:</span>
            <span className="C-heading size-xs color-light font-monospace">
              {orderData.id}
            </span>
          </div>
          <Divider className="my-3" />
          <div className="d-flex justify-content-between align-items-center">
            <span className="C-heading size-5 bold">Amount:</span>
            <span className="C-heading size-4 extraBold gradient-text">
              {currency} {amount.toLocaleString()}
            </span>
          </div>
        </div>

        <Divider />

        {/* Payment Form */}
        <div className="payment-form">
          <div className="mb-3">
            <label className="C-heading size-6 bold mb-2 d-block">
              Card Number
            </label>
            <Input
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              disabled={isProcessing}
              maxLength={19}
              style={{ height: "48px" }}
            />
          </div>

          <div className="mb-3">
            <label className="C-heading size-6 bold mb-2 d-block">
              Cardholder Name
            </label>
            <Input
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              disabled={isProcessing}
              style={{ height: "48px" }}
            />
          </div>

          <div className="row g-3 mb-4">
            <div className="col-6">
              <label className="C-heading size-6 bold mb-2 d-block">
                Expiry
              </label>
              <Input
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                disabled={isProcessing}
                maxLength={5}
                style={{ height: "48px" }}
              />
            </div>
            <div className="col-6">
              <label className="C-heading size-6 bold mb-2 d-block">CVV</label>
              <Input
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                disabled={isProcessing}
                maxLength={3}
                type="password"
                style={{ height: "48px" }}
              />
            </div>
          </div>

          {/* Payment Button */}
          <Button
            type="primary"
            block
            size="large"
            onClick={handlePayment}
            disabled={isProcessing}
            loading={isProcessing}
            className="C-button is-filled"
            style={{
              height: "52px",
              fontSize: "16px",
              fontWeight: "600",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
            }}
          >
            {isProcessing ? "Processing Payment..." : `Pay ${currency} ${amount.toLocaleString()}`}
          </Button>

          <div className="text-center mt-3">
            <p className="C-heading size-xs color-light mb-0">
              🔒 Your payment is secured and encrypted
            </p>
          </div>
        </div>

        {/* Test Mode Badge */}
        <div className="text-center mt-4">
          <span
            className="badge"
            style={{
              background: "#fff3cd",
              color: "#856404",
              padding: "6px 12px",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            🧪 TEST MODE - Dummy Payment Gateway
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentGatewayModal;

