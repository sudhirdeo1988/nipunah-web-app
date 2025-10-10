import React from "react";
import "./PrivateSidebar.scss";
import Image from "next/image";
import { Avatar, Button, Dropdown } from "antd";
import Icon from "@/components/Icon";

const PrivateSidebar = () => {
  const items = [
    {
      key: "1",
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.antgroup.com"
        >
          1st menu item
        </a>
      ),
    },
    {
      key: "2",
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.aliyun.com"
        >
          2nd menu item
        </a>
      ),
    },
    {
      key: "3",
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.luohanacademy.com"
        >
          3rd menu item
        </a>
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
      <div className="sidebar-footer p-3">
        <Dropdown menu={{ items }} placement="top" className="userProfile">
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
