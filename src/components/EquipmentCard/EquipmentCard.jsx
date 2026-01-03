import React from "react";
import { Space, Tag, Badge } from "antd";
import Icon from "../Icon";
import { isEmpty as _isEmpty, map as _map } from "lodash-es";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";

const EquipmentCard = ({ data }) => {
  const router = useRouter();
  
  if (!data) {
    return null;
  }

  // Map available_for to display text
  const getAvailableForText = (availableFor) => {
    if (!availableFor) return "N/A";
    const text = availableFor.charAt(0).toUpperCase() + availableFor.slice(1);
    return text === "Rent" ? "Rent" : text === "Lease" ? "Lease" : text === "Purchase" ? "Sale" : text;
  };

  // Get badge color based on available_for
  const getBadgeColor = (availableFor) => {
    if (!availableFor) return "default";
    const lower = availableFor.toLowerCase();
    if (lower === "rent") return "red";
    if (lower === "lease") return "blue";
    if (lower === "purchase") return "green";
    return "default";
  };

  const availableForText = getAvailableForText(data.availableFor);
  const badgeColor = getBadgeColor(data.availableFor);

  return (
    <div className="bg-white p-2 shadow-sm rounded">
      <div className="row g-3 align-items-center">
        <div className="col-md-3 d-none d-md-block">
          <Badge.Ribbon text={availableForText} color={badgeColor} style={{ right: "-4px" }}>
            <Image
              src="/assets/images/equipment_1.jpg"
              alt={data.name || "Equipment"}
              width={160}
              height={120}
              style={{ width: "100%", height: "100%" }}
              className="rounded p-1"
            />
          </Badge.Ribbon>
        </div>
        <div className="col-md-9 col-sm-12 px-2">
          <h3 className="C-heading size-5 mb-1 bold font-family-creative color-primary text-truncate">
            {data.name || "Equipment Name"}
          </h3>
          <h3 className="C-heading size-6 color-light mb-3 font-family-creative text-truncate">
            {data.about || data.description || "No description available"}
          </h3>

          <div className="d-flex flex-row gap-3 align-items-center mb-3">
            <div>
              <Space size={4}>
                <Icon name="location_on" />
                <span className="C-heading size-xs color-light mb-0">
                  Type: <strong>{data.type || "N/A"}</strong>
                </span>
              </Space>
            </div>
            <div>
              <Space size={4}>
                <Icon name="nest_clock_farsight_analog" />
                <span className="C-heading size-xs color-light mb-0">
                  Year: <strong>{data.manufactureYear || "N/A"}</strong>
                </span>
              </Space>
            </div>
          </div>

          <div className="row align-items-center">
            <div className="col-8">
              <Space wrap size={4}>
                {data.category && (
                  <Tag color="gold" className="rounded">
                    {data.category}
                  </Tag>
                )}
              </Space>
            </div>
            <div className="col-4 text-right">
              <button
                className="C-button is-link p-0 small bold"
                onClick={() => router.push(`${ROUTES?.PUBLIC?.EQUIPMENT}/${data.id}`)}
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

export default EquipmentCard;
