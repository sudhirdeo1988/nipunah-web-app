"use client";

import React, { memo } from "react";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";

/**
 * Placeholder for Subscription details. Replace with your subscription UI.
 */
const SubscriptionDetailsPage = memo(function SubscriptionDetailsPage() {
  return (
    <div className="bg-white rounded shadow-sm p-4" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Subscription details"
        subtitle="View and manage your subscription plan."
      />
      <p className="color-light mb-0">Subscription details content will go here.</p>
    </div>
  );
});

SubscriptionDetailsPage.displayName = "SubscriptionDetailsPage";

export default SubscriptionDetailsPage;
