"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { Empty } from "antd";
import PublicLayout from "@/layout/PublicLayout";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicJobDetails from "@/module/PublicJobs/components/PublicJobDetails";
import ApplyJobModal from "@/module/PublicJobs/components/ApplyJobModal";
import { useApplyJob } from "@/module/PublicJobs/hooks/useApplyJob";
import { PUBLIC_JOBS_MOCK } from "@/module/PublicJobs/constants/publicJobsMock";
import { ROUTES } from "@/constants/routes";

const PublicJobDetailsPage = () => {
  const params = useParams();
  const jobId = params?.jobId;
  const {
    applyJob,
    isApplyOpen,
    openApply,
    closeApply,
    submitApplication,
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

  return (
    <PublicLayout>
      <PageHeadingBanner
        heading="Job Details"
        backLink={{ label: "Back to Jobs", href: ROUTES.PUBLIC.JOBS }}
      />
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
      />
    </PublicLayout>
  );
};

export default PublicJobDetailsPage;
