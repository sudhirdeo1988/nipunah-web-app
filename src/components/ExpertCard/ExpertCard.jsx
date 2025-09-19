import React from "react";

import { Avatar, Card, Space } from "antd";
import Icon from "../Icon";
const { Meta } = Card;

const ExpertCard = () => {
  return (
    <div classNames="customCard">
      <Card
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
          avatar={
            <Avatar
              size={44}
              src="https://api.dicebear.com/7.x/miniavs/svg?seed=8"
              className="border"
            />
          }
          title={
            <span className="C-heading size-6 color-primary bold mb-0">
              Expert Name
            </span>
          }
          description={
            <>
              <span className="C-heading size-xs mb-2 semiBold">
                <Space>
                  <Icon name="account_circle" size="small" isFilled />
                  Account Manager - 12 years
                </Space>
              </span>
              <span className="C-heading size-xs mb-0">
                <Space>
                  <Icon name="location_on" size="small" isFilled />
                  London, UK
                </Space>
              </span>
            </>
          }
        />
      </Card>
    </div>
  );
};

export default ExpertCard;
