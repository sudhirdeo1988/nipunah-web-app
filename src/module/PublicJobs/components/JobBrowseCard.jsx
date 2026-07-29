"use client";

import React, { memo, useMemo } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ROUTES } from "@/constants/routes";
import "./JobBrowseCard.scss";

dayjs.extend(relativeTime);

const stripHtml = (html) =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const JobBrowseCard = memo(({ job, onApply, hasApplied = false }) => {
  const detailHref = `${ROUTES.PUBLIC.JOBS}/${job?.id || job?.jobId}`;

  const companyInitials = useMemo(() => {
    const name =
      job?.postedBy?.companyShortName || job?.postedBy?.companyName || "JB";
    return String(name).slice(0, 2).toUpperCase();
  }, [job]);

  const city = job?.location?.city || job?.location?.country || "N/A";
  const experience = job?.experienceRequired || "N/A";
  const snippet = useMemo(() => {
    const text = stripHtml(job?.description);
    if (!text) return "No description available.";
    return text.length > 110 ? `${text.slice(0, 110)}...` : text;
  }, [job]);

  const skills = job?.skillTags?.length
    ? job.skillTags
    : stripHtml(job?.requiredSkills)
        .split(/[|,]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 8);

  const postedLabel = useMemo(() => {
    const raw =
      job?.createdOn || job?.jobPostedDate || job?.job_posted_date || "";
    if (!raw) return "Recently";
    const d = dayjs(raw);
    return d.isValid() ? d.fromNow() : "Recently";
  }, [job]);

  return (
    <article className="job-browse-card">
      <div className="job-browse-card__header">
        <div className="job-browse-card__logo" aria-hidden>
          {companyInitials}
        </div>
        <div className="job-browse-card__header-main">
          <h3 className="job-browse-card__title">
            <Link href={detailHref} className="job-browse-card__title-link">
              {job?.title || "Untitled job"}
            </Link>
          </h3>
          <div className="job-browse-card__company-row">
            <span className="job-browse-card__company">
              {job?.postedBy?.companyName || "Company"}
            </span>
          </div>
        </div>
        {hasApplied ? (
          <span className="job-browse-card__applied">
            <Icon name="check_circle" isFilled />
            Applied
          </span>
        ) : (
          <button
            type="button"
            className="job-browse-card__apply"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onApply?.(job);
            }}
          >
            Apply now
          </button>
        )}
      </div>

      <div className="job-browse-card__meta">
        <span className="job-browse-card__meta-item">
          <Icon name="work" />
          <span>{experience.replace(/ years?/i, " Yrs")}</span>
        </span>
        <span className="job-browse-card__divider" />
        <span className="job-browse-card__meta-item">
          <Icon name="location_on" />
          <span>{city}</span>
        </span>
        {job?.workMode ? (
          <>
            <span className="job-browse-card__divider" />
            <span className="job-browse-card__meta-item">
              <Icon name="laptop_mac" />
              <span>{job.workMode}</span>
            </span>
          </>
        ) : null}
      </div>

      <div className="job-browse-card__snippet">
        <Icon name="description" />
        <p>{snippet}</p>
      </div>

      {skills.length > 0 ? (
        <div className="job-browse-card__skills">
          {skills.map((skill, index) => (
            <React.Fragment key={`${skill}-${index}`}>
              {index > 0 ? (
                <span className="job-browse-card__skill-sep">·</span>
              ) : null}
              <span>{skill}</span>
            </React.Fragment>
          ))}
        </div>
      ) : null}

      <div className="job-browse-card__footer">
        <span className="job-browse-card__posted">{postedLabel}</span>
      </div>
    </article>
  );
});

JobBrowseCard.displayName = "JobBrowseCard";

export default JobBrowseCard;
