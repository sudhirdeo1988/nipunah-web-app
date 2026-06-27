"use client";

import React from "react";
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
  backHref,
  children,
}) {
  return (
    <div
      className="bg-white rounded shadow-sm p-4"
      style={{ minHeight: "100%" }}
    >
      <AppPageHeader
        title={title}
        subtitle={subtitle}
        backLink={
          backHref
            ? { label: backLabel, href: backHref }
            : { label: backLabel, onClick: onBack }
        }
      />
      <div className="mt-3">{children}</div>
    </div>
  );
}
