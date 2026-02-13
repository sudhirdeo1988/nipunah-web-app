"use client";

import React, { useRef } from "react";
import { Space } from "antd";
import Icon from "@/components/Icon";
import Job from "@/module/Job";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";

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
  const postJobHandlerRef = useRef(null);

  const handlePostJobClick = () => {
    if (postJobHandlerRef.current) {
      postJobHandlerRef.current();
    }
  };

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Job Management"
        subtitle="Manage and monitor all job postings across the platform"
        children={
          <button
            className="C-button is-filled small"
            onClick={handlePostJobClick}
          >
            <Space>
              <Icon name="work" />
              Post a job
            </Space>
          </button>
        }
      />
      <div className="p-3">
        <Job onPostJobClickRef={postJobHandlerRef} />
      </div>
    </div>
  );
};

export default JobPage;
