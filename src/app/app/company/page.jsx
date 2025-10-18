"use client";

import Company from "@/module/Company";
import React from "react";

const CompanyPage = () => {
  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <div className="p-3 border-bottom">
        <span className="C-heading size-5 color-light mb-2 extraBold">
          Company Listing
        </span>
      </div>
      <div className="p-3">
        <Company />
      </div>
    </div>
  );
};

export default CompanyPage;
