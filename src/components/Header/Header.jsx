"use client";

import React, { useMemo } from "react";
import Icon from "@/components/Icon/Icon";
import { Drawer, Space } from "antd";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { useAuth } from "@/utilities/AuthContext";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import "./Header.scss";

const Header = () => {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const { flatPermissions, permissionsReady } = useRolePermissions();
  const [open, setOpen] = React.useState(false);

  const canSeePublicJobs =
    Boolean(isLoggedIn) &&
    permissionsReady &&
    Boolean(flatPermissions?.nav_public_jobs);

  const navItems = useMemo(() => {
    const items = [
      { label: "Home", href: ROUTES.PUBLIC.HOME },
      { label: "About Us", href: ROUTES.PUBLIC.ABOUT },
      { label: "Companies", href: ROUTES.PUBLIC.COMPANIES },
      { label: "Equipment", href: ROUTES.PUBLIC.EQUIPMENT },
      { label: "Experts", href: ROUTES.PUBLIC.EXPERTS },
      { label: "Jobs", href: ROUTES.PUBLIC.JOBS },
      { label: "Pricing", href: ROUTES.PUBLIC.SUBSCRIPTION },
    ];
    return items.filter((item) => {
      if (item.href === ROUTES.PUBLIC.JOBS) return canSeePublicJobs;
      return true;
    });
  }, [canSeePublicJobs]);

  const onRenderMenuBar = () => {
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
        {!isLoggedIn && (
          <li className="forMobile">
            <Link href={ROUTES.PUBLIC.LOGIN}>
              <button className="C-button is-filled">Get Listed</button>
            </Link>
          </li>
        )}
      </>
    );
  };

  return (
    <>
      <header className="mainHeader">
        <div className="container">
          <div className="c-header">
            <div className="container">
              <div className="header-main">
                <div className="header-main-left">
                  <Space>
                    <button
                      className="C-settingButton is-clean d-sm-block d-md-none"
                      onClick={() => setOpen(true)}
                    >
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
                    <ul className="gap-4 mb-0 align-items-center d-none d-sm-none d-md-flex">
                      {onRenderMenuBar()}
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
      >
        <ul className="mobile-nav list-unstyled">{onRenderMenuBar()}</ul>
      </Drawer>
    </>
  );
};

export default Header;
