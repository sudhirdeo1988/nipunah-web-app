import React from "react";
import Icon from "components/Icon/Icon";
import { map as _map, take as _take } from "lodash-es";
import "./BannerCards.scss";

const BannerCards = () => {
  const data = [
    {
      id: 1,
      title: "Join Global Network",
      subTitle:
        "Connect with verified maritime buyers, suppliers, and service providers across international markets.",
      icon: "public",
    },
    {
      id: 2,
      title: "Build Business Profile",
      subTitle:
        "Present your services, certifications, projects, equipment, and product capabilities in one detailed profile.",
      icon: "person_raised_hand",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
    {
      id: 3,
      title: "Validate Your Credibility",
      subTitle:
        "Strengthen trust with verification badges, compliance details, and genuine client reviews.",
      icon: "handshake",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
    {
      id: 4,
      title: "Generate Quality Leads",
      subTitle:
        "Get direct inquiries and partnership requests from maritime clients searching for reliable suppliers and service providers.",
      icon: "approval_delegation",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
    {
      id: 5,
      title: "Industry-Wide Access",
      subTitle:
        "Explore and engage with all maritime sectors—including shipbuilding, offshore, ports, logistics, safety, tourism, and more—on one platform.",
      icon: "encrypted_add_circle",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
    {
      id: 6,
      title: "Smart Search Filters",
      subTitle:
        "Let buyers find you quickly using targeted filters by service, sector, certification, or location.",
      icon: "search_check_2",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
  ];

  return (
    <section className="c-bannerCards section-padding small pt-0">
      <div className="container">
        <div className="row g-1">
          {_map(data, (item, index) => {
            return (
              <div className={`col-lg-4 col-sm-6 col-xs-12 h-100`} key={index}>
                <div
                  className="shadow-sm p-4 bg-white rounded text-center"
                  key={index}
                >
                  <div className="image-with-pattern">
                    <Icon name={item?.icon || "mimo"} />
                  </div>
                  <div className="C-heading size-5 semiBold color-dark mb-2 font-family-creative">
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
      </div>
    </section>
  );
};

export default BannerCards;
