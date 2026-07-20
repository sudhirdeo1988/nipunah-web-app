"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "antd";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { ROUTES } from "@/constants/routes";
import CreateJobForm from "@/module/Job/components/CreateJobForm";
import { useJob } from "@/module/Job/hooks/useJob";
import { useModuleAccess } from "@/hooks/useModuleAccess";

const CreateJobPage = () => {
  const router = useRouter();
  const { allowed, permissions } = useModuleAccess("jobs");
  const { createJob, loading, error } = useJob({ skipInitialFetch: true });

  const goBack = useCallback(() => {
    router.push(ROUTES.PRIVATE.JOB);
  }, [router]);

  const handleSubmit = useCallback(
    async (payload) => {
      console.log("\n📄 CREATE JOB PAGE — submitting payload:");
      console.log(JSON.stringify(payload, null, 2));

      await createJob(payload);
      goBack();
    },
    [createJob, goBack]
  );

  if (!allowed || !permissions?.add) return null;

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Post a Job"
        subtitle="Create a new job posting for your company"
        backLink={{ label: "Back to Jobs", href: ROUTES.PRIVATE.JOB }}
      />
      <div className="p-3" style={{ maxWidth: 1100 }}>
        {error && (
          <Alert
            type="error"
            showIcon
            closable
            className="mb-3"
            message="Failed to post job"
            description={
              error?.response?.data?.message ||
              error?.message ||
              "Something went wrong. Please try again."
            }
          />
        )}
        <CreateJobForm
          onCancel={goBack}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CreateJobPage;
