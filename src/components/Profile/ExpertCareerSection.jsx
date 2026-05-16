"use client";

import React, { memo, useCallback, useMemo, useState } from "react";
import { Button, Card, Col, Divider, Row, Space, Tag, Typography, message } from "antd";
import BecomeExpertModal from "@/components/BecomeExpertModal";
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

/**
 * Expert-only: read-only career summary + modal editor (same fields as become-expert).
 */
const ExpertCareerSection = memo(function ExpertCareerSection({
  data = {},
  onSave,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const normalized = useMemo(() => {
    if (!data || typeof data !== "object") return {};
    return isExpertProfileNormalized(data) ? data : normalizeExpertUser(data);
  }, [data]);
  const workExperience = normalized.workExperience ?? [];
  const education = normalized.education ?? [];
  const skills = normalized.skills ?? [];

  const modalInitialValues = useMemo(
    () => ({
      workExperience,
      education,
      skills: skills.length ? skills : [""],
    }),
    [workExperience, education, skills]
  );

  const handleSubmit = useCallback(
    async (payload) => {
      if (typeof onSave !== "function") return;
      setSaving(true);
      try {
        await onSave(payload);
        message.success("Experience and education saved.");
        setModalOpen(false);
      } catch (e) {
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [onSave]
  );

  const canEdit = typeof onSave === "function";

  return (
    <>
      <div className="profileDetails mt-3">
        <div className="profileDetails__pageCard">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <Typography.Title level={4} style={{ margin: 0 }}>
              Experience &amp; education
            </Typography.Title>
            {canEdit ? (
              <Button type="primary" onClick={() => setModalOpen(true)}>
                Edit experience &amp; education
              </Button>
            ) : null}
          </div>

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
            <h4 className="profileDetails__sectionTitle">Work experience</h4>
            <Divider className="profileDetails__sectionDivider" />
            {workExperience.length ? (
              <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                {workExperience.map((w, i) => (
                  <Row gutter={[16, 8]} key={`we-${i}`}>
                    <Col xs={24} md={12}>
                      <Text className="profileDetails__viewLabel">Job title</Text>
                      <pre className="profileDetails__viewValue">
                        {w?.jobTitle || "—"}
                      </pre>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text className="profileDetails__viewLabel">Company</Text>
                      <pre className="profileDetails__viewValue">
                        {w?.company || "—"}
                      </pre>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text className="profileDetails__viewLabel">
                        Employment type
                      </Text>
                      <pre className="profileDetails__viewValue">
                        {employmentLabel(w?.employmentType)}
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
                        <Tag color="blue">Current job</Tag>
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
            <h4 className="profileDetails__sectionTitle">Education</h4>
            <Divider className="profileDetails__sectionDivider" />
            {education.length ? (
              <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                {education.map((ed, i) => (
                  <Row gutter={[16, 8]} key={`ed-${i}`}>
                    <Col xs={24} md={12}>
                      <Text className="profileDetails__viewLabel">Title</Text>
                      <pre className="profileDetails__viewValue">
                        {ed?.title || "—"}
                      </pre>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text className="profileDetails__viewLabel">
                        School / college
                      </Text>
                      <pre className="profileDetails__viewValue">
                        {ed?.schoolCollege || "—"}
                      </pre>
                    </Col>
                    <Col xs={24} md={12}>
                      <Text className="profileDetails__viewLabel">Time period</Text>
                      <pre className="profileDetails__viewValue">
                        {formatDurationLine(ed, "timePeriod")}
                      </pre>
                    </Col>
                    {ed?.isCurrentlyServing ? (
                      <Col xs={24}>
                        <Tag color="geekblue">Currently studying here</Tag>
                      </Col>
                    ) : null}
                    {ed?.description ? (
                      <Col xs={24}>
                        <Text className="profileDetails__viewLabel">
                          Description
                        </Text>
                        <pre className="profileDetails__viewValue">
                          {ed.description}
                        </pre>
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
        </div>
      </div>

      {modalOpen ? (
        <BecomeExpertModal
          open
          title="Edit experience & education"
          okText="Save"
          onCancel={() => !saving && setModalOpen(false)}
          initialValues={modalInitialValues}
          onSubmit={handleSubmit}
          closeAfterSubmit={false}
          successMessage={null}
        />
      ) : null}
    </>
  );
});

export default ExpertCareerSection;
