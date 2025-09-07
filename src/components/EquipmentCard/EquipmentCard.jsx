import React from "react";
import { Col, Divider, Row, Space } from "antd";
import Icon from "../Icon";
import { isEmpty as _isEmpty, map as _map } from "lodash-es";
import "./EquipmentCard.scss";
import Image from "next/image";

const EquipmentCard = ({ data }) => {
  return (
    <div className="companyCard type-2">
      {data?.isPriority && (
        <Icon name="bookmark" className="isPriority" isFilled />
      )}
      <div className="row g-0">
        <div className="col-md-4 col-sm-5 col-xs-12 position-relative">
          <span className="overlayTag">{data?.availableFor}</span>
          <Image
            src="/assets/images/product-dummy.png"
            alt="My Logo"
            width={220}
            height={160}
          />
        </div>
        <div className="col-md-8 col-sm-7 col-xs-12 p-3">
          <h2 className="C-heading size-xs extraBold color-dark mb-1">
            {data?.name}
          </h2>
          <span className="C-heading size-xss dont-break mb-1 color-light semiBold">
            Model: <strong>{data?.model}</strong>
            <Divider
              type="vertical"
              style={{
                backgroundColor: "#b1b1b1",
                width: "2px",
                margin: "0 12px",
              }}
            />
            Year: <strong>{data?.createdOn}</strong>
          </span>
          {!_isEmpty(data?.description) && (
            <span className="C-heading size-xs dont-break my-3 color-light text-truncate">
              {data?.description}
            </span>
          )}

          <Row gutter={24} className="mb-0">
            <Col xs={8}>
              <Space align="center" size={6}>
                <Icon name="settings" className="notifi-icon type-3" />
                <span className="C-heading size-xs mb-0">{data?.type}</span>
              </Space>
            </Col>
            <Col xs={8}>
              <Space align="center" size={6}>
                <Icon name="location_on" className="notifi-icon type-2" />
                <span className="C-heading size-xs mb-0">
                  {data?.location?.state}, {data?.location?.country}
                </span>
              </Space>
            </Col>

            <Col xs={8} className="text-right">
              <button className="C-button small is-link p-0 bold">
                Enquiry
              </button>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
