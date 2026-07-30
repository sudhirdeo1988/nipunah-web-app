"use client";

import React, { memo, useMemo } from "react";
import { Tag } from "antd";
import Icon from "@/components/Icon";
import { find as _find } from "lodash-es";
import CountryDetails from "@/utilities/CountryDetails.json";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { sanitizeHtml } from "@/components/RichTextEditor";
import {
  getHiringStatus,
  getHiringStatusLabel,
  getHiringStatusColor,
  isJobInHistory,
} from "../../constants/jobHiringStatuses";
import "@/components/RichTextEditor/RichTextEditor.scss";
import "./JobDetailsModal.scss";

dayjs.extend(relativeTime);

/**
 * Shared job details body (used by modal + management detail page).
 * @param {boolean} compactHeader - hide duplicate title when page toolbar already shows it
 */
const JobDetailsView = memo(({ job, compactHeader = false }) => {
  const getCountryName = useMemo(() => {
    if (!job) return null;
    const locationObj =
      job.locationObj ||
      (typeof job.location === "object" ? job.location : {}) ||
      {};
    const countryCode = locationObj.countryCode || locationObj.country || "";
    if (!countryCode) return null;
    if (countryCode.length > 2) return countryCode;
    const countryData = _find(
      CountryDetails,
      (c) => c.countryCode === countryCode
    );
    return countryData ? countryData.countryName : countryCode;
  }, [job]);

  const formatLocation = useMemo(() => {
    if (!job) return "N/A";
    const locationObj =
      job.locationObj ||
      (typeof job.location === "object" ? job.location : {}) ||
      {};
    const city = locationObj.city || "";
    const state = locationObj.state || "";
    const pin = locationObj.pinCode || locationObj.pincode || "";
    const country = getCountryName || "";
    const parts = [city, state, pin, country].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
    return typeof job.location === "string" ? job.location : "N/A";
  }, [job, getCountryName]);

  const postedLabel = useMemo(() => {
    if (!job) return "";
    const dateValue =
      job.jobPostedDate ||
      job.job_posted_date ||
      job.createdOn ||
      job.created_on ||
      job.postedOn ||
      "";
    if (!dateValue) return "Recently";
    const d = dayjs(dateValue);
    return d.isValid() ? d.fromNow() : "Recently";
  }, [job]);

  if (!job) return null;

  const salaryObj = job.salary_range || job.salaryRange;
  let salaryDisplay = "Not Disclosed";
  if (
    job.salaryNotDisclosed ||
    (typeof job.salaryRange === "string" &&
      /not\s*disclosed/i.test(job.salaryRange))
  ) {
    salaryDisplay = "Not Disclosed";
  } else if (typeof job.salaryRange === "string" && job.salaryRange) {
    salaryDisplay = job.salaryRange;
  } else if (salaryObj && typeof salaryObj === "object") {
    const minRaw = String(salaryObj.min || "").trim();
    const maxRaw = String(salaryObj.max || "").trim();
    if (/not\s*disclosed/i.test(minRaw) || /not\s*disclosed/i.test(maxRaw)) {
      salaryDisplay = "Not Disclosed";
    } else if (minRaw && maxRaw && minRaw !== maxRaw) {
      salaryDisplay = `${minRaw} - ${maxRaw}`;
    } else {
      salaryDisplay = minRaw || maxRaw || "Not Disclosed";
    }
  }

  const employmentDisplay =
    [job.employmentType, job.employmentNature || job.employment_nature]
      .filter(Boolean)
      .join(", ") || "N/A";

  const renderHtml = (html, emptyText = "Not specified") => {
    if (!html) {
      return <p className="job-view__muted">{emptyText}</p>;
    }
    if (typeof html === "string" && /<[a-z][\s\S]*>/i.test(html)) {
      return (
        <div
          className="job-rich-content"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
        />
      );
    }
    if (Array.isArray(html)) {
      return (
        <ul>
          {html.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }
    return (
      <p className="job-view__muted" style={{ whiteSpace: "pre-wrap" }}>
        {html}
      </p>
    );
  };

  return (
    <div className={`job-view${compactHeader ? " is-compact" : ""}`}>
      <section className="job-view__header-card">
        <div className="job-view__header-main">
          {!compactHeader ? (
            <h1 className="job-view__title">{job.title || "Untitled job"}</h1>
          ) : null}
          <div className="job-view__company">
            <span className="job-view__company-name">
              {job.postedBy?.companyName || "Company"}
            </span>
            {job.postedBy?.companyShortName && (
              <span className="job-view__company-sub">
                Posted by {job.postedBy.companyShortName}
              </span>
            )}
          </div>

          <div className="job-view__meta-row">
            <div className="job-view__meta-item">
              <Icon name="work" size="small" />
              <span>{job.experienceRequired || "N/A"}</span>
            </div>
            <div className="job-view__meta-item">
              <Icon name="payments" size="small" />
              <span>{salaryDisplay}</span>
            </div>
            <div className="job-view__meta-item">
              <Icon name="location_on" size="small" />
              <span>{formatLocation}</span>
            </div>
          </div>

          <div className="job-view__stats-row">
            <span>Posted: {postedLabel}</span>
            <span className="job-view__dot">·</span>
            <span>
              Openings: {job.openings != null ? job.openings : "N/A"}
            </span>
            <span className="job-view__dot">·</span>
            <span>
              Applicants: {job.peopleApplied != null ? job.peopleApplied : 0}
            </span>
          </div>
        </div>
        <div className="job-view__header-side">
          <Tag
            color={
              isJobInHistory(job)
                ? getHiringStatusColor(getHiringStatus(job))
                : job.isActive !== false
                  ? "success"
                  : "default"
            }
          >
            {isJobInHistory(job)
              ? getHiringStatusLabel(getHiringStatus(job))
              : job.isActive !== false
                ? "Active"
                : "Inactive"}
          </Tag>
        </div>
      </section>

      <section className="job-view__card">
        {job.qualifications && (
          <div className="job-view__block">
            <h3>Qualifications</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>{job.qualifications}</p>
          </div>
        )}

        <div className="job-view__block">
          <h3>Job Description</h3>
          {renderHtml(job.description, "No description available")}
        </div>

        {(job.keyResponsibilities || job.key_responsibilities) && (
          <div className="job-view__block">
            <h3>Key Responsibilities</h3>
            {renderHtml(job.keyResponsibilities || job.key_responsibilities)}
          </div>
        )}

        <div className="job-view__block">
          <h3>Required Skills</h3>
          {renderHtml(
            job.requiredSkills || job.required_skills || job.skillsRequired,
            "No required skills listed"
          )}
        </div>

        {(job.weOffer || job.we_offer) && (
          <div className="job-view__block">
            <h3>We Offer</h3>
            {renderHtml(job.weOffer || job.we_offer)}
          </div>
        )}

        <div className="job-view__detail-grid">
          <div>
            <span className="job-view__label">Employment Type</span>
            <span className="job-view__value">{employmentDisplay}</span>
          </div>
          <div>
            <span className="job-view__label">Work Mode</span>
            <span className="job-view__value">
              {job.workMode || job.work_mode || "N/A"}
            </span>
          </div>
          <div>
            <span className="job-view__label">Job Posted Date</span>
            <span className="job-view__value">
              {job.jobPostedDate || job.job_posted_date || "N/A"}
            </span>
          </div>
          <div>
            <span className="job-view__label">Application Deadline</span>
            <span className="job-view__value">
              {job.applicationDeadline || job.application_deadline || "N/A"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
});

JobDetailsView.displayName = "JobDetailsView";

export default JobDetailsView;
