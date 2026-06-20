"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeftOutlined } from "@ant-design/icons";
import "./AppPageHeader.scss";

/**
 * Consistent page header for all internal (app) pages.
 * @param {string} title - Page title
 * @param {string} [subtitle] - Optional description below title
 * @param {{ label: string, href?: string, onClick?: () => void }} [backLink] - Link above title (left)
 * @param {React.ReactNode} [breadcrumb] - Optional breadcrumb above title (e.g. Equipment page)
 * @param {React.ReactNode} [children] - Optional actions (buttons) on the right
 */
const AppPageHeader = ({ title, subtitle, backLink, breadcrumb, children }) => {
  const renderBackLink = () => {
    if (!backLink?.label) return null;

    const content = (
      <>
        <ArrowLeftOutlined />
        <span>{backLink.label}</span>
      </>
    );

    if (backLink.href) {
      return (
        <Link href={backLink.href} className="app-page-header__backLink">
          {content}
        </Link>
      );
    }

    return (
      <button
        type="button"
        className="app-page-header__backLink"
        onClick={backLink.onClick}
      >
        {content}
      </button>
    );
  };

  return (
    <div className="app-page-header">
      {backLink ? <div className="app-page-header__back">{renderBackLink()}</div> : null}
      {breadcrumb && <div className="app-page-header__breadcrumb">{breadcrumb}</div>}
      <div className="row align-items-center">
        <div className="col">
          <h1 className="app-page-header__title">{title}</h1>
          {subtitle && <p className="app-page-header__subtitle">{subtitle}</p>}
        </div>
        {children ? (
          <div className="col-auto app-page-header__actions">{children}</div>
        ) : null}
      </div>
    </div>
  );
};

export default AppPageHeader;
