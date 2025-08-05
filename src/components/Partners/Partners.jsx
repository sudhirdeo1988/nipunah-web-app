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

const Partners = () => {
  // Render title
  const renderLabel = (title) => {
    return (
      <div className="row g-0" key={title}>
        <div className="col-2">
          <Icon name="dataset" color="#87b2df" />
        </div>
        <div className="col-10">
          <span className="C-heading size-xs bold color-dark font-family-primary mb-0 dont-break">
            {title}
          </span>
        </div>
      </div>
    );
  };

  // Render Partners
  const renderLogoes = (title) => {
    return (
      <div className="row g-4">
        {_map(
          _find(data, (item) => item.title === title)?.list,
          (item, index) => (
            <div className="col-6 col-lg-4 col-xl-3" key={index}>
              <div className="brand-logo">
                <div className="logo">
                  <Image
                    src="/assets/images/01.png"
                    alt={item}
                    width={200}
                    height={60}
                  />
                </div>
                <p
                  className="C-heading size-xs extraBold color-dark mb-0 dont-break"
                  style={{ height: "60px" }}
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
        <div className="section-title mb-4 text-center">
          <div className="sub-title">
            <span>PARTNERS</span>
          </div>
          <h2 className="C-heading size-4 extraBold color-dark">
            Discover Top Maritime Services and Equipment
          </h2>
        </div>
        <div className="mt-4 pt-3 mb-5">
          <Tabs
            tabPosition={"left"}
            items={data.map((category) => {
              return {
                label: renderLabel(category?.title),
                key: category?.id,
                children: renderLogoes(category?.title),
              };
            })}
            className="brand-tabs"
            style={{ height: "auto", maxHeight: "400px" }}
          />
        </div>

        {/* Logo slider */}
        <Divider>
          <span className="C-heading size-5 extraBold color-dark font-family-primary">
            Newly Onboarded Companies
          </span>
        </Divider>
        <Carousel {...settings} className="swiper-wrapper">
          <div className="brand-logo-slider">
            <Image
              src="/assets/images/01.png"
              alt="My Logo"
              width={200}
              height={60}
            />
          </div>

          <div className="brand-logo-slider">
            <Image
              src="/assets/images/01.png"
              alt="My Logo"
              width={200}
              height={60}
            />
          </div>

          <div className="brand-logo-slider">
            <Image
              src="/assets/images/01.png"
              alt="My Logo"
              width={200}
              height={60}
            />
          </div>

          <div className="brand-logo-slider">
            <Image
              src="/assets/images/01.png"
              alt="My Logo"
              width={200}
              height={60}
            />
          </div>

          <div className="brand-logo-slider">
            <Image
              src="/assets/images/01.png"
              alt="My Logo"
              width={200}
              height={60}
            />
          </div>

          <div className="brand-logo-slider">
            <Image
              src="/assets/images/01.png"
              alt="My Logo"
              width={200}
              height={60}
            />
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default Partners;
