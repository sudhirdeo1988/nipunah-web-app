import React from "react";
import { map as _map } from "lodash-es";
import "./CategoriesCards.scss";
import Icon from "../Icon";

const data = [
  {
    title: "Shipping",
    id: 1,
    icon: "local_shipping",
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
    icon: "forklift",
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
    icon: "directions_boat",
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
    icon: "explore",
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
    icon: "assured_workload",
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
    icon: "school",
    list: [
      "Maritime Training Institutes & Academies",
      "Marine Simulation Centers",
      "R&D Organizations in Marine & Ocean Engineering",
      "Books, Journals & Technical Publications",
    ],
  },
];

const CategoriesCards = () => {
  return (
    <section className="section-padding">
      <div className="container">
        <div className="section-title text-center mb-3">
          <div className="sub-title gradient-wrapper">
            <span>CATEGORIES</span>
          </div>
          <h2 className="C-heading size-4 extraBold gradient-text">
            Explore by Category
          </h2>
        </div>

        <div className="blog-inner">
          <div className="row openCardRow">
            {_map(data, (item) => {
              return (
                <div
                  className="col-xl-4 col-md-4 col-sm-2 col-xs-1 openCardCol"
                  key={item?.id}
                >
                  <div className="C-card">
                    <span className="cardCount">
                      <Icon name={item?.icon} isFilled />
                    </span>
                    <h3 className="C-heading size-6 bold color-dark mb-3">
                      {item?.title}
                    </h3>
                    <ul>
                      {_map(item?.list, (listItem, listIndex) => {
                        return (
                          <li key={listIndex}>
                            <span className="C-heading size-xs semiBold color-light mb-0 ">
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
                </div>
              );
            })}

            <div className="col-12 text-center mt-4">
              <button className="C-button is-filled">
                View all categories
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesCards;
