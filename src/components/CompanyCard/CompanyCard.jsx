import React from "react";
import { Col, Row, Space, Tag } from "antd";
import Icon from "../Icon";
import { isEmpty as _isEmpty, map as _map } from "lodash-es";
import Image from "next/image";
import "./CompanyCard.scss";

const CompanyCard = ({ data }) => {
  return (
    <div className="companyCard">
      {data?.isPriority && (
        <Icon name="bookmark" className="isPriority" isFilled />
      )}
      <div className="row mb-1">
        <div className="col-10">
          <h2 className="C-heading size-xs extraBold color-dark mb-1">
            {data?.name}
          </h2>
          {!_isEmpty(data?.description) && (
            <span className="C-heading size-xs dont-break mb-2 color-light text-truncate">
              {data?.description}
            </span>
          )}
        </div>
        <div className="col-2 text-right">
          <div className="profileWrapper">
            <Image
              src="/assets/images/demo-logo.gif"
              alt="My Logo"
              width={38}
              height={38}
            />
          </div>
        </div>
      </div>
      <Row gutter={24} className="mb-3">
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
            <span className="C-heading size-xs mb-0">{data?.createdOn}</span>
          </Space>
        </Col>
      </Row>
      <div className="row">
        <div className="col-8">
          {!_isEmpty(data?.category) &&
            _map(data?.category, (category) => (
              <Tag key={category}>{category}</Tag>
            ))}
        </div>
        <div className="col-4 text-right">
          <button className="C-button small is-link p-0 bold">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
