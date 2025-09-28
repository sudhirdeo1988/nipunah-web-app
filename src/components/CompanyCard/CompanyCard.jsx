"use client";

import React from "react";
import { Col, Row, Space, Tag } from "antd";
import Icon from "../Icon";
import { isEmpty as _isEmpty, map as _map } from "lodash-es";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import "./CompanyCard.scss";

const CompanyCard = ({ data }) => {
  const router = useRouter();
  return (
    <div className="companyCard p-0">
      {data?.isPriority && (
        <Icon name="bookmark" className="isPriority" isFilled />
      )}
      <div className="row g-0">
        <div className="col-md-3 col-sm-5 col-xs-12 position-relative">
          <div className="profileWrapper px-2 py-md-3">
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
        <div className="col-md-9 col-sm-7 col-xs-12 p-3 pb-0">
          <h2 className="C-heading size-6 extraBold color-dark mb-1">
            {data?.name}
          </h2>
          <Row gutter={24} className="mb-2">
            {!_isEmpty(data?.segment) && (
              <Col align="center">
                <Space align="center" size={4}>
                  <Icon name="card_travel" className="notifi-icon type-1" />
                  <span className="C-heading size-xs mb-0 color-light">
                    {data?.segment}
                  </span>
                </Space>
              </Col>
            )}
            <Col>
              <Space align="center" size={6}>
                <Icon name="location_on" className="notifi-icon type-2" />
                <span className="C-heading size-xs mb-0">
                  {data?.location?.state}, {data?.location?.country}
                </span>
              </Space>
            </Col>
            <Col>
              <Space align="center" size={6}>
                <Icon name="alarm" className="notifi-icon type-3" />
                <span className="C-heading size-xs mb-0">
                  {data?.createdOn}
                </span>
              </Space>
            </Col>
          </Row>
        </div>
        <div className="p-3">
          {!_isEmpty(data?.description) && (
            <span className="C-heading size-xs dont-break mb-3 color-light text-truncate">
              {data?.description}
            </span>
          )}
          <div className="row">
            <div className="col-8">
              {!_isEmpty(data?.category) &&
                _map(data?.category, (category) => (
                  <Tag key={category}>{category}</Tag>
                ))}
            </div>
            <div className="col-4 text-right">
              <button
                className="C-button small is-link p-0 bold"
                onClick={() => router.push(`${ROUTES?.PUBLIC?.COMPANIES}/123`)}
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
