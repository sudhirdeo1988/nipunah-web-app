"use client";

import React from "react";
import PropTypes from "prop-types";
import { Image } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Icon from "@/components/Icon";
import "./PublicDetailsProfile.scss";

function ProfileImage({ imageUrl, imageAlt, placeholderIcon, imageVariant }) {
  const isCircle = imageVariant === "circle";

  if (imageUrl) {
    return (
      <div
        className={`publicDetailsProfile__avatar ${
          isCircle ? "" : "publicDetailsProfile__avatar--square"
        }`}
      >
        {isCircle ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            className="publicDetailsProfile__avatarImg"
            preview={false}
          />
        ) : (
          <img
            src={imageUrl}
            alt={imageAlt}
            className="publicDetailsProfile__avatarImg"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`publicDetailsProfile__avatar publicDetailsProfile__avatar--placeholder ${
        isCircle ? "" : "publicDetailsProfile__avatar--square"
      }`}
      aria-label={`${imageAlt} placeholder`}
    >
      <Icon name={placeholderIcon} isFilled color="#94a3b8" size="large" />
    </div>
  );
}

ProfileImage.propTypes = {
  imageUrl: PropTypes.string,
  imageAlt: PropTypes.string,
  placeholderIcon: PropTypes.string,
  imageVariant: PropTypes.oneOf(["circle", "square"]),
};

export default function PublicDetailsProfile({
  backLink,
  imageUrl,
  imageAlt = "Profile",
  placeholderIcon = "person",
  imageVariant = "circle",
  name,
  subtitle,
  metaItems = [],
  children,
  sidebar,
  showSidebar = true,
  embedded = false,
}) {
  return (
    <div
      className={`publicDetailsProfile${embedded ? " publicDetailsProfile--embedded" : ""}`}
    >
      <header className="publicDetailsProfile__banner">
        <div className="publicDetailsProfile__bannerOverlay" aria-hidden />
        <div className="container publicDetailsProfile__bannerInner">
          {backLink ? (
            <div className="publicDetailsProfile__bannerBack">
              {backLink.href ? (
                <a href={backLink.href} className="publicDetailsProfile__backLink">
                  <ArrowLeftOutlined />
                  <span>{backLink.label}</span>
                </a>
              ) : (
                <button
                  type="button"
                  className="publicDetailsProfile__backLink"
                  onClick={backLink.onClick}
                >
                  <ArrowLeftOutlined />
                  <span>{backLink.label}</span>
                </button>
              )}
            </div>
          ) : null}

          <div className="publicDetailsProfile__bannerProfile">
            <ProfileImage
              imageUrl={imageUrl}
              imageAlt={imageAlt}
              placeholderIcon={placeholderIcon}
              imageVariant={imageVariant}
            />
            <div className="publicDetailsProfile__bannerText">
              <h1 className="publicDetailsProfile__bannerName">{name}</h1>
              {subtitle ? (
                <p className="publicDetailsProfile__bannerRole">{subtitle}</p>
              ) : null}
              {metaItems.length ? (
                <div className="publicDetailsProfile__bannerMeta">
                  {metaItems.map((item, index) => (
                    <React.Fragment key={`${item.label || item.icon}-${item.text}-${index}`}>
                      {index > 0 ? (
                        <span className="publicDetailsProfile__bannerMetaDivider" aria-hidden>
                          |
                        </span>
                      ) : null}
                      <span className="publicDetailsProfile__bannerMetaItem">
                        {item.icon ? (
                          <Icon
                            name={item.icon}
                            color="rgba(255,255,255,0.85)"
                            size="small"
                          />
                        ) : null}
                        {item.label ? (
                          <>
                            <span className="publicDetailsProfile__bannerMetaLabel">
                              {item.label}:
                            </span>
                            <span>{item.text}</span>
                          </>
                        ) : (
                          item.text
                        )}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="publicDetailsProfile__body">
        <div className="container">
          <div className="row g-4 g-xl-5">
            <div className={`col-12 ${showSidebar && sidebar ? "col-lg-8" : "col-lg-12"}`}>
              {children}
            </div>
            {showSidebar && sidebar ? (
              <div className="col-lg-4 col-12">{sidebar}</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

PublicDetailsProfile.propTypes = {
  backLink: PropTypes.shape({
    label: PropTypes.string.isRequired,
    href: PropTypes.string,
    onClick: PropTypes.func,
  }),
  imageUrl: PropTypes.string,
  imageAlt: PropTypes.string,
  placeholderIcon: PropTypes.string,
  imageVariant: PropTypes.oneOf(["circle", "square"]),
  name: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  metaItems: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      label: PropTypes.string,
      text: PropTypes.string,
    })
  ),
  children: PropTypes.node,
  sidebar: PropTypes.node,
  showSidebar: PropTypes.bool,
  embedded: PropTypes.bool,
};
