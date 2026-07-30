"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { useRole } from "@/hooks/useRole";
import { ROUTES } from "@/constants/routes";
import { publicApplyApi } from "@/module/Job/services/jobModuleApi";
import {
  getAppliedJobIds,
  markJobApplied,
} from "../utils/appliedJobsStorage";

/**
 * Shared apply-job modal state.
 * Submit: loading / success / error + mock API (swap endpoint in publicApplyApi).
 */
export const useApplyJob = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useRole();
  const [applyJob, setApplyJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState([]);

  const userKey = useMemo(() => {
    if (!user) return null;
    return String(user.id ?? user.user_id ?? user.userId ?? user.email ?? "");
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setAppliedJobIds([]);
      return;
    }
    setAppliedJobIds(getAppliedJobIds(user));
  }, [isAuthenticated, userKey]); // eslint-disable-line react-hooks/exhaustive-deps -- stable user key

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

      setError(null);
      setApplyJob(job);
    },
    [isAuthenticated, router, hasApplied]
  );

  const closeApply = useCallback(() => {
    if (submitting) return;
    setApplyJob(null);
    setError(null);
  }, [submitting]);

  /**
   * Submit apply form.
   * @param {Object} payload
   * @param {File|null} resumeFile
   */
  const submitApplication = useCallback(
    async (payload, resumeFile) => {
      setSubmitting(true);
      setError(null);
      try {
        const jobId = payload?.jobId ?? applyJob?.id ?? applyJob?.jobId;
        console.log("\n📄 APPLY JOB FORM — submit");
        console.log(JSON.stringify({ ...payload, jobId }, null, 2));

        const response = await publicApplyApi.apply(jobId, payload, resumeFile);

        if (response?.success === false) {
          throw new Error(response?.message || "Failed to apply");
        }

        const next = markJobApplied(user, jobId);
        setAppliedJobIds(next);
        message.success(response?.message || "Application submitted");
        setApplyJob(null);
        return response;
      } catch (err) {
        console.error("❌ Apply job failed:", err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to submit application";
        setError(err);
        message.error(msg);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [user, applyJob]
  );

  return {
    applyJob,
    isApplyOpen: Boolean(applyJob),
    openApply,
    closeApply,
    submitApplication,
    submitting,
    error,
    hasApplied,
    appliedJobIds,
  };
};
