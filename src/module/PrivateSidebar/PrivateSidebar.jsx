import React from "react";
import "./PrivateSidebar.scss";
import Image from "next/image";
import { Avatar, Dropdown, Space } from "antd";
import Icon from "@/components/Icon";
import { map as _map } from "lodash-es";
import { DASHBOARD_ROUTES } from "module/utility/utility";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/utilities/AuthContext";
import { ROUTES } from "@/constants/routes";

const PrivateSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleNavigation = (route) => {
    if (!route) return;
    router.push(route);
  };

  /**
   * Handles logout functionality
   * Clears authentication token and redirects to login page
   */
  const handleLogout = () => {
    logout();
    router.push(ROUTES.PUBLIC.LOGIN);
  };

  const items = [
    {
      key: "profile",
      label: (
        <button
          className="C-button is-clean p-0 w-100 text-left small color-light"
          onClick={() => handleNavigation(ROUTES.PRIVATE.PROFILE)}
        >
          <Space>
            <Icon name="person" />
            <span>Profile</span>
          </Space>
        </button>
      ),
    },
    {
      key: "settings",
      label: (
        <button
          className="C-button is-clean p-0 w-100 text-left small color-light"
          onClick={() => handleNavigation(ROUTES.PRIVATE.SETTINGS)}
        >
          <Space>
            <Icon name="settings" />
            <span>Settings</span>
          </Space>
        </button>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: (
        <button
          className="C-button is-clean p-0 w-100 text-left small color-light"
          onClick={handleLogout}
        >
          <Space>
            <Icon name="logout" />
            <span>Logout</span>
          </Space>
        </button>
      ),
    },
  ];
  return (
    <div className="c-privateSidebar">
      <div className="sidebar-header p-3">
        <Image
          src="/assets/images/logo.png"
          alt="My Logo"
          width={130}
          height={40}
        />
      </div>
      <div className="sidebar-body p-3">
        <div className="d-flex flex-column gap-1">
          {_map(DASHBOARD_ROUTES?.COMPANY, (nav) => {
            return (
              <button
                className={`C-button is-clean width-100 p-0 p-2 text-left sidebarNav ${
                  pathname === nav?.route ? "active" : ""
                }`}
                key={nav?.id}
                onClick={() => nav?.route && handleNavigation(nav.route)}
              >
                <Space align="center" size={6}>
                  <Icon name={nav?.icon} style={{ fontSize: "1.4rem" }} />
                  <span className="C-heading size-xs color-light mb-0 bold">
                    {nav?.label}
                  </span>
                </Space>
              </button>
            );
          })}
        </div>
      </div>
      <div className="sidebar-footer p-3">
        <Dropdown menu={{ items }} placement="top" className="userProfile" trigger={['hover', 'click']}>
          <button className="border-0 p-0">
            <Avatar
              src={
                <Image
                  src="/assets/images/avatar-1.jpg"
                  alt="My Logo"
                  width={42}
                  height={42}
                />
              }
              size={42}
            />
            <div className="details">
              <span className="C-heading size-6 bold color-dark mb-0 font-family-creative">
                Sudhir Deolalikar
              </span>
              <span className="C-heading size-xs semiBold color-light mb-0">
                Admin Head
              </span>
            </div>
          </button>
        </Dropdown>
      </div>
    </div>
  );
};

export default PrivateSidebar;
