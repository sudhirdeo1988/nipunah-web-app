"use client";
import React from "react";
import { CaretRightOutlined } from "@ant-design/icons";
import { Space } from "antd";
import Icon from "../Icon";
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
    <footer className="footer-wrapper">
      <div className="container">
        <div className="footer-widgets-1">
          <div className="row g-5">
            <div className="col-xl-4 col-lg-6">
              <div className="single-footer-widget me-xxl-5 pe-xxl-4">
                <div className="widget-head mb-3">
                  <Image
                    src="/assets/images/logo.png"
                    alt="My Logo"
                    width={180}
                    height={60}
                  />
                </div>
                <div className="footer-content">
                  <p className="C-heading size-xs mb-3 color-white semiBold">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard.
                  </p>
                  <h5 className="C-heading size-xs semiBold mb-1 color-white">
                    Subscribe Now
                  </h5>
                  <div className="footer-input border-radius-none">
                    <input type="email" id="email2" placeholder="Your Email" />
                    <button
                      className="newsletter-btn border-radius-none"
                      type="submit"
                    >
                      <Icon name="send" color="#ffffff" />
                    </button>
                  </div>
                  <div className="social-icon d-flex align-items-center">
                    <button className="C-settingButton is-clean ">
                      <i className="bi bi-facebook color-light"></i>
                    </button>
                    <button className="C-settingButton is-clean">
                      <i className="bi bi-linkedin color-light"></i>
                    </button>
                    <button className="C-settingButton is-clean">
                      <i className="bi bi-twitter color-light"></i>
                    </button>
                    <button className="C-settingButton is-clean">
                      <i className="bi bi-instagram color-light"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-xl-2 col-lg-6 wow fadeInUp"
              data-wow-delay="400ms"
            >
              <div className="single-footer-widget ms-xxl-2">
                <h4 className="C-heading size-5 extraBold color-white mb-3">
                  Useful Links
                </h4>

                <ul className="list-area">
                  {navItems.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className={`foolterNavLink ${
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
              className="col-xl-3 col-lg-6 wow fadeInUp"
              data-wow-delay="600ms"
            >
              <div className="single-footer-widget ms-xxl-4 ps-xxl-3">
                <h4 className="C-heading size-5 extraBold color-white mb-3">
                  Useful Links
                </h4>
                <ul className="list-area">
                  <li>
                    <Link href={ROUTES.AUTH.LOGIN} className="foolterNavLink">
                      <Space size={4}>
                        <CaretRightOutlined />
                        Privacy Policy
                      </Space>
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.AUTH.LOGIN} className="foolterNavLink">
                      <Space size={4}>
                        <CaretRightOutlined />
                        Terms of Service
                      </Space>
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.AUTH.LOGIN} className="foolterNavLink">
                      <Space size={4}>
                        <CaretRightOutlined />
                        Refund Policy
                      </Space>
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.AUTH.LOGIN} className="foolterNavLink">
                      <Space size={4}>
                        <CaretRightOutlined />
                        Legal Disclaimers
                      </Space>
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.AUTH.LOGIN} className="foolterNavLink">
                      <Space size={4}>
                        <CaretRightOutlined />
                        Help & Support
                      </Space>
                    </Link>
                  </li>
                  <li>
                    <Link href={ROUTES.AUTH.LOGIN} className="foolterNavLink">
                      <Space size={4}>
                        <CaretRightOutlined />
                        Maritime Glossary
                      </Space>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div
              className="col-xl-3 col-lg-6 wow fadeInUp"
              data-wow-delay="800ms"
            >
              <div className="single-footer-widget ms-xxl-3">
                <h4 className="C-heading size-5 extraBold color-white mb-3">
                  Contact Us
                </h4>
                <div className="footer-content">
                  <div className="contact-info-area">
                    <div className="contact">
                      <Icon name="mail" />
                      <div className="contact-infu">
                        <span className="C-heading size-xs mb-0 color-white semiBold">
                          Mail Us:
                        </span>
                        <h5 className="C-heading size-6 bold  color-white mb-0">
                          test@gmail.com
                        </h5>
                      </div>
                    </div>
                    <div className="contact">
                      <Icon name="location_on" />
                      <div className="contact-infu">
                        <span className="C-heading size-xs mb-0 color-white semiBold">
                          Address:
                        </span>
                        <h5 className="C-heading size-6 bold color-white mb-0">
                          Lorem Ipsum is simply dummy text, of the printing and
                        </h5>
                      </div>
                    </div>
                    <div className="contact">
                      <Icon name="call" />
                      <div className="contact-infu">
                        <span className="C-heading size-xs mb-0 color-white semiBold">
                          Contact:
                        </span>
                        <h5 className="C-heading size-6 bold color-white mb-0">
                          +91 009 494 094
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
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
