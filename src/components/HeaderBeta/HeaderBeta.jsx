import React, { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { Avatar, Drawer, Dropdown, Popover, Space } from "antd";
import Icon from "../Icon";
import { map as _map } from "lodash-es";
import "./HeaderBeta.scss";
import { userTypes } from "@/utilities/auth";

const navItems = [
  { label: "Home", href: ROUTES.PUBLIC.HOME },
  { label: "About Us", href: ROUTES.PUBLIC.ABOUT },
  { label: "Companies", href: ROUTES.PUBLIC.COMPANIES },
  { label: "Equipment", href: ROUTES.PUBLIC.EQUIPMENT },
  { label: "Experts", href: ROUTES.PUBLIC.EXPERTS },
  { label: "Pricing", href: ROUTES.PUBLIC.SUBSCRIPTION },
];

const HeaderBeta = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const onRenderMenuBar = () => {
    const content = (
      <div className="signupPopover text-center">
        <span className="C-heading size-6 text-center semiBold color-light mb-3">
          Sign up to access more features.
        </span>
        <div className="row g-2 mb-4">
          <div className="col">
            <div
              className="signupCard p-2 h-100 text-center rounded-3"
              role="button"
              onClick={() => router.push(`${ROUTES?.PUBLIC?.SIGNUP}?for=user`)}
            >
              <div className="profile rounded-circle">
                <i className="bi bi-person-badge-fill"></i>
              </div>
              <span className="C-heading size-6 extraBold mb-2 color-white">
                Browse Listing
              </span>
              <span className="C-heading size-xs color-light mb-0 color-white">
                Explore companies, experts, Jobs and much more.
              </span>
            </div>
          </div>
          <div className="col">
            <div
              className="signupCard p-2 h-100 text-center rounded-3"
              role="button"
              onClick={() =>
                router.push(`${ROUTES?.PUBLIC?.SIGNUP}?for=expert`)
              }
            >
              <div className="profile rounded-circle">
                <i className="bi bi-person-lines-fill"></i>
              </div>
              <span className="C-heading size-6 extraBold mb-2 color-white">
                Create expert profile
              </span>
              <span className="C-heading size-xs color-light mb-0 color-white">
                Showcase your expertise and get discovered.
              </span>
            </div>
          </div>
          <div className="col">
            <div
              className="signupCard p-2 h-100 text-center rounded-3"
              role="button"
              onClick={() =>
                router.push(`${ROUTES?.PUBLIC?.SIGNUP}?for=company`)
              }
            >
              <div className="profile rounded-circle">
                <i className="bi bi-building-fill-check"></i>
              </div>
              <span className="C-heading size-6 extraBold mb-2 color-white">
                List my company
              </span>
              <span className="C-heading size-xs color-light mb-0 color-white">
                Subscribe and get listed your company
              </span>
            </div>
          </div>
        </div>
        <Link href={ROUTES.PUBLIC.LOGIN} className="C-button is-link mb-1 p-0">
          <Space>
            <Icon name="login" />
            Login to access your account
          </Space>
        </Link>
      </div>
    );

    const userSettings = (
      <div className="userSettings">User setting popover</div>
    );

    return (
      <>
        {navItems.map(({ label, href }) => (
          <li className="d-block" key={label}>
            <Link
              href={href}
              className={`navLink ${pathname === href ? "active" : ""}`}
            >
              {label}
            </Link>
          </li>
        ))}

        <li>
          <Popover content={content} placement="bottomRight">
            <button className={`navLink is-clean`}>
              <Space size={2}>
                Login / Sign up
                <Icon name="arrow_drop_down" className="color-primary" />
              </Space>
            </button>
          </Popover>
        </li>
        <li>
          <Popover content={userSettings} placement="bottomRight">
            <button className="userAccount rounded-pill text-left p-1">
              <Avatar
                style={{ backgroundColor: "#1677ff", verticalAlign: "middle" }}
                size={36}
              >
                S
              </Avatar>
            </button>
          </Popover>
        </li>
      </>
    );
  };

  return (
    <>
      <header className="c-headerBeta">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-3 col-md-4 col-sm-12">
              <Space>
                <button
                  className="C-settingButton is-clean d-sm-block d-md-none"
                  onClick={() => setOpen(true)}
                >
                  <Icon name="menu" />
                </button>
                <Image
                  src="/assets/images/logo.png"
                  alt="My Logo"
                  width={164}
                  height={50}
                />
              </Space>
            </div>
            <div className="col-xl-9 col-md-8 d-none d-md-block text-right">
              <nav className="headerNav">
                <ul className="gap-2 mb-0 align-items-center d-none d-sm-none d-md-flex justify-content-end">
                  {onRenderMenuBar()}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>
      <Drawer
        title="Menu"
        placement={"left"}
        onClose={() => setOpen(false)}
        open={open}
        key={"left"}
        closable
      >
        <nav className="nav-links forMobile">
          <ul className="d-flex d-sm-flex d-md-none gap-4 mb-0 flex-column">
            {onRenderMenuBar()}
          </ul>
        </nav>
      </Drawer>
    </>
  );
};

export default HeaderBeta;
