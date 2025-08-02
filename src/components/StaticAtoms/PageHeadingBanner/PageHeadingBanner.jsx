import React from "react";
import { Space } from "antd";
import Icon from "@/components/Icon";
import "./PageHeadingBanner.scss";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

const PageHeadingBanner = ({ heading, currentPageTitle }) => {
  return (
    <div
      className="breadcrumb-wrapper bg-cover"
      style={{ backgroundImage: "url('https://placehold.co/1920x420')" }}
    >
      <div className="container">
        <div className="page-heading">
          <h1 className="C-heading size-2 extraBold color-white">{heading}</h1>
          <div className="mt-3">
            <Space>
              <Link href={ROUTES.PUBLIC.HOME} className="no-underline">
                <span className="C-heading size-5 bold color-white mb-0">
                  Home
                </span>
              </Link>
              <span className="C-heading size-5 bold color-white">
                <Icon name="keyboard_double_arrow_right" color="#fff" />
              </span>
              <span className="C-heading size-5 bold color-dark mb-0">
                {currentPageTitle}
              </span>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeadingBanner;
