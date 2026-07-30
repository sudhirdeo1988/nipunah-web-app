"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Alert, Spin } from "antd";
import { ROUTES } from "@/constants/routes";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { useRole } from "@/hooks/useRole";
import { jobService } from "@/utilities/apiServices";
import { canViewerAccessJob } from "@/module/Job/utils/jobAccess";
import { USE_MOCK_JOBS_API } from "@/module/Job/constants/mockJobsApiResponse";
import JobManagementDetails from "@/module/Job/components/JobManagementDetails/JobManagementDetails";
import "./jobDetailsPage.scss";

const JobDetailsPageContent = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawJobId = params?.jobId;
  const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;
  const tab = searchParams?.get("tab") || "details";

  const { allowed, permissions, permissionsReady } = useModuleAccess("jobs");
  const { user, role, isCompany } = useRole();

  const [job, setJob] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const requestIdRef = useRef(0);
  const accessRef = useRef({ user, role, isCompany });
  accessRef.current = { user, role, isCompany };

  const activeTab = useMemo(
    () => (tab === "candidates" ? "candidates" : "details"),
    [tab]
  );

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let active = true;

    const load = async () => {
      if (!jobId) {
        if (requestId === requestIdRef.current) {
          setLoadError("Missing job id");
          setLoadingJob(false);
          setJob(null);
        }
        return;
      }

      setLoadingJob(true);
      setLoadError(null);

      try {
        const response = await jobService.getJobById(jobId);
        if (!active || requestId !== requestIdRef.current) return;

        const data = response?.data ?? response;
        if (!data || typeof data !== "object" || data.success === false) {
          setLoadError("Job not found");
          setJob(null);
          return;
        }

        const { user: u, role: r, isCompany: isCo } = accessRef.current;
        if (
          !USE_MOCK_JOBS_API &&
          typeof isCo === "function" &&
          isCo() &&
          !canViewerAccessJob(data, u, r)
        ) {
          setLoadError("You can only view jobs posted by your company.");
          setJob(null);
          return;
        }

        setJob(data);
      } catch (err) {
        console.error("Failed to load job details:", err);
        if (active && requestId === requestIdRef.current) {
          setLoadError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load job"
          );
          setJob(null);
        }
      } finally {
        // Always clear loading for the latest request (avoids Strict Mode stuck spinner)
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

  const goBack = useCallback(() => {
    router.push(ROUTES.PRIVATE.JOB);
  }, [router]);

  if (permissionsReady && !allowed) return null;

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <div className="container-fluid px-4 py-3">
        <div className="mb-2">
          <button
            type="button"
            className="job-details-page__back"
            onClick={goBack}
          >
            ← Back to Jobs
          </button>
        </div>

        {loadError ? (
          <Alert
            type="error"
            showIcon
            className="mb-3"
            message="Could not load job"
            description={loadError}
            action={
              <button
                type="button"
                className="C-button is-outlined small"
                onClick={goBack}
              >
                Back to list
              </button>
            }
          />
        ) : null}

        {loadingJob ? (
          <div className="text-center py-5">
            <Spin description="Loading job..." />
          </div>
        ) : job ? (
          <JobManagementDetails
            job={job}
            activeTab={activeTab}
            permissions={permissions}
            onJobUpdated={setJob}
          />
        ) : !loadError ? (
          <Alert
            type="warning"
            showIcon
            message="Job not found"
            description="This job could not be loaded."
          />
        ) : null}
      </div>
    </div>
  );
};

const JobDetailsPage = () => (
  <Suspense
    fallback={
      <div className="bg-white rounded shadow-sm p-5 text-center">
        <Spin description="Loading..." />
      </div>
    }
  >
    <JobDetailsPageContent />
  </Suspense>
);

export default JobDetailsPage;
