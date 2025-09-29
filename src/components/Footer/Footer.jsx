"use client";
import React from "react";
import { CaretRightOutlined } from "@ant-design/icons";
import { Space } from "antd";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import "./Footer.scss";

const Footer = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: ROUTES.PUBLIC.HOME },
    { label: "About Us", href: ROUTES.PUBLIC.ABOUT },
    { label: "Companies", href: ROUTES.PUBLIC.COMPANIES },
    { label: "Equipment", href: ROUTES.PUBLIC.EQUIPMENT },
    { label: "Experts", href: ROUTES.PUBLIC.EXPERTS },
    { label: "Contact", href: ROUTES.PUBLIC.CONTACT },
  ];
  return (
    <footer className="footer-wrapper bg-dark pt-3">
      <div className="container">
        <div className="footer-widgets-1">
          <div className="row g-5">
            <div className="col-xl-5 col-lg-6">
              <div className="single-footer-widget me-xxl-5 pe-xxl-4">
                <div className="widget-head mb-3">
                  <Image
                    src="/assets/images/logo.png"
                    alt="My Logo"
                    width={180}
                    height={70}
                    className="p-2 bg-white rounded"
                  />
                </div>
                <div className="footer-content">
                  <p className="C-heading size-6 color-white mb-3">
                    Nipunah.com is the world's first integrated digital platform
                    for the maritime and ocean economy — connecting shipowners,
                    dredging firms, ports, offshore service providers, and
                    marine tech companies.
                  </p>

                  <div className="social-icon d-flex align-items-center mt-3 gap-2">
                    <button className="C-settingButton rounded">
                      <i className="bi bi-facebook color-dark"></i>
                    </button>
                    <button className="C-settingButton rounded">
                      <i className="bi bi-linkedin color-dark"></i>
                    </button>
                    <button className="C-settingButton rounded">
                      <i className="bi bi-twitter color-dark"></i>
                    </button>
                    <button className="C-settingButton rounded">
                      <i className="bi bi-instagram color-dark"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6">
              <div className="single-footer-widget ms-xxl-2">
                <h4 className="C-heading size-5 bold color-white mb-3 font-family-creative">
                  Useful Links
                </h4>

                <ul className="list-area">
                  {navItems.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className={`foolterNavLink C-heading size-6 ${
                          pathname === href ? "active" : ""
                        }`}
                      >
                        <Space size={4}>
                          <CaretRightOutlined />
                          {label}
                        </Space>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div
              className="col-xl-4 col-lg-6 wow fadeInUp"
              data-wow-delay="600ms"
            >
              <div className="single-footer-widget ms-xxl-4 ps-xxl-3">
                <h4 className="C-heading size-5 bold color-white mb-3 font-family-creative">
                  Useful Links
                </h4>
                <ul className="list-area">
                  <li>
                    <Link href={ROUTES.PUBLIC.LOGIN} className="foolterNavLink">
                      <Space size={4}>
                        <CaretRightOutlined />
                        Privacy Policy
                      </Space>
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.PUBLIC.LOGIN} className="foolterNavLink">
                      <Space size={4}>
                        <CaretRightOutlined />
                        Terms of Service
                      </Space>
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.PUBLIC.LOGIN} className="foolterNavLink">
                      <Space size={4}>
                        <CaretRightOutlined />
                        Refund Policy
                      </Space>
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.PUBLIC.LOGIN} className="foolterNavLink">
                      <Space size={4}>
                        <CaretRightOutlined />
                        Legal Disclaimers
                      </Space>
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.PUBLIC.LOGIN} className="foolterNavLink">
                      <Space size={4}>
                        <CaretRightOutlined />
                        Help & Support
                      </Space>
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.PUBLIC.LOGIN} className="foolterNavLink">
                      <Space size={4}>
                        <CaretRightOutlined />
                        Maritime Glossary
                      </Space>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom section-bg-2">
        <div className="container">
          <p className="C-heading size-xs mb-0 color-white text-center semiBold">
            &copy;Copyright 2025 Nipunah All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
