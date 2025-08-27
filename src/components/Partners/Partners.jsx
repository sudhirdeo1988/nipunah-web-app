"use client";
import React from "react";
import { Tabs, Divider, Carousel } from "antd";
import Image from "next/image";
import Icon from "../Icon";
import { map as _map, find as _find } from "lodash-es";
import "./Partners.scss";

const data = [
  {
    title: "Shipping",
    id: 1,
    list: [
      "Shipping Companies / Vessel Operators",
      "Ship Management Companies",
      "Crew Management & Manning Agencies",
      "Port Authorities & Terminal Operators",
    ],
  },
  {
    title: "Dredging",
    id: 2,
    list: [
      "Dredging Contractors",
      "Dredging Equipment Manufacturers",
      "Dredging Software & Hardware Packages",
      "Environmental Impact Assessment",
    ],
  },
  {
    title: "Ship building & Marine Engineering",
    id: 3,
    list: [
      "Shipbuilders & Shipyards",
      "Marine Equipment & Engine Manufacturers",
      "Dry Docking & Ship Repair Services",
      "Naval Architecture & Marine Engineering",
    ],
  },
  {
    title: "Navigation & Communication",
    id: 4,
    list: [
      "Navigation Systems",
      "Communication Systems",
      "Public Address & Alarm Systems",
      "Condition Monitoring Systems",
    ],
  },
  {
    title: "Regulatory, Compliance & Safety",
    id: 5,
    list: [
      "Maritime Regulatory Bodies",
      "Classification Societies",
      "Safety & Emergency Equipment",
      "Survey & Inspection Services",
    ],
  },
  {
    title: "Education, Training & Research",
    id: 6,
    list: [
      "Maritime Training Institutes",
      "Marine Simulation Centers",
      "R&D Organizations in Marine",
      "Books, Journals & Technical",
    ],
  },
];

// Slider Settings
const settings = {
  dots: false,
  infinite: true,
  speed: 500,
  autoplay: true,
  slidesToShow: 5,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 4,
      },
    },
    {
      breakpoint: 920,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
};

// Slider Element
const MarqueeSlider = ({
  direction = "left",
  speed = 20,
  data = ["1", "1", "1", "1", "1", "1"],
}) => {
  return (
    <div className="marq-brand">
      <div
        className="slider-box"
        style={{
          animationDirection: direction === "left" ? "normal" : "reverse",
          animationDuration: `${speed}s`,
        }}
      >
        {/* repeat items twice for seamless loop */}
        {_map(data.concat(data), (item, idx) => (
          <div className="slider-box-item" key={idx}>
            <Image
              src={`/assets/images/0${item}.png`}
              alt="My Logo"
              width={140}
              height={40}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const Partners = () => {
  // Render title
  const renderLabel = (title) => {
    return (
      <span
        className="C-heading size-xs semiBold color-dark font-family-primary mb-0 dont-break"
        key={title}
      >
        {title}
      </span>
    );
  };

  // Render Partners
  const renderLogoes = (title) => {
    return (
      <div className="row g-0">
        {_map(
          _find(data, (item) => item.title === title)?.list,
          (item, index) => (
            <div className="col-6 col-lg-4 col-xl-4" key={index}>
              <div className="brand-logo">
                <div className="logo">
                  <Image
                    src="/assets/images/01.png"
                    alt={item}
                    width={160}
                    height={40}
                  />
                </div>
                <p
                  className="C-heading size-6 font-family-primary semiBold mb-0 dont-break"
                  style={{ height: "40px" }}
                >
                  {item}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div className="C-partners section-padding pb-0">
      <div className="container">
        <div className="section-title text-center mb-3">
          <div className="sub-title gradient-wrapper">
            <span>PARTNERS</span>
          </div>
          <h2 className="C-heading size-4 extraBold gradient-text">
            Discover Top Maritime Services and Equipment
          </h2>
        </div>
        <div className="mt-4 pt-3 mb-5">
          <Tabs
            tabPosition={"left"}
            items={_map(data, (category) => {
              return {
                label: renderLabel(category?.title),
                key: category?.id,
                children: renderLogoes(category?.title),
              };
            })}
            className="brand-tabs"
          />
        </div>

        {/* Logo slider */}
        <Divider>
          <span className="C-heading size-5 extraBold color-dark font-family-primary">
            Newly Onboarded Companies
          </span>
        </Divider>
      </div>

      <div className="mb-2">
        <MarqueeSlider direction="left" speed={35} />
      </div>
      <MarqueeSlider direction="right" speed={35} />
    </div>
  );
};

export default Partners;
