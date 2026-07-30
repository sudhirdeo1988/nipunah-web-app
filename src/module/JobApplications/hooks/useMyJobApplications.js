"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { useAppSelector } from "@/store/hooks";
import {
  getAppliedJobIds,
  removeAppliedJob,
} from "@/module/PublicJobs/utils/appliedJobsStorage";
import { createStageEntry } from "@/module/Job/constants/mockApplicants";
import { myApplicationsApi } from "@/module/Job/services/jobModuleApi";
import {
  buildMockMyApplications,
  canCandidateRespond,
  CANDIDATE_RESPONSE,
} from "../constants/mockMyApplications";

/**
 * Candidate-side applications list.
 * Respond / delete submit handlers: loading, success, error + mock API.
 */
export const useMyJobApplications = () => {
  const user = useAppSelector((state) => state.user?.user);
  const userKey = useMemo(() => {
    if (!user) return null;
    return String(user.id ?? user.user_id ?? user.userId ?? user.email ?? "");
  }, [user]);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await myApplicationsApi.list();
      const appliedIds = getAppliedJobIds(user);
      setApplications(buildMockMyApplications(appliedIds));
    } catch (err) {
      console.error("Failed to load job applications:", err);
      setError(err);
      message.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load your applications"
      );
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [userKey]); // eslint-disable-line react-hooks/exhaustive-deps -- stable user key

  useEffect(() => {
    load();
  }, [load]);

  const filteredApplications = useMemo(() => {
    if (statusFilter === "all") return applications;
    if (statusFilter === "candidate_accepted") {
      return applications.filter(
        (a) => a.candidateResponse === CANDIDATE_RESPONSE.ACCEPTED
      );
    }
    if (statusFilter === "candidate_rejected") {
      return applications.filter(
        (a) => a.candidateResponse === CANDIDATE_RESPONSE.REJECTED
      );
    }
    return applications.filter((a) => a.status === statusFilter);
  }, [applications, statusFilter]);

  const respondToApplication = useCallback(
    async (applicationId, response, remarks = "") => {
      setMutating(true);
      setError(null);
      try {
        const payload = {
          response,
          remarks: remarks?.trim() || undefined,
        };
        console.log("\n📄 CANDIDATE RESPOND FORM");
        await myApplicationsApi.respond(applicationId, payload);

        setApplications((prev) =>
          prev.map((app) => {
            if (
              app.id !== applicationId &&
              app.applicationId !== applicationId
            ) {
              return app;
            }
            if (!canCandidateRespond(app)) return app;

            const date = new Date().toISOString().slice(0, 10);
            const label =
              response === CANDIDATE_RESPONSE.ACCEPTED
                ? "You accepted this application stage"
                : "You rejected / withdrew this application";
            const note =
              remarks?.trim() ||
              (response === CANDIDATE_RESPONSE.ACCEPTED
                ? "Candidate accepted."
                : "Candidate rejected / withdrew.");

            return {
              ...app,
              candidateResponse: response,
              candidateResponseAt: date,
              candidateRemarks: note,
              stageHistory: [
                ...(app.stageHistory || []),
                createStageEntry({
                  status: app.status,
                  remarks: `${label}${note ? ` ${note}` : ""}`,
                  date,
                  interview: app.interview,
                }),
              ],
            };
          })
        );

        message.success(
          response === CANDIDATE_RESPONSE.ACCEPTED
            ? "You accepted this application"
            : "You rejected this application"
        );
      } catch (err) {
        setError(err);
        message.error(err?.message || "Failed to update application");
        throw err;
      } finally {
        setMutating(false);
      }
    },
    []
  );

  const deleteApplication = useCallback(
    async (applicationId, remarks = "") => {
      setMutating(true);
      setError(null);
      try {
        const payload = {
          remarks: remarks?.trim() || undefined,
          action: "reject_and_delete",
        };
        console.log("\n📄 DELETE APPLICATION FORM (reject then delete)");
        await myApplicationsApi.remove(applicationId, payload);

        setApplications((prev) => {
          const target = prev.find(
            (app) =>
              app.id === applicationId || app.applicationId === applicationId
          );
          if (!target) return prev;
          if (target.jobId != null) {
            removeAppliedJob(user, target.jobId);
          }
          return prev.filter(
            (app) =>
              app.id !== applicationId && app.applicationId !== applicationId
          );
        });

        message.success("Application rejected and removed");
      } catch (err) {
        setError(err);
        message.error(err?.message || "Failed to delete application");
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [user]
  );

  return {
    applications,
    filteredApplications,
    loading,
    mutating,
    error,
    statusFilter,
    setStatusFilter,
    respondToApplication,
    deleteApplication,
    reload: load,
  };
};
