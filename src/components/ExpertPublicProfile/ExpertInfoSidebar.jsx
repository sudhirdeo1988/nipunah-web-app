"use client";

import React, { useMemo } from "react";
import { Card, Divider, Space, Typography } from "antd";
import {
  formatExpertContact,
  formatMemberSince,
} from "@/utilities/expertPublicProfile";

const { Text } = Typography;

function InfoRow({ label, children }) {
  return (
    <div className="expertPublicProfile__infoRow">
      <Text className="expertPublicProfile__infoLabel">{label}</Text>
      <div className="expertPublicProfile__infoValue">{children ?? "—"}</div>
    </div>
  );
}

export default function ExpertInfoSidebar({ expert }) {
  const contact = useMemo(() => formatExpertContact(expert), [expert]);
  const memberSince = useMemo(
    () => formatMemberSince(expert?.createdOn ?? expert?.created_on),
    [expert]
  );

  const social = expert?.socialMedia ?? {};
  const hasSocial =
    social.facebook || social.linkedin || social.instagram || social.twitter;

  return (
    <aside className="expertPublicProfile__sidebar">
      <Card className="expertPublicProfile__sidebarCard" bordered={false}>
        <Typography.Title level={5} className="expertPublicProfile__sidebarHeading">
          Contact &amp; details
        </Typography.Title>
        <Divider className="expertPublicProfile__sidebarDivider" />

        <div className="expertPublicProfile__sidebarDetails">
          <InfoRow label="Email">
            {expert?.email ? (
              <a href={`mailto:${expert.email}`} className="expertPublicProfile__link">
                {expert.email}
              </a>
            ) : null}
          </InfoRow>
          <InfoRow label="Phone">{contact || null}</InfoRow>
          <InfoRow label="Member since">{memberSince || null}</InfoRow>
        </div>

        {hasSocial ? (
          <>
            <Divider className="expertPublicProfile__sidebarDivider" />
            <Text className="expertPublicProfile__infoLabel expertPublicProfile__infoLabel--block">
              Social
            </Text>
            <Space size={8} className="expertPublicProfile__social">
              {social.linkedin ? (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <i className="bi bi-linkedin" />
                </a>
              ) : null}
              {social.facebook ? (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <i className="bi bi-facebook" />
                </a>
              ) : null}
              {social.instagram ? (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <i className="bi bi-instagram" />
                </a>
              ) : null}
              {social.twitter ? (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <i className="bi bi-twitter-x" />
                </a>
              ) : null}
            </Space>
          </>
        ) : null}
      </Card>
    </aside>
  );
}
