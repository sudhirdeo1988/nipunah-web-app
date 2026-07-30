"use client";

import React, { Suspense, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Empty, Spin } from "antd";
import PublicLayout from "@/layout/PublicLayout";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicJobDetails from "@/module/PublicJobs/components/PublicJobDetails";
import ApplyJobModal from "@/module/PublicJobs/components/ApplyJobModal";
import { useApplyJob } from "@/module/PublicJobs/hooks/useApplyJob";
import { PUBLIC_JOBS_MOCK } from "@/module/PublicJobs/constants/publicJobsMock";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/utilities/AuthContext";
import { useRolePermissions } from "@/hooks/useRolePermissions";

const PublicJobDetailsPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = params?.jobId;
  const from = searchParams?.get("from");
  const { isLoggedIn } = useAuth();
  const { flatPermissions, permissionsReady } = useRolePermissions();

  const canViewJob =
    Boolean(isLoggedIn) &&
    (Boolean(flatPermissions?.nav_public_jobs) ||
      Boolean(flatPermissions?.nav_job_applications) ||
      Boolean(flatPermissions?.jobs_apply));

  useEffect(() => {
    if (!permissionsReady) return;
    if (!isLoggedIn) {
      router.replace(
        `${ROUTES.PUBLIC.LOGIN}?redirect=${encodeURIComponent(
          typeof window !== "undefined" ? window.location.pathname : "/jobs"
        )}`
      );
      return;
    }
    if (!canViewJob) {
      router.replace(ROUTES.PRIVATE.DASHBOARD);
    }
  }, [permissionsReady, isLoggedIn, canViewJob, router]);

  const {
    applyJob,
    isApplyOpen,
    openApply,
    closeApply,
    submitApplication,
    submitting,
    hasApplied,
  } = useApplyJob();

  const job = useMemo(() => {
    if (!jobId) return null;
    const idStr = String(jobId);
    return (
      PUBLIC_JOBS_MOCK.find(
        (j) =>
          String(j.id) === idStr ||
          String(j.jobId) === idStr ||
          String(j.job_id) === idStr
      ) || null
    );
  }, [jobId]);

  const backLink = useMemo(() => {
    if (from === "job-applications") {
      return {
        label: "Back to Job Applications",
        href: ROUTES.PRIVATE.JOB_APPLICATIONS,
      };
    }
    return { label: "Back to Jobs", href: ROUTES.PUBLIC.JOBS };
  }, [from]);

  if (!permissionsReady || !canViewJob) {
    return (
      <PublicLayout>
        <div className="d-flex justify-content-center py-5">
          <Spin size="large" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <PageHeadingBanner heading="Job Details" backLink={backLink} />
      <div className="container py-4">
        {job ? (
          <PublicJobDetails
            job={job}
            onApply={openApply}
            hasApplied={hasApplied(job)}
          />
        ) : (
          <div className="text-center py-5">
            <Empty description="Job not found" />
          </div>
        )}
      </div>

      <ApplyJobModal
        open={isApplyOpen}
        job={applyJob}
        onCancel={closeApply}
        onSubmit={submitApplication}
        confirming={submitting}
      />
    </PublicLayout>
  );
};

const PublicJobDetailsPage = () => (
  <Suspense
    fallback={
      <PublicLayout>
        <div className="d-flex justify-content-center py-5">
          <Spin size="large" />
        </div>
      </PublicLayout>
    }
  >
    <PublicJobDetailsPageContent />
  </Suspense>
);

export default PublicJobDetailsPage;
