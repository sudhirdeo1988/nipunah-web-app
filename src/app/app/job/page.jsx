"use client";

import React from "react";
import Job from "@/module/Job";

/**
 * JobPage Component
 *
 * Main page component for job management
 * Displays the job listing with all job management functionality
 *
 * @component
 * @returns {JSX.Element} The JobPage component
 */
const JobPage = () => {
  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <div className="p-3 border-bottom">
        <span className="C-heading size-5 color-light mb-2 extraBold">
          Job Management
        </span>
        <p className="C-heading size-xs text-muted mb-0">
          Manage and monitor all job postings across the platform
        </p>
      </div>
      <div className="p-3">
        <Job />
      </div>
    </div>
  );
};

export default JobPage;
