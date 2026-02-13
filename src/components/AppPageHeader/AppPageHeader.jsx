"use client";

import React from "react";
import "./AppPageHeader.scss";

/**
 * Consistent page header for all internal (app) pages.
 * @param {string} title - Page title
 * @param {string} [subtitle] - Optional description below title
 * @param {React.ReactNode} [breadcrumb] - Optional breadcrumb above title (e.g. Equipment page)
 * @param {React.ReactNode} [children] - Optional actions (buttons) on the right
 */
const AppPageHeader = ({ title, subtitle, breadcrumb, children }) => {
  return (
    <div className="app-page-header">
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
