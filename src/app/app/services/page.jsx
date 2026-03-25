"use client";

import React from "react";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import ServiceListing from "module/Services/Components/ServiceListing";

const ServicesPage = () => {
  const { allowed, permissions } = useModuleAccess("services");

  if (!allowed) return null;

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Services"
        subtitle="Create and manage company services"
      />
      <div className="p-3">
        <ServiceListing permissions={permissions} />
      </div>
    </div>
  );
};

export default ServicesPage;

