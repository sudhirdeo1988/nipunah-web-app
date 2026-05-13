"use client";

import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Button,
  Card,
  Divider,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import BecomeExpertModal from "@/components/BecomeExpertModal";
import { EMPLOYMENT_TYPES } from "@/components/BecomeExpertModal/constants";

const { Text, Title } = Typography;

const employmentLabel = (value) =>
  EMPLOYMENT_TYPES.find((o) => o.value === value)?.label || value || "—";

/** Prefer API `fromDate` / `toDate`; fall back to legacy combined strings. */
function formatDurationLine(entry, legacyKey) {
  const a = typeof entry?.fromDate === "string" ? entry.fromDate.trim() : "";
  const b = typeof entry?.toDate === "string" ? entry.toDate.trim() : "";
  if (a && b) return `${a} – ${b}`;
  if (a || b) return a || b;
  const legacy = entry?.[legacyKey];
  if (legacy && typeof legacy === "string" && legacy.trim()) return legacy.trim();
  return "—";
}

const sectionCardStyle = {
  borderRadius: 10,
  border: "1px solid #f0f0f0",
  background: "#fcfcfd",
};

/**
 * Expert-only: read-only summary of become-expert data + modal editor
 * (same fields as upgrade flow). `onSave` receives { workExperience, skills, education }.
 */
const ExpertCareerSection = memo(function ExpertCareerSection({
  data = {},
  onSave,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const workExperience = useMemo(
    () => (Array.isArray(data.workExperience) ? data.workExperience : []),
    [data.workExperience]
  );
  const education = useMemo(
    () => (Array.isArray(data.education) ? data.education : []),
    [data.education]
  );
  const skills = useMemo(
    () => (Array.isArray(data.skills) ? data.skills.filter(Boolean) : []),
    [data.skills]
  );

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
      <Card
        title="Experience & education"
        className="mt-4"
        extra={
          canEdit ? (
            <Button type="primary" onClick={() => setModalOpen(true)}>
              Edit experience &amp; education
            </Button>
          ) : null
        }
      >
        <Space orientation="vertical" size={20} style={{ width: "100%" }}>
          <Card size="small" style={sectionCardStyle}>
            <Title level={5} style={{ margin: 0 }}>
              Skills
            </Title>
            <Divider style={{ margin: "10px 0 14px" }} />
            {skills.length ? (
              <Space wrap size={[8, 8]}>
                {skills.map((s, idx) => (
                  <Tag key={`${String(s)}-${idx}`}>{s}</Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">—</Text>
            )}
          </Card>

          <Card size="small" style={sectionCardStyle}>
            <Title level={5} style={{ margin: 0 }}>
              Work experience
            </Title>
            <Divider style={{ margin: "10px 0 14px" }} />
            {workExperience.length ? (
              <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                {workExperience.map((w, i) => (
                  <div key={`we-${i}`}>
                    <Text strong>{w?.jobTitle || "—"}</Text>
                    <div>
                      <Text type="secondary">{w?.company || "—"}</Text>
                      {" · "}
                      <Text type="secondary">{employmentLabel(w?.employmentType)}</Text>
                    </div>
                    <Text>{formatDurationLine(w, "companyWorkDuration")}</Text>
                  </div>
                ))}
              </Space>
            ) : (
              <Text type="secondary">—</Text>
            )}
          </Card>

          <Card size="small" style={sectionCardStyle}>
            <Title level={5} style={{ margin: 0 }}>
              Education
            </Title>
            <Divider style={{ margin: "10px 0 14px" }} />
            {education.length ? (
              <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                {education.map((ed, i) => (
                  <div key={`ed-${i}`}>
                    <Text strong>{ed?.title || "—"}</Text>
                    <div>
                      <Text type="secondary">{ed?.schoolCollege || "—"}</Text>
                    </div>
                    <Text>{formatDurationLine(ed, "timePeriod")}</Text>
                    {ed?.description ? (
                      <pre
                        style={{
                          margin: "8px 0 0",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          fontFamily: "inherit",
                          fontSize: 14,
                        }}
                      >
                        {ed.description}
                      </pre>
                    ) : null}
                  </div>
                ))}
              </Space>
            ) : (
              <Text type="secondary">—</Text>
            )}
          </Card>
        </Space>
      </Card>

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
