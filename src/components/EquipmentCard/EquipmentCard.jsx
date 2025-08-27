import React from "react";
import { Avatar, Col, Row, Space, Tag } from "antd";
import Icon from "../Icon";
import Link from "next/link";
import { isEmpty as _isEmpty, map as _map } from "lodash-es";
import { UserOutlined } from "@ant-design/icons";
import "./EquipmentCard.scss";

const EquipmentCard = ({ data }) => {
  return (
    <div className="companyCard d-flex gap-3">
      <div>
        <div className="profile">
          <Avatar
            icon={<UserOutlined />}
            size={42}
            shape="square"
            style={{ backgroundColor: "#d1e3f6" }}
          />
        </div>
      </div>
      <div className="flex-grow-1">
        <Link href={"/"} className="C-button is-link p-0 mb-1">
          {data?.name}
        </Link>
        {!_isEmpty(data?.description) && (
          <span className="C-heading size-xs dont-break mb-2">
            {data?.description}
          </span>
        )}
        <Row gutter={24} className="mb-2">
          {!_isEmpty(data?.segment) && (
            <Col align="center">
              <Space align="center">
                <Icon
                  name="card_travel"
                  color="#cccccc"
                  style={{ fontSize: "1.2rem" }}
                />
                <span className="C-heading size-xs mb-0">{data?.segment}</span>
              </Space>
            </Col>
          )}
          <Col>
            <Space align="center">
              <Icon
                name="alarm"
                color="#cccccc"
                style={{ fontSize: "1.2rem" }}
              />
              <span className="C-heading size-xs mb-0">{data?.createdOn}</span>
            </Space>
          </Col>
          <Col>
            <Space align="center">
              <Icon
                name="location_on"
                color="#cccccc"
                style={{ fontSize: "1.2rem" }}
              />
              <span className="C-heading size-xs mb-0">
                {data?.location?.state}, {data?.location?.country}
              </span>
            </Space>
          </Col>
        </Row>
        {!_isEmpty(data?.category) &&
          _map(data?.category, (category) => (
            <Tag color="green" key={category}>
              {category}
            </Tag>
          ))}
      </div>
      <div className="bd-highlight">
        <button className="C-button is-bordered small">View Details</button>
      </div>
    </div>
  );
};

export default EquipmentCard;
