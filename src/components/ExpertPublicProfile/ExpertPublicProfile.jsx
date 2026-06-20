"use client";

import React, { useMemo } from "react";
import { Empty, Image, Tag, Timeline, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Icon from "@/components/Icon";
import { useAuth } from "@/utilities/AuthContext";
import ExpertInfoSidebar from "./ExpertInfoSidebar";
import {
  buildAboutFallback,
  employmentTypeLabel,
  formatExpertDuration,
  formatExpertLocation,
  sortEntriesByFromDateDesc,
  sortWorkExperienceByFromDateDesc,
} from "@/utilities/expertPublicProfile";
import "./ExpertPublicProfile.scss";

const { Text } = Typography;

function YearBadge({ children }) {
  if (!children) return null;
  return <span className="expertPublicProfile__yearBadge">{children}</span>;
}

function ContentSection({ title, children, empty = false, emptyDescription }) {
  return (
    <section className="expertPublicProfile__contentSection">
      <h2 className="expertPublicProfile__contentTitle">{title}</h2>
      {empty ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={emptyDescription}
        />
      ) : (
        children
      )}
    </section>
  );
}

function ProfileTimeline({ items, emptyDescription }) {
  if (!items.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={emptyDescription}
      />
    );
  }

  return <Timeline className="expertPublicProfile__timeline" items={items} />;
}

