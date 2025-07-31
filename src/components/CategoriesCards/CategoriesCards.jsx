import React from "react";
import { Carousel } from "antd";
import { map as _map } from "lodash-es";
import "./CategoriesCards.scss";

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
      "Environmental Impact Assessment (EIA) Consultants",
    ],
  },
  {
    title: "Ship building & Marine Engineering",
    id: 3,
    list: [
      "Shipbuilders & Shipyards",
      "Marine Equipment & Engine Manufacturers",
      "Dry Docking & Ship Repair Services",
      "Naval Architecture & Marine Engineering Consultants",
    ],
  },
  {
    title: "Navigation & Communication",
    id: 4,
    list: [
      "Navigation Systems (GPS, ECDIS, Radar, AIS, etc.)",
      "Communication Systems (VHF, GMDSS, INMARSAT)",
      "Public Address & Alarm Systems (PA/GA)",
      "Condition Monitoring Systems",
    ],
  },
  {
    title: "Regulatory, Compliance & Safety",
    id: 5,
    list: [
      "Maritime Regulatory Bodies (IMO, Flag States)",
      "Classification Societies",
      "Safety & Emergency Equipment Suppliers",
      "Survey & Inspection Services",
    ],
  },
  {
    title: "Education, Training & Research",
    id: 6,
    list: [
      "Maritime Training Institutes & Academies",
      "Marine Simulation Centers",
      "R&D Organizations in Marine & Ocean Engineering",
      "Books, Journals & Technical Publications",
    ],
  },
];

const CategoriesCards = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 920,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 760,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 560,
        settings: {
          slidesToShow: 1,
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

  return (
    <section className="c-cardsWrapper section-padding">
      <div className="shape">
        <img
          className="shape-1"
          src={"assets/images/shape-5-black.png"}
          alt=""
        />
        <img className="shape-2" src={"assets/images/shape-12.png"} alt="" />
      </div>
      <div className="container">
        <div className="section-title text-center mb-3">
          <div className="sub-title">
            <span>CATEGORIES</span>
          </div>
          <h2 className="C-heading size-4 extraBold color-dark">
            Explore by Category
          </h2>
        </div>

        <div className="blog-inner">
          <Carousel {...settings}>
            {_map(data, (item) => {
              return (
                <div className="C-card" key={item?.id}>
                  <div className="image mb-2">
                    <img src="https://placehold.co/220x140" alt="" />
                  </div>
                  <h3 className="C-heading size-5 extraBold color-dark mb-3 dont-break font-family-primary">
                    {item?.title}
                  </h3>
                  <ul>
                    {_map(item?.list, (listItem, listIndex) => {
                      return (
                        <li key={listIndex}>
                          <span className="C-heading size-xs mb-0 dont-break">
                            {listItem}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <button className="C-button is-link p-0 small bold mt-3">
                    Read More
                  </button>
                </div>
              );
            })}
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default CategoriesCards;
