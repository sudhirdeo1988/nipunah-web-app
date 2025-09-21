import React from "react";
import { Avatar, Space } from "antd";
import Icon from "../Icon";

const ExpertCard = () => {
  return (
    <>
      <div className="companyCard p-0">
        <div className="row g-0">
          <div className="col-md-2 col-sm-5 col-xs-12 text-center py-3">
            <Avatar
              size={54}
              src="https://api.dicebear.com/7.x/miniavs/svg?seed=8"
              className="border p-1"
              shape="square"
            />
          </div>
          <div className="col-md-10 col-sm-7 col-xs-12 px-2 py-3">
            <h2 className="C-heading size-6 extraBold color-dark mb-1">
              Expert Name
            </h2>
            <div className="row mb-3">
              <div className="col-5">
                <Space align="center" size={6}>
                  <Icon
                    name="account_circle"
                    size="small"
                    className="notifi-icon type-1"
                  />
                  <span className="C-heading size-xss mb-0">
                    Account Manager
                  </span>
                </Space>
              </div>
              <div className="col-5">
                <Space align="center" size={6}>
                  <Icon
                    name="location_on"
                    size="small"
                    className="notifi-icon type-2"
                  />
                  <span className="C-heading size-xss mb-0">London, UK</span>
                </Space>
              </div>
            </div>

            <span className="C-heading size-xs dont-break mb-0 color-light text-truncate">
              Lorem Ipsum is simply dummy text of the printing and typesetti
            </span>
          </div>
        </div>
        <div className="py-2 px-3 border-top">
          <div className="row g-0 align-items-center">
            <div className="col-8">
              <div className="social-icon d-flex align-items-center">
                <button className="C-settingButton is-clean">
                  <i
                    className="bi bi-facebook"
                    style={{ color: "#1877F2" }}
                  ></i>
                </button>
                <button className="C-settingButton is-clean">
                  <i
                    className="bi bi-linkedin"
                    style={{ color: "#0077B5" }}
                  ></i>
                </button>
                <button className="C-settingButton is-clean">
                  <i className="bi bi-twitter" style={{ color: "#000000" }}></i>
                </button>
              </div>
            </div>
            <div className="col-4 text-right">
              <button className="C-button small is-link p-0 bold">
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpertCard;
