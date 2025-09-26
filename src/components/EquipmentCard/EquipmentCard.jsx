import React from "react";
import { Col, Divider, Row, Space } from "antd";
import Icon from "../Icon";
import { isEmpty as _isEmpty, map as _map } from "lodash-es";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import "./EquipmentCard.scss";

const EquipmentCard = ({ data }) => {
  const router = useRouter();
  return (
    <div className="companyCard type-2">
      {data?.isPriority && (
        <Icon name="bookmark" className="isPriority" isFilled />
      )}
      <div className="row g-0 align-items-center">
        <div className="col-md-3 col-sm-5 col-xs-12 position-relative">
          <span className="overlayTag">{data?.availableFor}</span>
          <Image
            src="/assets/images/equipment_1.jpg"
            alt="My Logo"
            width={160}
            height={120}
            style={{ width: "100%" }}
            class="img-thumbnail border-0 rounded-2 equipementImage"
          />
        </div>
        <div className="col-md-9 col-sm-7 col-xs-12 p-3">
          <h2 className="C-heading size-6 extraBold color-dark mb-1">
            {data?.name}
          </h2>
          <span className="C-heading size-xss dont-break mb-2 color-light semiBold">
            Type: <strong>{data?.type}</strong>
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
            <span className="C-heading size-xs dont-break mb-3 color-light text-truncate">
              {data?.description}
            </span>
          )}

          <Row gutter={24} className="mb-0">
            <Col xs={16}>
              <Space align="center" size={6}>
                <Icon name="settings" className="notifi-icon type-3" />
                <span className="C-heading size-xs mb-0">{data?.category}</span>
              </Space>
            </Col>

            <Col xs={8} className="text-right">
              <button
                className="C-button small is-link p-0 bold"
                onClick={() => router.push(`${ROUTES?.PUBLIC?.EQUIPMENT}/123`)}
              >
                View Details
              </button>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
