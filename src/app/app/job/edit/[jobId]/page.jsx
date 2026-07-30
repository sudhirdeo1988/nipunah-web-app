"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, Spin } from "antd";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { ROUTES } from "@/constants/routes";
import CreateJobForm from "@/module/Job/components/CreateJobForm";
import { useJob } from "@/module/Job/hooks/useJob";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { useRole } from "@/hooks/useRole";
import { jobService } from "@/utilities/apiServices";
import { readStashedJobForEdit } from "@/module/Job/utils/jobFormMapper";
import { canViewerAccessJob } from "@/module/Job/utils/jobAccess";
import { USE_MOCK_JOBS_API } from "@/module/Job/constants/mockJobsApiResponse";

const EditJobPage = () => {
  const router = useRouter();
  const params = useParams();
  const rawJobId = params?.jobId;
  const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;
  const { allowed, permissions } = useModuleAccess("jobs");
  const { user, role, isCompany } = useRole();
  const { updateJob, loading, error } = useJob({ skipInitialFetch: true });

  const [initialJob, setInitialJob] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const requestIdRef = useRef(0);
  const accessRef = useRef({ user, role, isCompany });
  accessRef.current = { user, role, isCompany };

  const goBack = useCallback(() => {
    router.push(ROUTES.PRIVATE.JOB);
  }, [router]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let active = true;

    const load = async () => {
      if (!jobId) {
        if (requestId === requestIdRef.current) {
          setLoadError("Missing job id");
          setLoadingJob(false);
          setInitialJob(null);
        }
        return;
      }

      setLoadingJob(true);
      setLoadError(null);

      const stashed = readStashedJobForEdit(jobId);
      const { user: u, role: r, isCompany: isCo } = accessRef.current;

      try {
        const response = await jobService.getJobById(jobId);
        if (!active || requestId !== requestIdRef.current) return;

        const job = response?.data || response;
        const merged = job ? { ...(stashed || {}), ...job } : stashed;

        if (
          !USE_MOCK_JOBS_API &&
          merged &&
          typeof isCo === "function" &&
          isCo() &&
          !canViewerAccessJob(merged, u, r)
        ) {
          setLoadError("You can only edit jobs posted by your company.");
          setInitialJob(null);
        } else if (merged && typeof merged === "object") {
          setInitialJob(merged);
        } else {
          setLoadError("Job not found");
          setInitialJob(null);
        }
      } catch (err) {
        console.error("Failed to load job for edit:", err);
        if (!active || requestId !== requestIdRef.current) return;

        const { user: u2, role: r2, isCompany: isCo2 } = accessRef.current;
        if (
          stashed &&
          (USE_MOCK_JOBS_API ||
            typeof isCo2 !== "function" ||
            !isCo2() ||
            canViewerAccessJob(stashed, u2, r2))
        ) {
          setInitialJob(stashed);
        } else if (
          stashed &&
          typeof isCo2 === "function" &&
          isCo2() &&
          !USE_MOCK_JOBS_API
        ) {
          setLoadError("You can only edit jobs posted by your company.");
          setInitialJob(null);
        } else {
          setLoadError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load job"
          );
          setInitialJob(null);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoadingJob(false);
        }
      }
    };

    load();
    return () => {
      active = false;
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
        title="Edit Job Offer"
        subtitle="Update this job in your company's jobs list."
        backLink={{ label: "Back to Jobs", href: ROUTES.PRIVATE.JOB }}
      />
      <div className="container-fluid px-4 py-3">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-8">
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
                <Spin description="Loading job..." />
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
      </div>
    </div>
  );
};

export default EditJobPage;
