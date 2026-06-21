"use client";

import React from "react";
import PropTypes from "prop-types";
import { Card, Divider, Space, Typography } from "antd";

const { Text } = Typography;

export function PublicDetailsInfoRow({ label, children }) {
  return (
    <div className="publicDetailsProfile__infoRow">
      <Text className="publicDetailsProfile__infoLabel">{label}</Text>
      <div className="publicDetailsProfile__infoValue">{children ?? "—"}</div>
    </div>
  );
}

PublicDetailsInfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export function PublicDetailsSocialLinks({ socialMedia = {} }) {
  const items = [
    { key: "linkedin", icon: "bi-linkedin", url: socialMedia.linkedin },
    { key: "facebook", icon: "bi-facebook", url: socialMedia.facebook },
    { key: "instagram", icon: "bi-instagram", url: socialMedia.instagram },
    { key: "twitter", icon: "bi-twitter-x", url: socialMedia.twitter || socialMedia.x },
  ].filter((item) => item.url);

  if (!items.length) return null;

  return (
    <>
      <Divider className="publicDetailsProfile__sidebarDivider" />
      <Text className="publicDetailsProfile__infoLabel publicDetailsProfile__infoLabel--block">
        Social
      </Text>
      <Space size={8} className="publicDetailsProfile__social">
        {items.map((item) => (
          <a
            key={item.key}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.key}
          >
            <i className={`bi ${item.icon}`} />
          </a>
        ))}
      </Space>
    </>
  );
}

PublicDetailsSocialLinks.propTypes = {
  socialMedia: PropTypes.object,
};

export default function PublicDetailsSidebar({
  title = "Contact & details",
  children,
  socialMedia,
  action,
}) {
  return (
    <aside className="publicDetailsProfile__sidebar">
      <Card className="publicDetailsProfile__sidebarCard" bordered={false}>
        <Typography.Title level={5} className="publicDetailsProfile__sidebarHeading">
          {title}
        </Typography.Title>
        <Divider className="publicDetailsProfile__sidebarDivider" />

        <div className="publicDetailsProfile__sidebarDetails">{children}</div>

        {socialMedia ? <PublicDetailsSocialLinks socialMedia={socialMedia} /> : null}

        {action ? (
          <>
            <Divider className="publicDetailsProfile__sidebarDivider" />
            {action}
          </>
        ) : null}
      </Card>
    </aside>
  );
}

PublicDetailsSidebar.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  socialMedia: PropTypes.object,
  action: PropTypes.node,
};
