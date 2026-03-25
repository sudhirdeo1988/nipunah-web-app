"use client";

import React from "react";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import PricingListing from "module/Pricing/Components/PricingListing";

const PricingPage = () => {
  const { allowed, permissions } = useModuleAccess("pricing");

  if (!allowed) return null;

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Pricing"
        subtitle="Manage subscription plans and pricing data"
      />
      <div className="p-3">
        <PricingListing permissions={permissions} />
      </div>
    </div>
  );
};

export default PricingPage;
