"use client";

import React from "react";
import { Space, Tag } from "antd";
import Icon from "../Icon";
import { isEmpty as _isEmpty, map as _map } from "lodash-es";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";

const CompanyCard = () => {
  const router = useRouter();
  return (
    <div className="bg-white p-3 shadow-sm rounded">
      <div className="row g-3 align-items-center">
        <div className="col-md-3 d-none d-md-block">
          <div className="border p-3 rounded bg-light">
            <Image
              src="/assets/images/logo.png"
              alt="My Logo"
              width={70}
              height={50}
              className="img-fluid"
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <div className="col-md-9 col-sm-12">
          <h3 className="C-heading size-5 mb-1 bold font-family-creative color-primary text-truncate">
            Company name here
          </h3>
          <h3 className="C-heading size-6 color-light mb-3 font-family-creative  text-truncate">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry.
          </h3>

          <div className="d-flex flex-row gap-3 align-items-center mb-3">
            <div>
              <Space size={4}>
                <Icon name="location_on" />
                <span className="C-heading size-xs color-light mb-0">
                  Chennai, India
                </span>
              </Space>
            </div>
            <div>
              <Space size={4}>
                <Icon name="bookmark_check" />
                <span className="C-heading size-xs color-light mb-0">
                  Full Time
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
              <Space wrap size={4}>
                <Tag color="gold" className="rounded">
                  Marine Engineering
                </Tag>
              </Space>
            </div>
            <div className="col-4 text-right">
              <button
                className="C-button is-link p-0 small bold"
                onClick={() => router.push(`${ROUTES?.PUBLIC?.COMPANIES}/123`)}
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
