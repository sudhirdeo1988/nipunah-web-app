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
  Select,
  Space,
  Typography,
  message,
} from "antd";
import CountryDetails from "@/utilities/CountryDetails.json";
import { resolveProfileUsername } from "@/utilities/profileUtils";
import "./ProfileDetails.scss";

const { Text } = Typography;

const getByPath = (obj, path) =>
  path.reduce(
    (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
    obj
  );

const setByPath = (obj, path, value) => {
  if (!path.length) return obj;
  const root = { ...(obj || {}) };
  let cur = root;
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = path[i];
    cur[key] =
      typeof cur[key] === "object" && cur[key] !== null ? { ...cur[key] } : {};
    cur = cur[key];
  }
  cur[path[path.length - 1]] = value;
  return root;
};

const fieldName = (path) => path.join("__");

/** Lower-cased startsWith filter (used for country dropdowns). */
const startsWithFilter = (input, option) =>
  String(option?.label || "")
    .toLowerCase()
    .startsWith(String(input || "").toLowerCase());

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

  const countryCodeOptions = useMemo(
    () =>
      (Array.isArray(CountryDetails) ? CountryDetails : []).map((c) => ({
        label: `${c.countryName} (${c.dailCode})`,
        value: c.dailCode,
        searchLabel: `${c.countryName} ${c.dailCode}`,
      })),
    []
  );

  const countryOptions = useMemo(
    () =>
      (Array.isArray(CountryDetails) ? CountryDetails : []).map((c) => ({
        label: c.countryName,
        value: c.countryName,
      })),
    []
  );

  const resolveFieldValue = (f) => {
    const lastSegment = f.path?.[f.path.length - 1];
    if (lastSegment === "username") {
      return resolveProfileUsername(data);
    }
    return getByPath(data, f.path);
  };

  const formInitialValues = useMemo(() => {
    const initial = {};
    sections.forEach((section) => {
      section.fields.forEach((f) => {
        const value = resolveFieldValue(f);
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
    const value = resolveFieldValue(f);
    if (value === undefined || value === null || value === "") return "—";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const renderEditField = (f) => {
    const lastSegment = f.path?.[f.path.length - 1];
    const isAddressCountry =
      lastSegment === "country" && f.path?.[0] === "address";
    const isAddressState =
      lastSegment === "state" && f.path?.[0] === "address";

    if (lastSegment === "contact_country_code") {
      return (
        <Select
          showSearch
          placeholder="Select country code"
          options={countryCodeOptions}
          optionFilterProp="label"
          filterOption={(input, option) =>
            String(option?.searchLabel || "")
              .toLowerCase()
              .startsWith(String(input || "").toLowerCase())
          }
          disabled={!!f.readOnly}
        />
      );
    }

    if (isAddressCountry) {
      return (
        <Select
          showSearch
          placeholder="Select country"
          options={countryOptions}
          optionFilterProp="label"
          filterOption={startsWithFilter}
          disabled={!!f.readOnly}
          allowClear
        />
      );
    }

    if (isAddressState) {
      return (
        <Input
          placeholder="State/Province"
          disabled={!!f.readOnly}
        />
      );
    }

    if (f.type === "textarea" || f.type === "json") {
      return (
        <Input.TextArea
          rows={f.type === "json" ? 6 : 3}
          disabled={!!f.readOnly}
        />
      );
    }

    return (
      <Input
        type={f.type === "email" ? "email" : "text"}
        disabled={!!f.readOnly}
      />
    );
  };

  return (
    <div className="profileDetails">
      <div className="profileDetails__pageCard">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <Typography.Title level={4} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          {headerAction
            ? headerAction
            : showEditButton && canEdit && !editing
            ? (
              <Button type="primary" onClick={handleEdit}>
                Edit Profile
              </Button>
            )
            : null}
        </div>

        {!editing ? (
          <div>
            {sections.map((section) => (
              <Card
                key={section.title}
                size="small"
                className="profileDetails__sectionCard"
              >
                <h4 className="profileDetails__sectionTitle">
                  {section.title}
                </h4>
                <Divider className="profileDetails__sectionDivider" />
                <Row gutter={[16, 14]}>
                  {section.fields.map((f) => (
                    <Col xs={24} md={12} key={fieldName(f.path)}>
                      <Text className="profileDetails__viewLabel">
                        {f.label}
                      </Text>
                      <pre className="profileDetails__viewValue">
                        {renderFieldValue(f)}
                      </pre>
                    </Col>
                  ))}
                </Row>
              </Card>
            ))}
          </div>
        ) : (
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            {sections.map((section) => (
              <Card
                key={section.title}
                size="small"
                className="profileDetails__sectionCard"
              >
                <h4 className="profileDetails__sectionTitle">
                  {section.title}
                </h4>
                <Divider className="profileDetails__sectionDivider" />
                <Row gutter={[16, 0]}>
                  {section.fields.map((f) => {
                    const lastSegment = f.path?.[f.path.length - 1];
                    const isStateField =
                      lastSegment === "state" && f.path?.[0] === "address";
                    let rules;
                    if (f.type === "json") {
                      rules = [{ validator: () => Promise.resolve() }];
                    } else if (isStateField && !f.readOnly) {
                      rules = [
                        {
                          pattern: /^[A-Za-z\s]*$/,
                          message: "Only alphabets and spaces are allowed.",
                        },
                      ];
                    }
                    return (
                      <Col xs={24} md={12} key={fieldName(f.path)}>
                        <Form.Item
                          name={fieldName(f.path)}
                          label={f.label}
                          rules={rules}
                        >
                          {renderEditField(f)}
                        </Form.Item>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            ))}
            <div className="profileDetails__footer">
              <Button onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                Save
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
});

export default ProfileDetails;
