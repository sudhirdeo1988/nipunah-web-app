import React from "react";
import {
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Card } from "antd";
import Image from "next/image";
const { Meta } = Card;

const ExpertCard = () => {
  return (
    <>
      <Card
        size="small"
        cover={
          <Image
            src="/assets/images/demo-expert-2.webp"
            alt="My Logo"
            width={180}
            height={200}
            class="img-thumbnail"
          />
        }
        actions={[
          <button className="C-settingButton small">
            <i className="bi bi-facebook color-light"></i>
          </button>,
          <button className="C-settingButton small">
            <i className="bi bi-linkedin color-light"></i>
          </button>,
          <button className="C-settingButton small">
            <i className="bi bi-twitter color-light"></i>
          </button>,
          <button className="C-settingButton small">
            <i className="bi bi-instagram color-light"></i>
          </button>,
        ]}
      >
        <Meta
          title={
            <span className="C-heading size-6 color-primary bold mb-0">
              Expert Name
            </span>
          }
          description={
            <span className="C-heading size-xs mb-0">
              This is the description
            </span>
          }
        />
      </Card>
    </>
  );
};

export default ExpertCard;
