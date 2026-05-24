"use client";

import React, { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Col, Divider, Row, Space, Tag, Typography } from "antd";
import { ROUTES } from "@/constants/routes";
import { EMPLOYMENT_TYPES } from "@/components/BecomeExpertModal/constants";
import {
  isExpertProfileNormalized,
  normalizeExpertUser,
} from "@/utilities/expertProfileNormalize";
import "./ProfileDetails.scss";

const { Text } = Typography;

const employmentLabel = (value) =>
  EMPLOYMENT_TYPES.find((o) => o.value === value)?.label || value || "—";

function formatDurationLine(entry, legacyKey) {
  const a = typeof entry?.fromDate === "string" ? entry.fromDate.trim() : "";
  const b = typeof entry?.toDate === "string" ? entry.toDate.trim() : "";
  if (a && b) return `${a} – ${b}`;
  if (a || b) return a || b;
  const legacy = entry?.[legacyKey];
  if (legacy && typeof legacy === "string" && legacy.trim()) return legacy.trim();
  return "—";
}

function valueOrDash(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

/**
 * Expert-only: read-only career summary; edit opens dedicated profile sub-page.
 * Section order and labels match BecomeExpertModal (become expert / edit / view).
 */
const ExpertCareerSection = memo(function ExpertCareerSection({
  data = {},
  canEdit = true,
}) {
  const router = useRouter();

  const normalized = useMemo(() => {
    if (!data || typeof data !== "object") return {};
    return isExpertProfileNormalized(data) ? data : normalizeExpertUser(data);
  }, [data]);
  const workExperience = normalized.workExperience ?? [];
  const education = normalized.education ?? [];
  const skills = normalized.skills ?? [];
  const aboutText =
    typeof normalized.about === "string" ? normalized.about.trim() : "";

  return (
    <div className="profileDetails mt-3">
      <div className="profileDetails__pageCard">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Experience &amp; Education
          </Typography.Title>
          {canEdit ? (
            <Button
              type="primary"
              className="C-button is-filled"
              onClick={() =>
                router.push(ROUTES.PRIVATE.PROFILE_EXPERIENCE_EDUCATION)
              }
            >
              Edit Experience &amp; Education
            </Button>
          ) : null}
        </div>

        <Card size="small" className="profileDetails__sectionCard">
          <h4 className="profileDetails__sectionTitle">About</h4>
          <Divider className="profileDetails__sectionDivider" />
          <pre className="profileDetails__viewValue">
            {aboutText || "—"}
          </pre>
        </Card>

        <Card size="small" className="profileDetails__sectionCard">
          <h4 className="profileDetails__sectionTitle">Work Experience</h4>
          <Divider className="profileDetails__sectionDivider" />
          {workExperience.length ? (
            <Space orientation="vertical" size={16} style={{ width: "100%" }}>
              {workExperience.map((w, i) => (
                <Row gutter={[16, 8]} key={`we-${i}`}>
                  <Col xs={24} md={12}>
                    <Text className="profileDetails__viewLabel">Job Title</Text>
                    <pre className="profileDetails__viewValue">
                      {valueOrDash(w?.jobTitle)}
                    </pre>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text className="profileDetails__viewLabel">
                      Employment Type
                    </Text>
                    <pre className="profileDetails__viewValue">
                      {employmentLabel(w?.employmentType)}
                    </pre>
                  </Col>
                  <Col xs={24}>
                    <Text className="profileDetails__viewLabel">
                      Job Description
                    </Text>
                    <pre className="profileDetails__viewValue">
                      {valueOrDash(w?.jobDescription || w?.job_description)}
                    </pre>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text className="profileDetails__viewLabel">Company</Text>
                    <pre className="profileDetails__viewValue">
                      {valueOrDash(w?.company)}
                    </pre>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text className="profileDetails__viewLabel">Duration</Text>
                    <pre className="profileDetails__viewValue">
                      {formatDurationLine(w, "companyWorkDuration")}
                    </pre>
                  </Col>
                  {w?.isCurrentJob ? (
                    <Col xs={24}>
                      <Tag color="blue">Current Job</Tag>
                    </Col>
                  ) : null}
                </Row>
              ))}
            </Space>
          ) : (
            <Text className="profileDetails__viewValue" type="secondary">
              —
            </Text>
          )}
        </Card>

        <Card size="small" className="profileDetails__sectionCard">
          <h4 className="profileDetails__sectionTitle">Skills</h4>
          <Divider className="profileDetails__sectionDivider" />
          {skills.length ? (
            <Space wrap size={[8, 8]}>
              {skills.map((s, idx) => (
                <Tag key={`${String(s)}-${idx}`}>{s}</Tag>
              ))}
            </Space>
          ) : (
            <Text className="profileDetails__viewValue" type="secondary">
              —
            </Text>
          )}
        </Card>

        <Card size="small" className="profileDetails__sectionCard">
          <h4 className="profileDetails__sectionTitle">Education &amp; Training</h4>
          <Divider className="profileDetails__sectionDivider" />
          {education.length ? (
            <Space orientation="vertical" size={16} style={{ width: "100%" }}>
              {education.map((ed, i) => (
                <Row gutter={[16, 8]} key={`ed-${i}`}>
                  <Col xs={24} md={12}>
                    <Text className="profileDetails__viewLabel">Title</Text>
                    <pre className="profileDetails__viewValue">
                      {valueOrDash(ed?.title)}
                    </pre>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text className="profileDetails__viewLabel">
                      School/College
                    </Text>
                    <pre className="profileDetails__viewValue">
                      {valueOrDash(ed?.schoolCollege)}
                    </pre>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text className="profileDetails__viewLabel">Time Period</Text>
                    <pre className="profileDetails__viewValue">
                      {formatDurationLine(ed, "timePeriod")}
                    </pre>
                  </Col>
                  <Col xs={24}>
                    <Text className="profileDetails__viewLabel">Description</Text>
                    <pre className="profileDetails__viewValue">
                      {valueOrDash(ed?.description)}
                    </pre>
                  </Col>
                </Row>
              ))}
            </Space>
          ) : (
            <Text className="profileDetails__viewValue" type="secondary">
              —
            </Text>
          )}
        </Card>
      </div>
    </div>
  );
});

export default ExpertCareerSection;
