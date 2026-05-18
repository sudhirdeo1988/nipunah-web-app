"use client";

import React from "react";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import EnquiryListing from "module/Enquiries/Components/EnquiryListing";

const EnquiriesPage = () => {
  const { allowed, permissions } = useModuleAccess("enquiries");

  if (!allowed) return null;

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Enquiries"
        subtitle="View enquiry threads and reply in conversation"
      />
      <div className="p-3">
        <EnquiryListing permissions={permissions} />
      </div>
    </div>
  );
};

export default EnquiriesPage;

