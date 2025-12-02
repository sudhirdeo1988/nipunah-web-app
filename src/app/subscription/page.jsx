"use client";

import React, { useState, useMemo } from "react";
import Icon from "@/components/Icon";
import { Divider, Space, List, message, Select } from "antd";
import { map as _map } from "lodash-es";
import PublicLayout from "@/layout/PublicLayout";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import RazorpayScriptLoader from "@/components/RazorpayScriptLoader";
import PaymentGatewayModal from "@/components/PaymentGatewayModal";
import { initiateRazorpayPayment } from "@/utilities/razorpay";

// Currency conversion rate (1 USD = 83 INR)
const USD_TO_INR_RATE = 83;

// Base plans in USD
const basePlansUSD = [
  {
    id: 1,
    plan_name: "Starter Plan",
    monthlyPrice: 9.99,
    yearlyPrice: 119.88,
    yearlyOfferPrice: 110,
    description: "Small or new companies taking first step online",
    most_popular: false,
    features: [
      "Full Company Profile",
      "Showcase up to 3 services/equipment with 1 image each",
      "Verified Badge",
      "List in 1 category & 1 location/port",
      "Analytics Dashboard",
      "Social Media Sharing",
    ],
  },
  {
    id: 2,
    plan_name: "Growth Plan",
    monthlyPrice: 24.99,
    yearlyPrice: 299.88,
    yearlyOfferPrice: 270,
    description: "Expanding companies with multiple services/ports",
    most_popular: true,
    features: [
      "Full Company Profile",
      "Showcase up to 15 services/equipment with up to 1 image for Services and 5 images for equipment each",
      "Verified Badge",
      "List in 5 category & 5 location/port",
      "Analytics Dashboard",
      "Social Media Sharing",
    ],
  },
  {
    id: 3,
    plan_name: "Premium Plan",
    monthlyPrice: 49.99,
    yearlyPrice: 599.88,
    yearlyOfferPrice: 540,
    description: "Established brands seeking high credibility",
    most_popular: false,
    features: [
      "Full Company Profile",
      "Showcase up to 25 services/equipment with up to 1 image for Services and 5 images for equipment each",
      "Verified + Premium Badge",
      "List in 10 category & 10 location/port",
      "Analytics Dashboard",
      "Social Media Sharing",
      "Featured in Category Highlights",
    ],
  },
];