function WorkTimelineItem({ entry }) {
  const jobTitle = entry?.jobTitle || "Role";
  const company = entry?.company || "";
  const employment = employmentTypeLabel(entry?.employmentType);
  const duration = formatExpertDuration(entry);
  const description = entry?.jobDescription ?? entry?.job_description ?? "";

  return (
    <div className="expertPublicProfile__timelineEntry">
      <YearBadge>{duration}</YearBadge>
      <Text className="expertPublicProfile__timelineTitle">{jobTitle}</Text>
      {company ? (
        <Text className="expertPublicProfile__timelineSubtitle">{company}</Text>
      ) : null}
      {employment ? (
        <Text className="expertPublicProfile__timelineMeta">{employment}</Text>
      ) : null}
      {entry?.isCurrentJob ? (
        <Tag color="blue" className="expertPublicProfile__currentTag">
          Current job
        </Tag>
      ) : null}
      {description ? (
        <p className="expertPublicProfile__timelineDescription">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function EducationTimelineItem({ entry }) {
  const title = entry?.title || "Qualification";
  const school = entry?.schoolCollege || "";
  const duration = formatExpertDuration(entry, {
    currentKey: "isCurrentlyServing",
  });
  const description = entry?.description || "";

  return (
    <div className="expertPublicProfile__timelineEntry">
      <YearBadge>{duration}</YearBadge>
      <Text className="expertPublicProfile__timelineTitle">{title}</Text>
      {school ? (
        <Text className="expertPublicProfile__timelineSubtitle">{school}</Text>
      ) : null}
      {description ? (
        <p className="expertPublicProfile__timelineDescription">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ExpertAvatar({ expert }) {
  const imageUrl = expert?.profileImageUrl;
  const name = expert?.fullName || "Expert";

  if (imageUrl) {
    return (
      <div className="expertPublicProfile__avatar">
        <Image
          src={imageUrl}
          alt={name}
          className="expertPublicProfile__avatarImg"
          preview={false}
        />
      </div>
    );
  }

  return (
    <div
      className="expertPublicProfile__avatar expertPublicProfile__avatar--placeholder"
      aria-label="Expert photo placeholder"
    >
      <Icon name="person" isFilled color="#94a3b8" size="large" />
    </div>
  );
}

const timelineDot = <span className="expertPublicProfile__timelineDot" />;

/**
 * Public expert profile — banner header + About, Skills, timelines, sidebar.
 */
export default function ExpertPublicProfile({ expert, backLink }) {
  const { isLoggedIn } = useAuth();
  const location = useMemo(
    () => formatExpertLocation(expert?.address),
    [expert?.address],
  );

  const firstName = useMemo(() => {
    const n = expert?.firstName?.trim();
    if (n) return n;
    return expert?.fullName?.split(/\s+/)?.[0] || "Expert";
  }, [expert]);

  const aboutText = useMemo(() => buildAboutFallback(expert), [expert]);

  const sortedWork = useMemo(
    () => sortWorkExperienceByFromDateDesc(expert?.workExperience ?? []),
    [expert?.workExperience],
  );

  const sortedEducation = useMemo(
    () => sortEntriesByFromDateDesc(expert?.education ?? []),
    [expert?.education],
  );

  const workTimelineItems = useMemo(
    () =>
      sortedWork.map((entry, index) => ({
        key: `work-${index}`,
        dot: timelineDot,
        children: <WorkTimelineItem entry={entry} />,
      })),
    [sortedWork],
  );

  const educationTimelineItems = useMemo(
    () =>
      sortedEducation.map((entry, index) => ({
        key: `edu-${index}`,
        dot: timelineDot,
        children: <EducationTimelineItem entry={entry} />,
      })),
    [sortedEducation],
  );

  const skills = expert?.skills ?? [];

  return (
    <div className="expertPublicProfile">
      <header className="expertPublicProfile__banner">
        <div className="expertPublicProfile__bannerOverlay" aria-hidden />
        <div className="container expertPublicProfile__bannerInner">
          {backLink ? (
            <div className="expertPublicProfile__bannerBack">
              {backLink.href ? (
                <a
                  href={backLink.href}
                  className="expertPublicProfile__backLink"
                >
                  <ArrowLeftOutlined />
                  <span>{backLink.label}</span>
                </a>
              ) : (
                <button
                  type="button"
                  className="expertPublicProfile__backLink"
                  onClick={backLink.onClick}
                >
                  <ArrowLeftOutlined />
                  <span>{backLink.label}</span>
                </button>
              )}
            </div>
          ) : null}

          <div className="expertPublicProfile__bannerProfile">
            <ExpertAvatar expert={expert} />
            <div className="expertPublicProfile__bannerText">
              <h1 className="expertPublicProfile__bannerName">
                {expert?.fullName || "Expert"}
              </h1>
              {expert?.expertise ? (
                <p className="expertPublicProfile__bannerRole">
                  {expert.expertise}
                </p>
              ) : null}
              <div className="expertPublicProfile__bannerMeta">
                {location ? (
                  <span className="expertPublicProfile__bannerMetaItem">
                    <Icon
                      name="location_on"
                      color="rgba(255,255,255,0.85)"
                      size="small"
                    />
                    {location}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="expertPublicProfile__body">
        <div className="container">
          <div className="row g-4 g-xl-5">
            <div className="col-lg-8 col-12">
              <ContentSection
                title={`About ${firstName}`}
                empty={!aboutText}
                emptyDescription="No about information provided."
              >
                <p className="expertPublicProfile__aboutText">{aboutText}</p>
              </ContentSection>

              <ContentSection
                title="Skills"
                empty={!skills.length}
                emptyDescription="No skills listed."
              >
                <div className="expertPublicProfile__skills">
                  {skills.map((skill, idx) => (
                    <span
                      key={`${String(skill)}-${idx}`}
                      className="expertPublicProfile__skillPill"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </ContentSection>

              <ContentSection title="Work Experience">
                <ProfileTimeline
                  items={workTimelineItems}
                  emptyDescription="No work experience listed."
                />
              </ContentSection>

              <ContentSection title="Education & Training">
                <ProfileTimeline
                  items={educationTimelineItems}
                  emptyDescription="No education listed."
                />
              </ContentSection>
            </div>

            {isLoggedIn ? (
              <div className="col-lg-4 col-12">
                <ExpertInfoSidebar expert={expert} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
