import React, { useState } from "react";
import "./HeaderBeta.scss";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { Drawer, Space } from "antd";
import Icon from "../Icon";

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
  const [open, setOpen] = useState(false);
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
        <li className="forMobile">
          <Link href={ROUTES.PUBLIC.LOGIN}>
            <button className="C-button is-bordered">Get Listed</button>
          </Link>
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
