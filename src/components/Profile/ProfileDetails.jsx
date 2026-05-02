"use client";

import React, { memo, useMemo, useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Space,
  Typography,
  message,
} from "antd";

const { Text } = Typography;

const getByPath = (obj, path) =>
  path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

const setByPath = (obj, path, value) => {
  if (!path.length) return obj;
  const root = { ...(obj || {}) };
  let cur = root;
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = path[i];
    cur[key] = typeof cur[key] === "object" && cur[key] !== null ? { ...cur[key] } : {};
    cur = cur[key];
  }
  cur[path[path.length - 1]] = value;
  return root;
};

const fieldName = (path) => path.join("__");
const sectionCardStyle = {
  borderRadius: 10,
  border: "1px solid #f0f0f0",
  background: "#fcfcfd",
};

const ProfileDetails = memo(function ProfileDetails({
  data = {},
  sections = [],
  title = "Profile",
  onSave,
  showEditButton = true,
  onEditClick,
  startInEditMode = false,
  headerAction = null,
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const canEdit = typeof onSave === "function";

  const formInitialValues = useMemo(() => {
    const initial = {};
    sections.forEach((section) => {
      section.fields.forEach((f) => {
        const value = getByPath(data, f.path);
        initial[fieldName(f.path)] =
          f.type === "json"
            ? JSON.stringify(value ?? (Array.isArray(value) ? [] : {}), null, 2)
            : value;
      });
    });
    return initial;
  }, [data, sections]);

  const handleEdit = () => {
    if (!canEdit) return;
    form.setFieldsValue(formInitialValues);
    setEditing(true);
    onEditClick?.();
  };

  useEffect(() => {
    if (!startInEditMode || !canEdit) return;
    form.setFieldsValue(formInitialValues);
    setEditing(true);
  }, [startInEditMode, canEdit, form, formInitialValues]);

  const handleCancel = () => {
    setEditing(false);
    form.resetFields();
  };

  const handleFinish = async (values) => {
    try {
      setSaving(true);
      let next = { ...(data || {}) };
      sections.forEach((section) => {
        section.fields.forEach((f) => {
          if (f.readOnly) return;
          const raw = values[fieldName(f.path)];
          let value = raw;
          if (f.type === "json") {
            try {
              value = raw ? JSON.parse(raw) : [];
            } catch {
              throw new Error(`${f.label} must be valid JSON.`);
            }
          }
          next = setByPath(next, f.path, value);
        });
      });
      await onSave?.(next);
      setEditing(false);
      message.success("Profile updated successfully.");
    } catch (e) {
      message.error(e?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const renderFieldValue = (f) => {
    const value = getByPath(data, f.path);
    if (value === undefined || value === null || value === "") return "—";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <Card
      title={title}
      extra={
        headerAction ? (
          headerAction
        ) : showEditButton && canEdit && !editing ? (
          <Button type="primary" onClick={handleEdit}>
            Edit
          </Button>
        ) : null
      }
    >
      {!editing ? (
        <Space orientation="vertical" style={{ width: "100%" }} size={20}>
          {sections.map((section) => (
            <Card key={section.title} size="small" style={sectionCardStyle}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                {section.title}
              </Typography.Title>
              <Divider style={{ margin: "10px 0 14px" }} />
              <Row gutter={[16, 14]}>
                {section.fields.map((f) => (
                  <Col xs={24} md={12} key={fieldName(f.path)}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {f.label}
                    </Text>
                    <pre
                      style={{
                        margin: "4px 0 0",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        fontFamily: "inherit",
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: "#1f2937",
                      }}
                    >
                      {renderFieldValue(f)}
                    </pre>
                  </Col>
                ))}
              </Row>
            </Card>
          ))}
        </Space>
      ) : (
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {sections.map((section) => (
            <Card key={section.title} size="small" style={{ ...sectionCardStyle, marginBottom: 16 }}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                {section.title}
              </Typography.Title>
              <Divider style={{ margin: "10px 0 14px" }} />
              <Row gutter={[16, 12]}>
                {section.fields.map((f) => (
                  <Col xs={24} md={12} key={fieldName(f.path)}>
                    <Form.Item
                      name={fieldName(f.path)}
                      label={f.label}
                      rules={
                        f.type === "json"
                          ? [{ validator: () => Promise.resolve() }]
                          : undefined
                      }
                    >
                      {f.type === "textarea" || f.type === "json" ? (
                        <Input.TextArea
                          rows={f.type === "json" ? 6 : 3}
                          disabled={!!f.readOnly}
                        />
                      ) : (
                        <Input
                          type={f.type === "email" ? "email" : "text"}
                          disabled={!!f.readOnly}
                        />
                      )}
                    </Form.Item>
                  </Col>
                ))}
              </Row>
            </Card>
          ))}
          <Divider style={{ margin: "8px 0 14px" }} />
          <Space>
            <Button type="primary" htmlType="submit" loading={saving}>
              Save
            </Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </Space>
        </Form>
      )}
    </Card>
  );
});

export default ProfileDetails;

