"use client";

import React, { useMemo } from "react";
import { Empty, Tag, Timeline, Typography } from "antd";
import {
  PublicDetailsProfile,
  PublicDetailsContentSection,
  PublicDetailsSidebar,
  PublicDetailsInfoRow,
} from "@/components/PublicDetailsProfile";
import { useAuth } from "@/utilities/AuthContext";
import {
  buildAboutFallback,
  employmentTypeLabel,
  formatExpertContact,
  formatExpertDuration,
  formatExpertLocation,
  formatMemberSince,
  sortEntriesByFromDateDesc,
  sortWorkExperienceByFromDateDesc,
} from "@/utilities/expertPublicProfile";
import "./ExpertPublicProfile.scss";

const { Text } = Typography;

function YearBadge({ children }) {
  if (!children) return null;
  return <span className="expertPublicProfile__yearBadge">{children}</span>;
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
        <p className="expertPublicProfile__timelineDescription">{description}</p>
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
        <p className="expertPublicProfile__timelineDescription">{description}</p>
      ) : null}
    </div>
  );
}

const timelineDot = <span className="expertPublicProfile__timelineDot" />;

export default function ExpertPublicProfile({ expert, backLink }) {
  const { isLoggedIn } = useAuth();
  const location = useMemo(
    () => formatExpertLocation(expert?.address),
    [expert?.address]
  );

  const firstName = useMemo(() => {
    const n = expert?.firstName?.trim();
    if (n) return n;
    return expert?.fullName?.split(/\s+/)?.[0] || "Expert";
  }, [expert]);

  const aboutText = useMemo(() => buildAboutFallback(expert), [expert]);
  const contact = useMemo(() => formatExpertContact(expert), [expert]);
  const memberSince = useMemo(
    () => formatMemberSince(expert?.createdOn ?? expert?.created_on),
    [expert]
  );

  const sortedWork = useMemo(
    () => sortWorkExperienceByFromDateDesc(expert?.workExperience ?? []),
    [expert?.workExperience]
  );

  const sortedEducation = useMemo(
    () => sortEntriesByFromDateDesc(expert?.education ?? []),
    [expert?.education]
  );

  const workTimelineItems = useMemo(
    () =>
      sortedWork.map((entry, index) => ({
        key: `work-${index}`,
        dot: timelineDot,
        children: <WorkTimelineItem entry={entry} />,
      })),
    [sortedWork]
  );

  const educationTimelineItems = useMemo(
    () =>
      sortedEducation.map((entry, index) => ({
        key: `edu-${index}`,
        dot: timelineDot,
        children: <EducationTimelineItem entry={entry} />,
      })),
    [sortedEducation]
  );

  const skills = expert?.skills ?? [];

  const metaItems = useMemo(
    () =>
      location
        ? [{ icon: "location_on", label: "Location", text: location }]
        : [],
    [location]
  );

  const sidebar = isLoggedIn ? (
    <PublicDetailsSidebar socialMedia={expert?.socialMedia}>
      <PublicDetailsInfoRow label="Email">
        {expert?.email ? (
          <a href={`mailto:${expert.email}`} className="publicDetailsProfile__link">
            {expert.email}
          </a>
        ) : null}
      </PublicDetailsInfoRow>
      <PublicDetailsInfoRow label="Phone">{contact || null}</PublicDetailsInfoRow>
      <PublicDetailsInfoRow label="Member since">{memberSince || null}</PublicDetailsInfoRow>
    </PublicDetailsSidebar>
  ) : null;

  return (
    <PublicDetailsProfile
      backLink={backLink}
      imageUrl={expert?.profileImageUrl}
      imageAlt={expert?.fullName || "Expert"}
      placeholderIcon="person"
      imageVariant="circle"
      name={expert?.fullName || "Expert"}
      subtitle={expert?.expertise || ""}
      metaItems={metaItems}
      sidebar={sidebar}
      showSidebar={isLoggedIn}
    >
      <PublicDetailsContentSection
        title={`About ${firstName}`}
        empty={!aboutText}
        emptyDescription="No about information provided."
      >
        <p className="publicDetailsProfile__aboutText">{aboutText}</p>
      </PublicDetailsContentSection>

      <PublicDetailsContentSection
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
      </PublicDetailsContentSection>

      <PublicDetailsContentSection title="Work Experience">
        <ProfileTimeline
          items={workTimelineItems}
          emptyDescription="No work experience listed."
        />
      </PublicDetailsContentSection>

      <PublicDetailsContentSection title="Education & Training">
        <ProfileTimeline
          items={educationTimelineItems}
          emptyDescription="No education listed."
        />
      </PublicDetailsContentSection>
    </PublicDetailsProfile>
  );
}
