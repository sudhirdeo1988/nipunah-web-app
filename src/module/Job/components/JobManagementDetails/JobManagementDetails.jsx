"use client";

import React, { memo, useMemo, useState } from "react";
import { Tabs, message } from "antd";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { ROUTES } from "@/constants/routes";
import JobDetailsView from "../JobModals/JobDetailsView";
import AppliedCandidatesTab from "./AppliedCandidatesTab";
import CloseJobModal from "../JobModals/CloseJobModal";
import { stashJobForEdit } from "../../utils/jobFormMapper";
import {
  buildJobClosurePayload,
  isJobInHistory,
} from "../../constants/jobHiringStatuses";
import { jobService } from "@/utilities/apiServices";
import "./JobManagementDetails.scss";

const JobManagementDetails = memo(
  ({
    job,
    activeTab = "details",
    permissions = {},
    onJobUpdated,
  }) => {
    const router = useRouter();
    const jobId = job?.id || job?.jobId || job?.job_id;
    const canEdit = Boolean(permissions.edit);
    const inHistory = isJobInHistory(job);

    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [closingJob, setClosingJob] = useState(false);

    const locationLabel = useMemo(() => {
      if (typeof job?.location === "string" && job.location) return job.location;
      if (job?.location?.city) {
        return [job.location.city, job.location.state, job.location.country]
          .filter(Boolean)
          .join(", ");
      }
      return "";
    }, [job]);

    const tabItems = useMemo(
      () => [
        {
          key: "details",
          label: (
            <span className="d-inline-flex align-items-center gap-1">
              <Icon name="work" size="small" />
              Job Detail
            </span>
          ),
          children: (
            <div className="job-management-details__panel">
              <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                  <JobDetailsView job={job} compactHeader />
                </div>
              </div>
            </div>
          ),
        },
        {
          key: "candidates",
          label: (
            <span className="d-inline-flex align-items-center gap-1">
              <Icon name="people" size="small" />
              Applied candidates
              {job?.peopleApplied != null ? (
                <span className="job-management-details__count">
                  {job.peopleApplied}
                </span>
              ) : null}
            </span>
          ),
          children: (
            <div className="job-management-details__panel">
              <AppliedCandidatesTab jobId={jobId} />
            </div>
          ),
        },
      ],
      [job, jobId]
    );

    const handleTabChange = (key) => {
      if (!jobId) return;
      const base = `${ROUTES.PRIVATE.JOB}/${jobId}`;
      router.replace(key === "candidates" ? `${base}?tab=candidates` : base);
    };

    const handleConfirmClose = async (hiringStatus) => {
      if (!jobId) {
        message.error("Job id is missing");
        return;
      }
      setClosingJob(true);
      try {
        const response = await jobService.updateJob(
          jobId,
          buildJobClosurePayload(hiringStatus)
        );
        const updated = response?.data ?? {
          ...job,
          ...buildJobClosurePayload(hiringStatus),
        };
        message.success(
          hiringStatus === "filled"
            ? "Job marked as Filled and moved to history"
            : "Job marked as Closed and moved to history"
        );
        setIsCloseModalOpen(false);
        onJobUpdated?.(updated);
      } catch (err) {
        console.error("Failed to close job:", err);
        message.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to update job"
        );
      } finally {
        setClosingJob(false);
      }
    };

    return (
      <div className="job-management-details">
        <div className="job-management-details__toolbar mb-3">
          <div className="min-w-0">
            <div className="job-management-details__title-row">
              <h2 className="job-management-details__title C-heading size-4 semiBold mb-0">
                {job?.title}
              </h2>
              {canEdit ? (
                <div className="job-management-details__title-actions">
                  <button
                    type="button"
                    className="job-management-details__title-action"
                    onClick={() => {
                      stashJobForEdit(job);
                      router.push(`${ROUTES.PRIVATE.JOB_EDIT}/${jobId}`);
                    }}
                  >
                    Edit
                  </button>
                  {!inHistory ? (
                    <>
                      <span
                        className="job-management-details__title-sep"
                        aria-hidden
                      >
                        |
                      </span>
                      <button
                        type="button"
                        className="job-management-details__title-action is-close"
                        onClick={() => setIsCloseModalOpen(true)}
                      >
                        Close Position
                      </button>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="C-heading size-xss text-muted mb-0 mt-1">
              {job?.postedBy?.companyName || "Company"}
              {locationLabel ? ` · ${locationLabel}` : ""}
            </div>
          </div>
        </div>

        <Tabs
          type="card"
          className="C-tab job-management-details__tabs"
          activeKey={activeTab === "candidates" ? "candidates" : "details"}
          onChange={handleTabChange}
          items={tabItems}
        />

        <CloseJobModal
          isOpen={isCloseModalOpen}
          job={job}
          onConfirm={handleConfirmClose}
          onCancel={() => setIsCloseModalOpen(false)}
          loading={closingJob}
        />
      </div>
    );
  }
);

JobManagementDetails.displayName = "JobManagementDetails";

export default JobManagementDetails;