const SubscriptionPage = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("USD"); // Default currency
  const [selectedFrequency, setSelectedFrequency] = useState("month"); // month or year
  const [processingPayment, setProcessingPayment] = useState(null); // Track which plan ID is being processed
  const [paymentModalData, setPaymentModalData] = useState(null); // Store payment modal data

  // Convert plans based on selected currency
  const plans = useMemo(() => {
    return basePlansUSD.map((plan) => {
      const monthlyPrice =
        selectedCurrency === "USD"
          ? plan.monthlyPrice
          : Math.round(plan.monthlyPrice * USD_TO_INR_RATE);
      const yearlyPrice =
        selectedCurrency === "USD"
          ? plan.yearlyPrice
          : Math.round(plan.yearlyPrice * USD_TO_INR_RATE);
      const yearlyOfferPrice =
        selectedCurrency === "USD"
          ? plan.yearlyOfferPrice
          : Math.round(plan.yearlyOfferPrice * USD_TO_INR_RATE);

      return {
        ...plan,
        monthlyPrice,
        yearlyPrice,
        yearlyOfferPrice,
        currency: selectedCurrency,
        price: selectedFrequency === "month" ? monthlyPrice : yearlyOfferPrice,
        displayPrice:
          selectedFrequency === "month" ? monthlyPrice : yearlyOfferPrice,
        originalYearlyPrice: yearlyPrice,
      };
    });
  }, [selectedCurrency, selectedFrequency]);

  const handleChoosePlan = async (plan) => {
    try {
      setProcessingPayment(plan.id); // Set the specific plan ID being processed

      const paymentAmount =
        selectedFrequency === "month"
          ? plan.monthlyPrice
          : plan.yearlyOfferPrice;

      await initiateRazorpayPayment({
        amount: paymentAmount,
        currency: plan.currency,
        planId: plan.id,
        planName: plan.plan_name,
        onSuccess: (response) => {
          setProcessingPayment(null); // Clear processing state
          setPaymentModalData(null); // Close modal
          message.success(`Payment successful! Plan: ${plan.plan_name}`);
          console.log("Payment success response:", response);
          // Payment flow completed - no redirect needed
        },
        onFailure: (error) => {
          setProcessingPayment(null); // Clear processing state
          setPaymentModalData(null); // Close modal
          message.error(error.error || "Payment failed. Please try again.");
          console.error("Payment failure:", error);
        },
        onShowGateway: (gatewayData) => {
          // Show payment gateway modal
          setPaymentModalData({
            ...gatewayData,
            planId: plan.id, // Ensure planId is included
          });
        },
      });
    } catch (error) {
      setProcessingPayment(null); // Clear processing state
      setPaymentModalData(null); // Close modal
      message.error("Failed to initiate payment. Please try again.");
      console.error("Error in handleChoosePlan:", error);
    }
  };

  const handleModalCancel = () => {
    setPaymentModalData(null);
    setProcessingPayment(null);
  };

  const handleModalSuccess = (response) => {
    if (paymentModalData?.onSuccess) {
      paymentModalData.onSuccess(response);
    }
  };

  const handleModalFailure = (error) => {
    if (paymentModalData?.onFailure) {
      paymentModalData.onFailure(error);
    }
  };

  return (
    <>
      <RazorpayScriptLoader>
        <PublicLayout>
          <PageHeadingBanner
            heading="Pricing Plans"
            currentPageTitle="Pricing Plans"
          />
          <section className="section-padding">
            <div className="container">
              {/* Currency and Frequency Selector */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="d-flex justify-content-end align-items-center gap-3 flex-wrap">
                    <div className="d-flex align-items-center gap-2">
                      <span className="C-heading size-6 color-light mb-0">
                        Currency:
                      </span>
                      <Select
                        value={selectedCurrency}
                        onChange={setSelectedCurrency}
                        style={{ width: 120 }}
                        size="large"
                        options={[
                          { label: "USD ($)", value: "USD" },
                          { label: "INR (₹)", value: "INR" },
                        ]}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="C-heading size-6 color-light mb-0">
                        Billing:
                      </span>
                      <Select
                        value={selectedFrequency}
                        onChange={setSelectedFrequency}
                        style={{ width: 120 }}
                        size="large"
                        options={[
                          { label: "Monthly", value: "month" },
                          { label: "Yearly", value: "year" },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                {_map(plans, (planCard) => {
                  return (
                    <div
                      className="col-md-4 col-sm-6 col-xs-12"
                      key={planCard?.id}
                    >
                      <div
                        className={`h-100 rounded-3 d-flex flex-column bg-white shadow ${
                          planCard?.most_popular ? "gradient-wrapper" : ""
                        }`}
                      >
                        <div className="head p-3">
                          <div className="mb-3">
                            <Space align="center">
                              <h3 className="C-heading size-5 extraBold gradient-text font-secondary mb-0">
                                {planCard?.plan_name}
                              </h3>
                              {planCard?.most_popular && (
                                <span className="badge bg-secondary color-white p-2 px-3 rounded-pill">
                                  Most Popular 🔥
                                </span>
                              )}
                            </Space>
                          </div>
                          <div className="mb-3">
                            <Space align="center" size={12} className="mb-2">
                              <h3 className="C-heading size-4 extraBold color-dark font-secondary mb-0">
                                {planCard?.currency === "USD" ? "$" : "₹"}{" "}
                                {planCard?.displayPrice?.toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits:
                                      planCard?.currency === "USD" ? 2 : 0,
                                    maximumFractionDigits:
                                      planCard?.currency === "USD" ? 2 : 0,
                                  }
                                )}
                              </h3>
                              <span className="C-heading size-6 color-light mb-0">
                                /{" "}
                                {selectedFrequency === "month"
                                  ? "Month"
                                  : "Year"}
                              </span>
                            </Space>
                            {selectedFrequency === "year" && (
                              <div className="mt-2">
                                <span className="C-heading size-xs color-light text-decoration-line-through">
                                  {planCard?.currency === "USD" ? "$" : "₹"}
                                  {planCard?.originalYearlyPrice?.toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits:
                                        planCard?.currency === "USD" ? 2 : 0,
                                      maximumFractionDigits:
                                        planCard?.currency === "USD" ? 2 : 0,
                                    }
                                  )}
                                  /Year
                                </span>
                                <span className="C-heading size-xs color-success ms-2">
                                  Save{" "}
                                  {planCard?.currency === "USD" ? "$" : "₹"}
                                  {(
                                    planCard?.originalYearlyPrice -
                                    planCard?.yearlyOfferPrice
                                  )?.toLocaleString(undefined, {
                                    minimumFractionDigits:
                                      planCard?.currency === "USD" ? 2 : 0,
                                    maximumFractionDigits:
                                      planCard?.currency === "USD" ? 2 : 0,
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="C-heading size-6 color-light mb-3">
                            {planCard?.description}
                          </span>

                          <button
                            className="C-button is-filled w-100"
                            onClick={() => handleChoosePlan(planCard)}
                            disabled={processingPayment === planCard.id}
                          >
                            {processingPayment === planCard.id
                              ? "Processing..."
                              : "Choose plan"}
                          </button>
                        </div>
                        <div className="body p-3 pt-0">
                          <Divider orientation="left">
                            <span className="C-heading size-6 color-light mb-0 text-uppercase bold">
                              Features
                            </span>
                          </Divider>
                          <List
                            itemLayout="horizontal"
                            dataSource={planCard?.features}
                            bordered={false}
                            renderItem={(item) => (
                              <List.Item>
                                <List.Item.Meta
                                  avatar={
                                    <Icon
                                      name="check_circle"
                                      isFilled
                                      color="#dadada"
                                    />
                                  }
                                  title={
                                    <span className="C-heading size-6 color-light mb-0">
                                      {item}
                                    </span>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </PublicLayout>
      </RazorpayScriptLoader>

      {/* Payment Gateway Modal */}
      {paymentModalData && (
        <PaymentGatewayModal
          isOpen={!!paymentModalData}
          onCancel={handleModalCancel}
          onSuccess={handleModalSuccess}
          onFailure={handleModalFailure}
          orderData={paymentModalData.orderData}
          amount={paymentModalData.amount}
          currency={paymentModalData.currency}
          planName={paymentModalData.planName}
          planId={paymentModalData.planId}
        />
      )}
    </>
  );
};

export default SubscriptionPage;
