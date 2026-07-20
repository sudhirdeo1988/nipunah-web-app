"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, Spin } from "antd";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { ROUTES } from "@/constants/routes";
import CreateJobForm from "@/module/Job/components/CreateJobForm";
import { useJob } from "@/module/Job/hooks/useJob";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { jobService } from "@/utilities/apiServices";
import { readStashedJobForEdit } from "@/module/Job/utils/jobFormMapper";

const EditJobPage = () => {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.jobId;
  const { allowed, permissions } = useModuleAccess("jobs");
  const { updateJob, loading, error } = useJob({ skipInitialFetch: true });

  const [initialJob, setInitialJob] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);

  const goBack = useCallback(() => {
    router.push(ROUTES.PRIVATE.JOB);
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!jobId) {
        setLoadError("Missing job id");
        setLoadingJob(false);
        return;
      }

      setLoadingJob(true);
      setLoadError(null);

      try {
        const stashed = readStashedJobForEdit(jobId);
        if (stashed) {
          if (!cancelled) {
            setInitialJob(stashed);
            setLoadingJob(false);
          }
          return;
        }

        const response = await jobService.getJobById(jobId);
        const job = response?.data || response;
        if (!cancelled) {
          setInitialJob(job);
        }
      } catch (err) {
        console.error("Failed to load job for edit:", err);
        if (!cancelled) {
          setLoadError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load job"
          );
        }
      } finally {
        if (!cancelled) setLoadingJob(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const handleSubmit = useCallback(
    async (payload) => {
      console.log("\n📄 EDIT JOB PAGE — submitting payload:");
      console.log(JSON.stringify(payload, null, 2));
      await updateJob(jobId, payload);
      goBack();
    },
    [updateJob, jobId, goBack]
  );

  if (!allowed || !permissions?.edit) return null;

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Edit Job"
        subtitle="Update this job posting"
        backLink={{ label: "Back to Jobs", href: ROUTES.PRIVATE.JOB }}
      />
      <div className="p-3" style={{ maxWidth: 1100 }}>
        {(error || loadError) && (
          <Alert
            type="error"
            showIcon
            closable
            className="mb-3"
            message="Could not edit job"
            description={
              error?.response?.data?.message ||
              error?.message ||
              loadError ||
              "Something went wrong. Please try again."
            }
          />
        )}

        {loadingJob ? (
          <div className="text-center py-5">
            <Spin tip="Loading job..." />
          </div>
        ) : initialJob ? (
          <CreateJobForm
            mode="edit"
            initialJob={initialJob}
            onCancel={goBack}
            onSubmit={handleSubmit}
            loading={loading}
          />
        ) : (
          <Alert
            type="warning"
            showIcon
            message="Job not found"
            description="This job could not be loaded for editing."
          />
        )}
      </div>
    </div>
  );
};

export default EditJobPage;
