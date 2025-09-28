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
      icon: "public",
    },
    {
      id: 2,
      title: "Showcase Your Expertise",
      subTitle:
        "Highlight services, certifications, past projects, equipment, products, and business strengths effectively.",
      icon: "person_raised_hand",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
    {
      id: 3,
      title: "Build Brand Trust",
      subTitle:
        "Verified badges and client reviews boost your credibility and promote secure partnerships.",
      icon: "handshake",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
    {
      id: 4,
      title: "Generate Quality Leads",
      subTitle:
        "Receive direct inquiries and collaboration offers from global maritime clients and partners.",
      icon: "approval_delegation",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
    {
      id: 5,
      title: "Complete Industry Coverage",
      subTitle:
        "Connect with all maritime sectors—from shipbuilding to tourism—on one comprehensive platform.",
      icon: "encrypted_add_circle",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
    {
      id: 6,
      title: "Smart Search Filters",
      subTitle:
        "Let buyers find you easily by service type, sector, or global location.",
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
