import React from "react";
import { Avatar, Space } from "antd";
import Icon from "../Icon";

const ExpertCard = () => {
  return (
    <>
      <div className="bg-white p-3 shadow-sm rounded">
        <div className="row g-3">
          <div className="col-md-2 d-none d-md-block">
            <Avatar
              size={64}
              src="https://api.dicebear.com/7.x/miniavs/svg?seed=8"
              className="border p-1"
              shape="square"
            />
          </div>
          <div className="col-md-10 col-sm-12">
            <h3 className="C-heading size-5 mb-1 bold font-family-creative color-primary text-truncate">
              Expert name here
            </h3>
            <h3 className="C-heading size-6 color-light mb-2 font-family-creative  text-truncate">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry.
            </h3>

            <div className="d-flex flex-row gap-3 align-items-center mb-2">
              <div>
                <Space size={4}>
                  <Icon name="location_on" />
                  <span className="C-heading size-xs color-light mb-0">
                    London, UK
                  </span>
                </Space>
              </div>
              <div>
                <Space size={4}>
                  <Icon name="account_circle" />
                  <span className="C-heading size-xs color-light mb-0">
                    Account Manager
                  </span>
                </Space>
              </div>
              <div>
                <Space size={4}>
                  <Icon name="nest_clock_farsight_analog" />
                  <span className="C-heading size-xs color-light mb-0">
                    11 months ago
                  </span>
                </Space>
              </div>
            </div>

            <div className="row align-items-center">
              <div className="col-8">
                <div className="social-icon d-flex align-items-center">
                  <button className="C-settingButton is-clean small">
                    <i
                      className="bi bi-facebook"
                      style={{ color: "#1877F2" }}
                    ></i>
                  </button>
                  <button className="C-settingButton is-clean small">
                    <i
                      className="bi bi-linkedin"
                      style={{ color: "#0077B5" }}
                    ></i>
                  </button>
                  <button className="C-settingButton is-clean small">
                    <i
                      className="bi bi-twitter"
                      style={{ color: "#000000" }}
                    ></i>
                  </button>
                </div>
              </div>
              <div className="col-4 text-right">
                <button
                  className="C-button is-link p-0 small bold"
                  onClick={() =>
                    router.push(`${ROUTES?.PUBLIC?.COMPANIES}/123`)
                  }
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpertCard;
