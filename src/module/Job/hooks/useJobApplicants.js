"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import {
  buildMockGetApplicantsResponse,
  createStageEntry,
} from "../constants/mockApplicants";
import { APPLICATION_STATUS } from "../constants/applicationStatuses";
import { jobApplicantsApi } from "../services/jobModuleApi";

/**
 * Applicants for a job — mock API with loading / success / error on mutations.
 */
export const useJobApplicants = (jobId) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadApplicants = useCallback(async () => {
    if (!jobId) {
      setApplicants([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await jobApplicantsApi.list(jobId);
      const list =
        response?.data ||
        buildMockGetApplicantsResponse(jobId)?.data ||
        [];
      setApplicants(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load applicants:", err);
      setError(err);
      message.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load applicants"
      );
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);

  const filteredApplicants = useMemo(() => {
    if (statusFilter === "all") return applicants;
    return applicants.filter((a) => a.status === statusFilter);
  }, [applicants, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { all: applicants.length };
    applicants.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return counts;
  }, [applicants]);

  const applyStageUpdateLocal = useCallback(
    (applicantId, { status, remarks = "", interview }) => {
      setApplicants((prev) =>
        prev.map((a) => {
          if (a.id !== applicantId) return a;
          const stage = createStageEntry({
            status,
            remarks,
            interview:
              interview !== undefined ? interview : a.interview || null,
          });
          const nextInterview =
            interview !== undefined ? interview : a.interview;
          return {
            ...a,
            status,
            remarks: remarks || a.remarks || "",
            interview: nextInterview,
            stageHistory: [...(a.stageHistory || []), stage],
          };
        })
      );
    },
    []
  );

  const shortlistApplicant = useCallback(
    async (applicant, remarks = "") => {
      const payload = {
        status: APPLICATION_STATUS.SHORTLISTED,
        remarks: remarks || "Shortlisted by hiring team.",
      };
      setMutating(true);
      setError(null);
      try {
        console.log("\n📄 SHORTLIST APPLICANT FORM");
        await jobApplicantsApi.updateStatus(jobId, applicant.id, payload);
        applyStageUpdateLocal(applicant.id, payload);
        message.success(`${applicant.name} shortlisted`);
      } catch (err) {
        setError(err);
        message.error(err?.message || "Failed to shortlist");
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [jobId, applyStageUpdateLocal]
  );

  const scheduleInterview = useCallback(
    async (applicant, interview, remarks = "") => {
      const payload = {
        ...interview,
        remarks: remarks || "Interview scheduled.",
      };
      setMutating(true);
      setError(null);
      try {
        console.log("\n📄 SCHEDULE INTERVIEW FORM");
        await jobApplicantsApi.scheduleInterview(jobId, applicant.id, payload);
        applyStageUpdateLocal(applicant.id, {
          status: APPLICATION_STATUS.INTERVIEW_SCHEDULED,
          remarks: payload.remarks,
          interview,
        });
        message.success(`Interview scheduled for ${applicant.name}`);
      } catch (err) {
        setError(err);
        message.error(err?.message || "Failed to schedule interview");
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [jobId, applyStageUpdateLocal]
  );

  const rejectApplicant = useCallback(
    async (applicant, remarks) => {
      const payload = { remarks: remarks || "" };
      setMutating(true);
      setError(null);
      try {
        console.log("\n📄 REJECT APPLICANT FORM");
        await jobApplicantsApi.reject(jobId, applicant.id, payload);
        applyStageUpdateLocal(applicant.id, {
          status: APPLICATION_STATUS.REJECTED,
          remarks: payload.remarks,
        });
        message.success(`${applicant.name} rejected`);
      } catch (err) {
        setError(err);
        message.error(err?.message || "Failed to reject applicant");
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [jobId, applyStageUpdateLocal]
  );

  const updateStatus = useCallback(
    async (applicant, status, remarks = "") => {
      const payload = {
        status,
        remarks,
        interview: applicant.interview,
      };
      setMutating(true);
      setError(null);
      try {
        console.log("\n📄 UPDATE APPLICANT STATUS FORM");
        await jobApplicantsApi.updateStatus(jobId, applicant.id, payload);
        applyStageUpdateLocal(applicant.id, payload);
        message.success(`Status updated for ${applicant.name}`);
      } catch (err) {
        setError(err);
        message.error(err?.message || "Failed to update status");
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [jobId, applyStageUpdateLocal]
  );

  return {
    applicants,
    filteredApplicants,
    loading,
    mutating,
    error,
    statusFilter,
    setStatusFilter,
    statusCounts,
    shortlistApplicant,
    scheduleInterview,
    rejectApplicant,
    updateStatus,
    reload: loadApplicants,
  };
};
