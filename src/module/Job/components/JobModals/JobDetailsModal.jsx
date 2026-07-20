"use client";

import React, { memo, useMemo } from "react";
import { Modal, Tag, Space, Divider } from "antd";
import Icon from "@/components/Icon";
import { find as _find } from "lodash-es";
import CountryDetails from "@/utilities/CountryDetails.json";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { sanitizeHtml } from "@/components/RichTextEditor";
import "@/components/RichTextEditor/RichTextEditor.scss";
import "./JobDetailsModal.scss";

dayjs.extend(relativeTime);

/**
 * Naukri-style Job Details view (fullscreen modal).
 */
const JobDetailsModal = memo(({ isOpen, job, onCancel }) => {
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
    const workMode = job.workMode || job.work_mode || "";
    const parts = [city, state].filter(Boolean);
    let text =
      parts.length > 0
        ? parts.join(", ")
        : typeof job.location === "string"
        ? job.location
        : "N/A";
    if (workMode) text = `${text}${text !== "N/A" ? " / " : ""}${workMode}`;
    return text;
  }, [job]);

  const postedLabel = useMemo(() => {
    if (!job) return "";
    const dateValue =
      job.createdOn ||
      job.created_on ||
      job.postedOn ||
      job.posted_on ||
      "";
    if (!dateValue) return "Recently";
    const d = dayjs(dateValue);
    return d.isValid() ? d.fromNow() : "Recently";
  }, [job]);

  if (!job) return null;

  const salaryDisplay =
    job.salaryNotDisclosed ||
    (typeof job.salaryRange === "string" &&
      /not\s*disclosed/i.test(job.salaryRange))
      ? "Not Disclosed"
      : job.salaryRange || "Not Disclosed";

  const educationDisplay =
    [
      job.education,
      job.educationSpecialization || job.education_specialization,
    ]
      .filter(Boolean)
      .join(" in ") || "N/A";

  const employmentDisplay =
    [
      job.employmentType,
      job.employmentNature || job.employment_nature,
    ]
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

  const keySkills = Array.isArray(job.keySkills) ? job.keySkills : [];
  const preferredKeySkills = Array.isArray(job.preferredKeySkills)
    ? job.preferredKeySkills
    : [];

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      width="100%"
      centered={false}
      className="job-details-naukri-modal"
      style={{ top: 0, maxWidth: "100vw", paddingBottom: 0, margin: 0 }}
      styles={{
        content: {
          borderRadius: 0,
          minHeight: "100vh",
          background: "#f7f8fa",
        },
        body: {
          padding: 0,
          maxHeight: "100vh",
          overflowY: "auto",
        },
      }}
      closable
    >
      <div className="job-view">
        <div className="job-view__toolbar">
          <button
            type="button"
            className="C-button is-bordered small"
            onClick={onCancel}
          >
            <Space size={6}>
              <Icon name="arrow_back" size="small" />
              Back to jobs
            </Space>
          </button>
        </div>

        <div className="job-view__shell">
          {/* Header card — Naukri style */}
          <section className="job-view__header-card">
            <div className="job-view__header-main">
              <h1 className="job-view__title">{job.title || "Untitled job"}</h1>
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
                  Openings:{" "}
                  {job.openings != null ? job.openings : "N/A"}
                </span>
                <span className="job-view__dot">·</span>
                <span>
                  Applicants: {job.peopleApplied != null ? job.peopleApplied : 0}
                </span>
                {getCountryName && (
                  <>
                    <span className="job-view__dot">·</span>
                    <span>{getCountryName}</span>
                  </>
                )}
              </div>
            </div>
            <div className="job-view__header-side">
              <div className="job-view__logo">
                {(job.postedBy?.companyShortName ||
                  job.postedBy?.companyName ||
                  "J")
                  .toString()
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <Tag
                color={
                  job.status === "approved"
                    ? "success"
                    : job.status === "blocked"
                    ? "error"
                    : "warning"
                }
              >
                {job.status
                  ? job.status.charAt(0).toUpperCase() + job.status.slice(1)
                  : "Pending"}
              </Tag>
            </div>
          </section>

          {/* Job description card */}
          <section className="job-view__card">
            <h2 className="job-view__section-title">Job description</h2>

            {(job.role || job.experienceRequired || formatLocation) && (
              <div className="job-view__quick-facts">
                {job.role && (
                  <p>
                    <strong>Role:</strong> {job.role}
                  </p>
                )}
                {job.experienceRequired && (
                  <p>
                    <strong>Experience:</strong> {job.experienceRequired}
                  </p>
                )}
                <p>
                  <strong>Location:</strong> {formatLocation}
                </p>
              </div>
            )}

            {job.qualifications && (
              <div className="job-view__block">
                <h3>Qualifications</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>{job.qualifications}</p>
              </div>
            )}

            <div className="job-view__block">
              <h3>Job summary</h3>
              {renderHtml(job.description, "No description available")}
            </div>

            {(job.keyResponsibilities || job.key_responsibilities) && (
              <div className="job-view__block">
                <h3>Key Responsibilities</h3>
                {renderHtml(
                  job.keyResponsibilities || job.key_responsibilities
                )}
              </div>
            )}

            <div className="job-view__block">
              <h3>Required Skills</h3>
              {renderHtml(
                job.requiredSkills ||
                  job.required_skills ||
                  job.skillsRequired,
                "No required skills listed"
              )}
            </div>

            {(job.preferredSkills || job.preferred_skills) && (
              <div className="job-view__block">
                <h3>Preferred Skills</h3>
                {renderHtml(job.preferredSkills || job.preferred_skills)}
              </div>
            )}

            <Divider />

            <div className="job-view__detail-grid">
              <div>
                <span className="job-view__label">Role</span>
                <span className="job-view__value">{job.role || "N/A"}</span>
              </div>
              <div>
                <span className="job-view__label">Industry Type</span>
                <span className="job-view__value">{job.industry || "N/A"}</span>
              </div>
              <div>
                <span className="job-view__label">Department</span>
                <span className="job-view__value">
                  {job.department || "N/A"}
                </span>
              </div>
              <div>
                <span className="job-view__label">Employment Type</span>
                <span className="job-view__value">{employmentDisplay}</span>
              </div>
              <div>
                <span className="job-view__label">Role Category</span>
                <span className="job-view__value">
                  {job.roleCategory || job.role_category || "N/A"}
                </span>
              </div>
              <div>
                <span className="job-view__label">Work Mode</span>
                <span className="job-view__value">
                  {job.workMode || job.work_mode || "N/A"}
                </span>
              </div>
            </div>

            <div className="job-view__block mt-4">
              <h3>Education</h3>
              <p>
                <strong>UG:</strong> {educationDisplay}
              </p>
            </div>

            {(keySkills.length > 0 || preferredKeySkills.length > 0) && (
              <div className="job-view__block">
                <h3>Key Skills</h3>
                <p className="job-view__skills-hint">
                  Skills with ★ are preferred keyskills
                </p>
                <Space wrap size={[8, 8]}>
                  {keySkills.map((skill, index) => (
                    <Tag key={`k-${index}`} className="job-view__skill-tag">
                      {skill}
                    </Tag>
                  ))}
                  {preferredKeySkills.map((skill, index) => (
                    <Tag
                      key={`p-${index}`}
                      className="job-view__skill-tag is-preferred"
                      color="gold"
                    >
                      ★ {skill}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </section>
        </div>
      </div>
    </Modal>
  );
});

JobDetailsModal.displayName = "JobDetailsModal";

export default JobDetailsModal;
