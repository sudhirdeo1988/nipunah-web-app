"use client";

import React from "react";
import Icon from "@/components/Icon/Icon";
import { Input, Popover, Space } from "antd";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import "./Header.scss";

const Header = () => {
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
    <header className="mainHeader">
      <div className="topbar">
        <div className="container">
          <div className="topbar-inner d-flex align-items-center justify-content-between">
            <ul>
              <li>
                <Space align="center">
                  <Icon name="add_call" size="sm" className="color-white" />
                  <span className="C-heading size-xs color-white semiBold mb-0">
                    +44 920 090 505{" "}
                  </span>
                </Space>
              </li>
              <li>
                <Space align="center">
                  <Icon name="mail" size="sm" className="color-white" />
                  <span className="C-heading size-xs color-white semiBold mb-0">
                    testing@gmail.com
                  </span>
                </Space>
              </li>
            </ul>

            <div className="social">
              <Space size={8}>
                <button className="C-settingButton extra-small is-clean">
                  <i className="bi bi-facebook color-light"></i>
                </button>
                <button className="C-settingButton extra-small is-clean">
                  <i className="bi bi-linkedin color-light"></i>
                </button>
                <button className="C-settingButton extra-small is-clean">
                  <i className="bi bi-twitter color-light"></i>
                </button>
                <button className="C-settingButton extra-small is-clean">
                  <i className="bi bi-instagram color-light"></i>
                </button>
              </Space>
            </div>
          </div>
        </div>
      </div>
      <div className="c-header">
        <div className="container">
          <div className="header-main">
            <div className="header-main-left">
              <Space>
                <button className="C-settingButton is-clean d-sm-block d-md-none">
                  <Icon
                    name="menu"
                    style={{ fontSize: "2rem", fontWeight: "600" }}
                  />
                </button>
                <Image
                  src="/assets/images/logo.png"
                  alt="My Logo"
                  width={180}
                  height={60}
                />
              </Space>
            </div>
            <div className="header-main-right">
              <nav className="nav-links">
                <ul className="d-flex gap-4 mb-0 align-items-center">
                  {navItems.map(({ label, href }) => (
                    <li className="d-none d-sm-none d-md-block" key={label}>
                      <Link
                        href={href}
                        className={`navLink ${
                          pathname === href ? "active" : ""
                        }`}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href={ROUTES.AUTH.LOGIN}>
                      <button className="C-button is-filled">
                        Login/Get Listed
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Popover
                      placement="bottom"
                      content={<Input.Search placeholder="Search" />}
                    >
                      <button className="C-settingButton">
                        <Icon name="search" />
                      </button>
                    </Popover>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
