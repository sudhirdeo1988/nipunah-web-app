"use client";

import React from "react";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import JobApplicationsTable from "@/module/JobApplications/components/JobApplicationsTable";
import { useMyJobApplications } from "@/module/JobApplications/hooks/useMyJobApplications";

const JobApplicationsPage = () => {
  const { allowed } = useModuleAccess("job_applications");
  const { applications, loading, respondToApplication, deleteApplication } =
    useMyJobApplications();

  if (!allowed) return null;

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Job Applications"
        subtitle="Track every job you applied to and respond at any stage"
      />
      <div className="p-3">
        <JobApplicationsTable
          applications={applications}
          loading={loading}
          onRespond={respondToApplication}
          onDelete={deleteApplication}
        />
      </div>
    </div>
  );
};

export default JobApplicationsPage;
