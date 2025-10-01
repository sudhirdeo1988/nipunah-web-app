"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Collapse, Carousel } from "antd";
import Image from "next/image";
import {
  map as _map,
  find as _find,
  isEmpty as _isEmpty,
  flattenDeep,
} from "lodash-es";
import "./Partners.scss";
import Icon from "../Icon";

const { Panel } = Collapse;

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
    children: [
      {
        title: "Shipping 1",
        id: 1.1,
        list: ["Shipping 1-1", "Shipping 1-2", "Shipping 1-3", "Shipping 1-4"],
      },
      {
        title: "Shipping 2",
        id: 1.2,
        list: ["Shipping 2-1", "Shipping 2-2", "Shipping 2-3", "Shipping 2-4"],
      },
      {
        title: "Shipping 3",
        id: 1.3,
        list: ["Shipping 3-1", "Shipping 3-2", "Shipping 3-3", "Shipping 3-4"],
      },
    ],
  },
  {
    title: "Dredging",
    id: 2,
    list: [
      "Dredging Contractors",
      "Dredging Equipment Manufacturers",
      "Shipping 1-1",
      "Shipping 1-2",
    ],
  },
  {
    title: "Navigation & Communication",
    id: 4,
    list: [
      "Navigation Systems",
      "Communication Systems",
      "Shipping 1-1",
      "Shipping 1-2",
    ],
  },
];

// ✅ Reusable Marquee Slider
const MarqueeSlider = ({
  direction = "left",
  speed = 20,
  data = ["1", "1", "1", "1", "1", "1"],
}) => (
  <div className="marq-brand">
    <div
      className="slider-box"
      style={{
        animationDirection: direction === "left" ? "normal" : "reverse",
        animationDuration: `${speed}s`,
      }}
    >
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

const Partners = () => {
  const [activeCategory, setActiveCategory] = useState(null);

  // ✅ Flatten categories + children for quick lookup
  const flatCategories = useMemo(
    () => flattenDeep(data.map((d) => [d, ...(d.children || [])])),
    []
  );

  // ✅ Handle category selection (parent + child)
  const onSelectCategory = useCallback(
    (category) => {
      if (activeCategory?.id === category.id) return; // avoid unnecessary state updates
      setActiveCategory(category);
    },
    [activeCategory]
  );

  // ✅ Compute selected logos only when activeCategory changes
  const selectedCategory = useMemo(
    () => _find(flatCategories, { id: activeCategory?.id }),
    [activeCategory, flatCategories]
  );

  // ✅ Set default active (first category or first child if available)
  useEffect(() => {
    if (!_isEmpty(data)) setActiveCategory(data[0]);
  }, [data]);

  // ✅ Render logos for active category
  const renderLogos = useCallback(() => {
    if (!selectedCategory) return <p>Please select a category</p>;

    return (
      <div className="row g-3">
        {_map(selectedCategory.list, (item, idx) => (
          <div className="col-6 col-lg-4 col-xl-4" key={idx}>
            <div className="bg-white rounded shadow-sm text-center">
              <div className="py-4 border-bottom">
                <Image
                  src="/assets/images/logo.png"
                  alt={item}
                  width={150}
                  height={50}
                />
              </div>
              <p
                className="C-heading size-sm semiBold mb-0 dont-break p-3 font-family-creative"
                style={{ height: 80 }}
              >
                {item}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }, [selectedCategory]);

  return (
    <>
      <div className="section-padding background-gray-light dotted-map-bg">
        <div className="container">
          {/* ✅ Section Header */}
          <div className="section-title text-center mb-4">
            <div className="sub-title gradient-wrapper">
              <span>PARTNERS</span>
            </div>
            <h2 className="C-heading size-4 extraBold color-dark font-family-creative">
              Discover top maritime companies
            </h2>
          </div>

          {/* ✅ Sidebar + Content */}
          <div className="nestedAccordianTabs">
            <div className="row g-4">
              {/* ✅ Sidebar */}
              <div className="col-lg-3 col-md-4 col-sm-5 col-xs-12 p-2 bg-white rounded shadow-sm">
                {_map(data, (category) =>
                  !_isEmpty(category?.children) ? (
                    <Collapse
                      accordion
                      bordered={false}
                      key={category.id}
                      expandIconPosition="end"
                      className={`${
                        activeCategory?.id === category.id ? "active" : ""
                      }`}
                      expandIcon={({ isActive }) => (
                        <Icon
                          name={isActive ? "arrow_drop_down" : "arrow_right"}
                        />
                      )}
                    >
                      <Panel
                        key={category.id}
                        header={
                          <div
                            className={`C-heading size-6 color-dark font-family-creative mb-0 dont-break ${
                              activeCategory?.id === category.id ? "active" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCategory(category);
                            }}
                          >
                            {category.title}
                          </div>
                        }
                      >
                        {_map(category.children, (child) => (
                          <button
                            className={`navButton ${
                              activeCategory?.id === child.id ? "active" : ""
                            }`}
                            onClick={() => onSelectCategory(child)}
                            key={child.id}
                          >
                            <span
                              className={`C-heading size-xs color-dark font-family-creative mb-0 dont-break ps-2`}
                            >
                              {child.title}
                            </span>
                          </button>
                        ))}
                      </Panel>
                    </Collapse>
                  ) : (
                    <button
                      key={category.id}
                      onClick={() => onSelectCategory(category)}
                      className={`navButton ${
                        activeCategory?.id === category.id ? "active" : ""
                      }`}
                    >
                      <span className="C-heading size-6 color-dark font-family-creative mb-0 dont-break">
                        {category.title}
                      </span>
                    </button>
                  )
                )}
              </div>

              {/* ✅ Content */}
              <div className="col-lg-9 col-md-8 col-sm-7 col-xs-12">
                {renderLogos()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-padding small bg-white shadow-sm">
        <div className="container">
          {/* ✅ Section Header */}
          <div className="section-title text-center mb-4">
            <h2 className="C-heading size-4 extraBold color-dark font-family-creative">
              Recently Onboarded Companies
            </h2>
          </div>
          <div className="py-4">
            <Carousel autoplay infinite slidesPerRow={5} dots={false} swipe>
              <div>
                <Image
                  src={`/assets/images/logo.png`}
                  alt="My Logo"
                  width={140}
                  height={40}
                />
              </div>
              <div>
                <Image
                  src={`/assets/images/logo.png`}
                  alt="My Logo"
                  width={140}
                  height={40}
                />
              </div>
              <div>
                <Image
                  src={`/assets/images/logo.png`}
                  alt="My Logo"
                  width={140}
                  height={40}
                />
              </div>
              <div>
                <Image
                  src={`/assets/images/logo.png`}
                  alt="My Logo"
                  width={140}
                  height={40}
                />
              </div>
              <div>
                <Image
                  src={`/assets/images/logo.png`}
                  alt="My Logo"
                  width={140}
                  height={40}
                />
              </div>
            </Carousel>
          </div>
        </div>
      </div>

      {/* <div className="section-padding ">
        <div className="container">
          <Divider>
            <span className="C-heading size-5 extraBold">
              Newly Onboarded Companies
            </span>
          </Divider>
          <div className="mb-2">
            <MarqueeSlider direction="left" speed={35} />
          </div>
          <MarqueeSlider direction="right" speed={35} />
        </div>
      </div> */}
    </>
  );
};

export default Partners;
