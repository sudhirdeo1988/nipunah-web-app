"use client";
import React from "react";
import { Avatar, Space } from "antd";
import Icon from "../Icon";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import styles from "./ExpertCard.module.css";

dayjs.extend(relativeTime);

const ExpertCard = ({ data }) => {
  const router = useRouter();
  
  if (!data) {
    return null;
  }

  // Generate avatar URL using expert ID or name as seed
  const avatarSeed = data.id || data.name || Math.random().toString();
  const avatarUrl = `https://api.dicebear.com/7.x/miniavs/svg?seed=${avatarSeed}`;

  // Format location
  const locationParts = [];
  if (data.city && data.city !== "N/A") locationParts.push(data.city);
  if (data.state && data.state !== "N/A") locationParts.push(data.state);
  if (data.country && data.country !== "N/A") locationParts.push(data.country);
  const location = locationParts.length > 0 ? locationParts.join(", ") : "N/A";

  // Format expertise/role
  const expertise = data.expertise && data.expertise !== "N/A" ? data.expertise : "Expert";

  // Format date
  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    try {
      return dayjs(dateValue).fromNow();
    } catch {
      return "N/A";
    }
  };
  const timeAgo = formatDate(data.createdAt || data.createDate);

  // Get social media links
  const socialMedia = data.socialMedia || {};
  const facebookUrl = socialMedia.facebook;
  const linkedinUrl = socialMedia.linkedin;
  const twitterUrl = socialMedia.twitter;

  return (
    <div 
      className="bg-white shadow-sm rounded expert-card"
      style={{
        padding: "clamp(10px, 2.5vw, 16px)",
        borderTop: "3px solid #1890ff",
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
        <div className="col-12 col-md-2 mb-2 mb-md-0">
          <Avatar
            size={64}
            src={avatarUrl}
            className="border p-1"
            shape="square"
            style={{
              width: "clamp(50px, 12vw, 64px)",
              height: "clamp(50px, 12vw, 64px)",
            }}
          />
        </div>
        <div className="col-12 col-md-10 d-flex flex-column" style={{ minHeight: 0, paddingLeft: "0", flex: 1 }}>
          <div>
            <h3 
              className="C-heading size-5 mb-1 bold font-family-creative color-primary text-truncate"
              style={{
                fontSize: "clamp(16px, 4vw, 20px)",
                fontWeight: 700,
                lineHeight: "1.3",
                marginBottom: "clamp(6px, 1.5vw, 8px)",
              }}
            >
              {data.name || "Expert name"}
            </h3>

            <div 
              className="d-flex flex-column flex-md-row align-items-start align-items-md-center mb-2" 
              style={{ 
                marginBottom: "clamp(8px, 2vw, 12px)",
                gap: "clamp(8px, 2vw, 12px)"
              }}
            >
              <div>
                <Space size={4}>
                  <Icon name="account_circle" style={{ color: "#8c8c8c", fontSize: "clamp(16px, 4vw, 18px)", flexShrink: 0 }} />
                  <span className="C-heading size-xs color-light mb-0" style={{ fontSize: "clamp(12px, 3vw, 13px)", color: "#8c8c8c" }}>
                    {expertise}
                  </span>
                </Space>
              </div>
              <div>
                <Space size={4}>
                  <Icon name="nest_clock_farsight_analog" style={{ color: "#8c8c8c", fontSize: "clamp(16px, 4vw, 18px)", flexShrink: 0 }} />
                  <span className="C-heading size-xs color-light mb-0" style={{ fontSize: "clamp(12px, 3vw, 13px)", color: "#8c8c8c" }}>
                    {timeAgo}
                  </span>
                </Space>
              </div>
            </div>

            <div className="mb-2" style={{ marginBottom: "clamp(8px, 2vw, 12px)" }}>
              <Space size={4}>
                <Icon name="location_on" style={{ color: "#8c8c8c", fontSize: "clamp(16px, 4vw, 18px)", flexShrink: 0 }} />
                <span className="C-heading size-xs color-light mb-0" style={{ fontSize: "clamp(12px, 3vw, 13px)", color: "#8c8c8c" }}>
                  {location}
                </span>
              </Space>
            </div>
          </div>

          <div 
            className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-md-between mt-auto" 
            style={{ 
              paddingTop: "clamp(8px, 2vw, 10px)", 
              marginTop: "auto",
              borderTop: "1px solid #f0f0f0",
              gap: "12px"
            }}
          >
            <div>
              <div className="social-icon d-flex align-items-center">
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="C-settingButton is-clean small"
                  >
                    <i
                      className="bi bi-facebook"
                      style={{ color: "#1877F2" }}
                    ></i>
                  </a>
                )}
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="C-settingButton is-clean small"
                  >
                    <i
                      className="bi bi-linkedin"
                      style={{ color: "#0077B5" }}
                    ></i>
                  </a>
                )}
                {twitterUrl && (
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="C-settingButton is-clean small"
                  >
                    <i
                      className="bi bi-twitter"
                      style={{ color: "#000000" }}
                    ></i>
                  </a>
                )}
              </div>
            </div>
            <div className={styles.expertCardButtonWrapper}>
              <button
                className={`C-button is-link p-0 small bold ${styles.expertCardButton}`}
                onClick={() =>
                  router.push(`${ROUTES?.PUBLIC?.EXPERTS}/${data.id || ""}`)
                }
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
                View Profile <span style={{ display: "inline-block", marginLeft: "4px" }}>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertCard;
