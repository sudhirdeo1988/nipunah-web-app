"use client";

import React, { useCallback, useState, memo } from "react";
import { Form, Input, Button, Card, message } from "antd";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import { getClientToken } from "@/utilities/auth";

/**
 * API endpoint for change password (Next proxy → backend /change-password).
 * Override via env: NEXT_PUBLIC_CHANGE_PASSWORD_API
 */
const CHANGE_PASSWORD_API =
  process.env.NEXT_PUBLIC_CHANGE_PASSWORD_API || "/api/auth/change-password";

/**
 * Change password form layout and validation.
 * Submit sends { oldPassword, newPassword } via proxy (Bearer from cookies).
 */
const ChangePasswordPage = memo(function ChangePasswordPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (values) => {
      setLoading(true);
      try {
        const token = getClientToken();
        if (!token) {
          message.error("Session expired or not signed in. Please log in again.");
          setLoading(false);
          return;
        }
        const normalizedToken = String(token).replace(/^Bearer\s+/i, "").trim();

        const payload = {
          oldPassword: values.currentPassword,
          newPassword: values.newPassword,
        };
        const res = await fetch(CHANGE_PASSWORD_API, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${normalizedToken}`,
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        let data = {};
        try {
          data = await res.json();
        } catch (_) {}

        if (!res.ok) {
          const msg =
            data?.message || data?.error || "Failed to change password.";
          message.error(msg);
          return;
        }

        message.success(data?.message || "Password changed successfully.");
        form.resetFields();
        router.push(ROUTES?.PRIVATE?.DASHBOARD ?? "/app/dashboard");
      } catch (err) {
        message.error(err?.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [form, router]
  );

  return (
    <div className="bg-white rounded shadow-sm p-4" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Change password"
        subtitle="Update your account password. Use a strong password."
      />
      <Card className="mt-3" style={{ maxWidth: 480 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="Current password"
            name="currentPassword"
            rules={[
              { required: true, message: "Please enter your current password." },
            ]}
          >
            <Input.Password
              placeholder="Enter current password"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item
            label="New password"
            name="newPassword"
            rules={[
              { required: true, message: "Please enter a new password." },
              { min: 8, message: "Password must be at least 8 characters." },
            ]}
          >
            <Input.Password
              placeholder="Enter new password"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            label="Confirm new password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your new password." },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match."));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm new password"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" size="large" loading={loading}>
              Change password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
});

ChangePasswordPage.displayName = "ChangePasswordPage";

export default ChangePasswordPage;
