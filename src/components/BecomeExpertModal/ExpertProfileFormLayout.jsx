"use client";

import React from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";

/**
 * Shared page chrome for become-expert and expert profile edit flows.
 * Keeps header, back action, and form container aligned across routes.
 */
export default function ExpertProfileFormLayout({
  title,
  subtitle,
  onBack,
  backLabel = "Back to dashboard",
  children,
}) {
  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader title={title} subtitle={subtitle}>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          {backLabel}
        </Button>
      </AppPageHeader>
      <div className="p-4">{children}</div>
    </div>
  );
}
