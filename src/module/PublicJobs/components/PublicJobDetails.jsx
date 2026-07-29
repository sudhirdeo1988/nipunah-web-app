"use client";

import React, { memo, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { sanitizeHtml } from "@/components/RichTextEditor";
import "@/components/RichTextEditor/RichTextEditor.scss";
import { ROUTES } from "@/constants/routes";
import { PUBLIC_JOBS_MOCK } from "../constants/publicJobsMock";
import "./PublicJobDetails.scss";

dayjs.extend(relativeTime);

const stripHtml = (html) =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const formatSalary = (job) => {
  if (job?.salaryNotDisclosed) return "Not Disclosed";
  const salaryObj = job?.salaryRange;
  if (salaryObj && typeof salaryObj === "object") {
    const minRaw = String(salaryObj.min || "").trim();
    const maxRaw = String(salaryObj.max || "").trim();
    if (/not\s*disclosed/i.test(minRaw) || /not\s*disclosed/i.test(maxRaw)) {
      return "Not Disclosed";
    }
    if (minRaw && maxRaw && minRaw !== maxRaw) return `${minRaw} - ${maxRaw}`;
    return minRaw || maxRaw || "Not Disclosed";
  }
  if (typeof job?.salaryRange === "string") return job.salaryRange;
  return "Not Disclosed";
};

const formatPosted = (job) => {
  const raw = job?.createdOn || job?.jobPostedDate || "";
  if (!raw) return "Recently";
  const d = dayjs(raw);
  return d.isValid() ? d.fromNow() : "Recently";
};

const formatApplicants = (count) => {
  const n = Number(count) || 0;
  if (n >= 100) return "100+";
  if (n >= 50) return "50+";
  return String(n);
};

const getRelatedJobs = (job, limit = 4) => {
  if (!job) return [];
  const companyId = job.postedBy?.companyId;
  const others = PUBLIC_JOBS_MOCK.filter(
    (j) => String(j.id) !== String(job.id)
  );

  const sameCompany = others.filter(
    (j) =>
      companyId != null &&
      String(j.postedBy?.companyId) === String(companyId)
  );

  if (sameCompany.length >= limit) return sameCompany.slice(0, limit);

  const city = job.location?.city;
  const workMode = job.workMode;
  const fillers = others.filter((j) => {
    if (sameCompany.some((s) => s.id === j.id)) return false;
    return (
      (city && j.location?.city === city) ||
      (workMode && j.workMode === workMode) ||
      j.employmentType === job.employmentType
    );
  });

  return [...sameCompany, ...fillers].slice(0, limit);
};

const RelatedJobItem = memo(({ job }) => {
  const initials = String(
    job.postedBy?.companyShortName || job.postedBy?.companyName || "JB"
  )
    .slice(0, 2)
    .toUpperCase();
  const href = `${ROUTES.PUBLIC.JOBS}/${job.id}`;

  return (
    <Link href={href} className="public-job-details__related-item">
      <div className="public-job-details__related-main">
        <h4 className="public-job-details__related-title">{job.title}</h4>
        <div className="public-job-details__related-meta">
          <span>
            <Icon name="work" />
            {(job.experienceRequired || "N/A").replace(/ years?/i, " Yrs")}
          </span>
          <span>
            <Icon name="location_on" />
            {job.location?.city || job.location?.country || "N/A"}
          </span>
        </div>
        <span className="public-job-details__related-posted">
          Posted {formatPosted(job)}
        </span>
      </div>
      <div className="public-job-details__related-logo" aria-hidden>
        {initials}
      </div>
    </Link>
  );
});

RelatedJobItem.displayName = "RelatedJobItem";

const PublicJobDetails = memo(({ job, onApply, hasApplied = false }) => {
  const [descExpanded, setDescExpanded] = useState(false);

  const companyName = job?.postedBy?.companyName || "Company";
  const initials = String(
    job?.postedBy?.companyShortName || companyName || "JB"
  )
    .slice(0, 2)
    .toUpperCase();

  const salary = formatSalary(job);
  const city = job?.location?.city || job?.location?.country || "N/A";
  const relatedJobs = useMemo(() => getRelatedJobs(job), [job]);

  const descriptionText = useMemo(
    () => stripHtml(job?.description),
    [job]
  );
  const showReadMore = descriptionText.length > 220;
  const visibleDescription =
    !descExpanded && showReadMore
      ? `${descriptionText.slice(0, 220)}...`
      : descriptionText;

  const skillTags = job?.skillTags || [];
  const preferred = new Set(job?.preferredSkillTags || []);

  const highlights = useMemo(() => {
    const items = [];
    if (job?.workMode) {
      items.push({
        label: job.workMode,
        sub: "Work mode",
        icon: "laptop_mac",
      });
    }
    if (job?.employmentType) {
      items.push({
        label: job.employmentType,
        sub: "Employment",
        icon: "badge",
      });
    }
    if (job?.weOffer) {
      items.push({
        label: "Benefits",
        sub: "Highly rated",
        icon: "apartment",
      });
    }
    return items.slice(0, 3);
  }, [job]);

  return (
    <div className="public-job-details">
      <div className="row g-3">
        <div className="col-lg-8 col-12">
          <section className="public-job-details__card public-job-details__header">
            <div className="public-job-details__header-top">
              <div className="public-job-details__header-main">
                <h1 className="public-job-details__title">
                  {job.title || "Untitled job"}
                </h1>
                <div className="public-job-details__company-row">
                  <span className="public-job-details__company">{companyName}</span>
                </div>

                <div className="public-job-details__quick">
                  <span>
                    <Icon name="work" />
                    {job.experienceRequired || "N/A"}
                  </span>
                  <span className="public-job-details__sep" />
                  <span>
                    <Icon name="payments" />
                    {salary}
                  </span>
                </div>

                <div className="public-job-details__location">
                  <Icon name="location_on" />
                  <span>{city}</span>
                  {job.workMode ? (
                    <>
                      <span className="public-job-details__sep" />
                      <span>{job.workMode}</span>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="public-job-details__logo" aria-hidden>
                {initials}
              </div>
            </div>

            <div className="public-job-details__header-footer">
              <div className="public-job-details__stats">
                <span>Posted: {formatPosted(job)}</span>
                <span className="public-job-details__sep" />
                <span>
                  Applicants: {formatApplicants(job.peopleApplied ?? 42)}
                </span>
              </div>
              {hasApplied ? (
                <span className="public-job-details__applied">
                  <Icon name="check_circle" isFilled />
                  Applied
                </span>
              ) : (
                <button
                  type="button"
                  className="public-job-details__apply"
                  onClick={() => onApply?.(job)}
                >
                  Apply now
                </button>
              )}
            </div>
          </section>

          <section className="public-job-details__card">
            <h2 className="public-job-details__section-title">Job description</h2>

            {job.qualifications ? (
              <div className="public-job-details__block">
                <h3>Qualifications</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>{job.qualifications}</p>
              </div>
            ) : null}

            <div className="public-job-details__block">
              <p className="public-job-details__desc-text">
                {visibleDescription}
                {showReadMore ? (
                  <button
                    type="button"
                    className="public-job-details__read-more"
                    onClick={() => setDescExpanded((v) => !v)}
                  >
                    {descExpanded ? " read less" : " read more"}
                  </button>
                ) : null}
              </p>
            </div>

            {(job.keyResponsibilities || job.key_responsibilities) && (
              <div className="public-job-details__block">
                <h3>Key Responsibilities</h3>
                <div
                  className="job-rich-content"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(
                      job.keyResponsibilities || job.key_responsibilities
                    ),
                  }}
                />
              </div>
            )}

            {skillTags.length > 0 ? (
              <div className="public-job-details__block">
                <h3>Key Skills</h3>
                <p className="public-job-details__skills-hint">
                  Skills highlighted with &quot;☆&quot; are preferred keyskills
                </p>
                <div className="public-job-details__skills">
                  {skillTags.map((skill) => {
                    const isPreferred = preferred.has(skill);
                    return (
                      <span
                        key={skill}
                        className={`public-job-details__skill-tag ${
                          isPreferred ? "is-preferred" : ""
                        }`}
                      >
                        {isPreferred ? "☆ " : ""}
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {(job.weOffer || job.we_offer) && (
              <div className="public-job-details__block">
                <h3>We Offer</h3>
                <div
                  className="job-rich-content"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(job.weOffer || job.we_offer),
                  }}
                />
              </div>
            )}

            <div className="public-job-details__grid">
              <div>
                <span className="public-job-details__label">Employment Type</span>
                <span className="public-job-details__value">
                  {[job.employmentType, job.employmentNature]
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </span>
              </div>
              <div>
                <span className="public-job-details__label">Openings</span>
                <span className="public-job-details__value">
                  {job.openings != null ? job.openings : "N/A"}
                </span>
              </div>
              <div>
                <span className="public-job-details__label">Posted Date</span>
                <span className="public-job-details__value">
                  {job.jobPostedDate || "N/A"}
                </span>
              </div>
              <div>
                <span className="public-job-details__label">
                  Application Deadline
                </span>
                <span className="public-job-details__value">
                  {job.applicationDeadline || "N/A"}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="col-lg-4 col-12">
          <div className="public-job-details__sidebar">
            {relatedJobs.length > 0 ? (
              <section className="public-job-details__card public-job-details__related">
                <h2 className="public-job-details__section-title">
                  {relatedJobs.some(
                    (j) =>
                      String(j.postedBy?.companyId) ===
                      String(job.postedBy?.companyId)
                  )
                    ? `${companyName} roles you might be interested in`
                    : "Jobs you might be interested in"}
                </h2>
                <div className="public-job-details__related-list">
                  {relatedJobs.map((item) => (
                    <RelatedJobItem key={item.id} job={item} />
                  ))}
                </div>
              </section>
            ) : null}

            {highlights.length > 0 ? (
              <section className="public-job-details__card">
                <h2 className="public-job-details__section-title">
                  Key highlights at {companyName}
                </h2>
                <div className="public-job-details__highlights">
                  {highlights.map((item) => (
                    <div
                      key={item.label}
                      className="public-job-details__highlight"
                    >
                      <div className="public-job-details__highlight-icon">
                        <Icon name={item.icon} />
                      </div>
                      <div>
                        <div className="public-job-details__highlight-label">
                          {item.label}
                        </div>
                        <div className="public-job-details__highlight-sub">
                          {item.sub}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
});

PublicJobDetails.displayName = "PublicJobDetails";

export default PublicJobDetails;
