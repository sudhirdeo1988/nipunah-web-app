"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { useRole } from "@/hooks/useRole";
import { ROUTES } from "@/constants/routes";
import {
  getAppliedJobIds,
  markJobApplied,
} from "../utils/appliedJobsStorage";

/**
 * Shared apply-job modal state. Any logged-in user can apply.
 * Tracks already-applied jobs (local mock store until API exists).
 */
export const useApplyJob = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useRole();
  const [applyJob, setApplyJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setAppliedJobIds([]);
      return;
    }
    setAppliedJobIds(getAppliedJobIds(user));
  }, [isAuthenticated, user]);

  const appliedSet = useMemo(
    () => new Set(appliedJobIds.map(String)),
    [appliedJobIds]
  );

  const hasApplied = useCallback(
    (job) => {
      if (!job) return false;
      if (job.alreadyApplied || job.hasApplied) return true;
      const jobId = job.id ?? job.jobId ?? job.job_id;
      if (jobId == null) return false;
      return appliedSet.has(String(jobId));
    },
    [appliedSet]
  );

  const openApply = useCallback(
    (job) => {
      if (!job) return;

      if (!isAuthenticated) {
        message.info("Please log in to apply for this job");
        router.push(
          `${ROUTES.PUBLIC.LOGIN}?redirect=${encodeURIComponent(
            typeof window !== "undefined" ? window.location.pathname : "/jobs"
          )}`
        );
        return;
      }

      if (hasApplied(job)) {
        message.info("You have already applied for this job");
        return;
      }

      setApplyJob(job);
    },
    [isAuthenticated, router, hasApplied]
  );

  const closeApply = useCallback(() => {
    if (submitting) return;
    setApplyJob(null);
  }, [submitting]);

  const submitApplication = useCallback(
    async (payload, resumeFile) => {
      setSubmitting(true);
      try {
        console.log("\n👤 Applicant:", user?.email || user?.name || user?.id);
        console.log("📎 Resume file:", resumeFile?.name);
        console.log("📦 Payload:", payload);
        await new Promise((r) => setTimeout(r, 700));

        const jobId = payload?.jobId;
        const next = markJobApplied(user, jobId);
        setAppliedJobIds(next);
      } finally {
        setSubmitting(false);
      }
    },
    [user]
  );

  return {
    applyJob,
    isApplyOpen: Boolean(applyJob),
    openApply,
    closeApply,
    submitApplication,
    submitting,
    hasApplied,
    appliedJobIds,
  };
};
