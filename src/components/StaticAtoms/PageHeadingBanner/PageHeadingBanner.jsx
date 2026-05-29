"use client";

import React from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import "./PageHeadingBanner.scss";

/**
 * @param {string} heading - Main page title
 * @param {string} [currentPageTitle] - Reserved for breadcrumb use
 * @param {{ label: string, onClick?: () => void, href?: string }} [backLink] - Optional link above heading (inside banner)
 */
const PageHeadingBanner = ({ heading, backLink }) => {
  const backContent = backLink ? (
    <div className="page-heading__back">
      {backLink.href ? (
        <a href={backLink.href} className="page-heading__backLink">
          <ArrowLeftOutlined />
          <span>{backLink.label}</span>
        </a>
      ) : (
        <button
          type="button"
          className="page-heading__backLink"
          onClick={backLink.onClick}
        >
          <ArrowLeftOutlined />
          <span>{backLink.label}</span>
        </button>
      )}
    </div>
  ) : null;

  return (
    <div className="breadcrumb-wrapper">
      <div className="container">
        <div className="page-heading">
          {backContent}
          <h1 className="C-heading size-3 extraBold color-white font-family-creative">
            {heading}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default PageHeadingBanner;
