import React from "react";
import { Space, Tag, Badge } from "antd";
import Icon from "../Icon";
import { isEmpty as _isEmpty, map as _map } from "lodash-es";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import styles from "./EquipmentCard.module.css";

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
    <div 
      className="bg-white rounded equipment-card"
      style={{
        padding: "clamp(10px, 2.5vw, 16px)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "none",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        if (window.innerWidth >= 768) {
          e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.06)";
          e.currentTarget.style.transform = "translateY(-4px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div className="row g-3 g-md-4 align-items-start" style={{ flex: 1, minHeight: 0 }}>
        {/* Image Section - Show on mobile but full width */}
        <div className="col-12 col-md-3 mb-2 mb-md-0">
          <Badge.Ribbon text={availableForText} color={badgeColor} style={{ right: "-4px", top: "8px" }}>
            <div 
              style={{ 
                borderRadius: "12px", 
                overflow: "hidden", 
                height: "clamp(140px, 25vw, 130px)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                width: "100%"
              }}
            >
              <Image
                src="/assets/images/equipment_1.jpg"
                alt={data.name || "Equipment"}
                width={160}
                height={150}
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover",
                  display: "block"
                }}
              />
            </div>
          </Badge.Ribbon>
        </div>
        
        {/* Content Section */}
        <div className="col-12 col-md-9 d-flex flex-column" style={{ minHeight: 0, paddingLeft: "0", flex: 1 }}>
          <div>
            <h3 
              className="C-heading size-5 mb-2 bold font-family-creative color-primary"
              style={{ 
                fontSize: "clamp(16px, 4vw, 20px)",
                fontWeight: 700,
                lineHeight: "1.3",
                marginBottom: "clamp(6px, 1.5vw, 10px)",
                color: "#1890ff",
                letterSpacing: "-0.3px"
              }}
            >
              {data.name || "Equipment Name"}
            </h3>
            <p 
              className="C-heading size-6 color-light mb-3 font-family-creative"
              style={{ 
                fontSize: "clamp(13px, 3vw, 14px)",
                color: "#595959",
                marginBottom: "clamp(12px, 3vw, 16px)",
                lineHeight: "1.6",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}
            >
              {data.about || data.description || "No description available"}
            </p>

            {/* Metadata - Stack on mobile, side-by-side on desktop */}
            <div 
              className="d-flex flex-column flex-md-row align-items-start align-items-md-center mb-3" 
              style={{ 
                marginBottom: "clamp(16px, 4vw, 20px)",
                gap: "clamp(8px, 2vw, 16px)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Icon name="location_on" style={{ color: "#1890ff", fontSize: "clamp(16px, 4vw, 18px)", flexShrink: 0 }} />
                <span className="C-heading size-xs color-light mb-0" style={{ fontSize: "clamp(12px, 3vw, 13px)", color: "#8c8c8c" }}>
                  Type: <strong style={{ color: "#262626", fontWeight: 600, marginLeft: "4px" }}>{data.type || "N/A"}</strong>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Icon name="nest_clock_farsight_analog" style={{ color: "#1890ff", fontSize: "clamp(16px, 4vw, 18px)", flexShrink: 0 }} />
                <span className="C-heading size-xs color-light mb-0" style={{ fontSize: "clamp(12px, 3vw, 13px)", color: "#8c8c8c" }}>
                  Year: <strong style={{ color: "#262626", fontWeight: 600, marginLeft: "4px" }}>{data.manufactureYear || "N/A"}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Section - Stack on mobile */}
          <div 
            className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-md-between" 
            style={{ 
              paddingTop: "clamp(8px, 2vw, 10px)", 
              marginTop: "auto",
              borderTop: "1px solid #f0f0f0",
              gap: "12px"
            }}
          >
            <div>
              {data.category && (
                <Tag 
                  color="gold" 
                  style={{
                    borderRadius: "6px",
                    padding: "clamp(3px, 0.8vw, 4px) clamp(10px, 2.5vw, 12px)",
                    fontSize: "clamp(11px, 2.5vw, 12px)",
                    fontWeight: 600,
                    border: "none",
                    background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                    color: "#8b6914"
                  }}
                >
                  {data.category}
                </Tag>
              )}
            </div>
            <div className={styles.equipmentCardButtonWrapper}>
              <button
                className={`C-button is-link p-0 small bold ${styles.equipmentCardButton}`}
                onClick={() => router.push(`${ROUTES?.PUBLIC?.EQUIPMENT}/${data.id}`)}
                style={{
                  fontSize: "clamp(13px, 3vw, 14px)",
                  fontWeight: 600,
                  padding: "clamp(5px, 1.2vw, 6px) clamp(10px, 2.5vw, 12px)",
                  transition: "all 0.2s ease",
                  borderRadius: "6px",
                  background: "transparent",
                  border: "none",
                  color: "#1890ff",
                  width: "100%",
                  textAlign: "left"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#40a9ff";
                  e.currentTarget.style.background = "#e6f7ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#1890ff";
                  e.currentTarget.style.background = "transparent";
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.color = "#40a9ff";
                  e.currentTarget.style.background = "#e6f7ff";
                }}
                onTouchEnd={(e) => {
                  setTimeout(() => {
                    e.currentTarget.style.color = "#1890ff";
                    e.currentTarget.style.background = "transparent";
                  }, 150);
                }}
              >
                View Details <span style={{ display: "inline-block", marginLeft: "4px" }}>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
