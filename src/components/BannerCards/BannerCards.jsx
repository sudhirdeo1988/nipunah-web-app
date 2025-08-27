import React from "react";
import Icon from "components/Icon/Icon";
import { map as _map, take as _take } from "lodash-es";
import "./BannerCards.scss";

const BannerCards = () => {
  const data = [
    {
      id: 1,
      title: "Global Maritime Visibility",
      subTitle:
        "Join the fastest-growing digital network for marine suppliers, contractors, and consultants worldwide.",
      icon: "globe",
    },
    {
      id: 2,
      title: "Showcase Your Expertise",
      subTitle:
        "Highlight services, certifications, past projects, equipment, products, and business strengths effectively.",
      icon: "verified_user",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
    {
      id: 3,
      title: "Build Brand Trust",
      subTitle:
        "Verified badges and client reviews boost your credibility and promote secure partnerships.",
      icon: "mimo",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
    {
      id: 4,
      title: "Generate Quality Leads",
      subTitle:
        "Receive direct inquiries and collaboration offers from global maritime clients and partners.",
      icon: "settings",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
    {
      id: 5,
      title: "Complete Industry Coverage",
      subTitle:
        "Connect with all maritime sectors—from shipbuilding to tourism—on one comprehensive platform.",
      icon: "settings",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
    {
      id: 6,
      title: "Smart Search Filters",
      subTitle:
        "Let buyers find you easily by service type, sector, or global location.",
      icon: "settings",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
  ];

  return (
    <section className="c-bannerCards">
      <div className="row align-items-stretch grid-border border-bottom border-f5">
        {_map(data, (item, index) => {
          return (
            <div
              className={`col-lg-4 col-sm-6 col-xs-12 col-padding  ${
                index % 2 !== 0 ? "bg-l" : "bg-d"
              }`}
              key={index}
            >
              <div className="d-flex flex-column gap-3 single-card-item">
                <div className="logo">
                  <Icon name={item?.icon || "mimo"} />
                </div>
                <div className="C-heading size-6 bold color-dark mb-0">
                  {item?.title}
                </div>
                <div className="C-heading size-6 mb-0 info">
                  {item?.subTitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BannerCards;
