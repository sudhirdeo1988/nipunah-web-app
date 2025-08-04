import React from "react";
import Icon from "components/Icon/Icon";
import { Space, Carousel } from "antd";
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
    {
      id: 7,
      title: "Digital Procurement Tools",
      subTitle:
        "Simplify sourcing, reduce procurement time, and boost efficiency across all maritime transactions.",
      icon: "settings",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
    {
      id: 8,
      title: "Sustainable Growth Engine",
      subTitle:
        "Expand your digital presence and partnerships while contributing to a greener maritime future.",
      icon: "settings",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    slidesToShow: 4,
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
    <section className="c-bannerCards">
      <div className="container">
        <Carousel {...settings}>
          {_map(data, (item, index) => {
            return (
              <div className="single-feature-item" key={index}>
                <div className="icon">
                  <Icon name={item?.icon || "mimo"} />
                </div>
                <h4 className="C-heading size-6 dont-break is- mgb-0 color-dark font-family-primary">
                  {item?.title}
                </h4>
                <p className="C-heading size-xs dont-break is-animated mb-3 font-family-primary">
                  {item?.subTitle}
                </p>
                <div className="d-flex flex-column gap-3">
                  {_map(_take(item?.list, 3), (word, index) => {
                    return (
                      <Space size={6} key={index}>
                        <Icon
                          name="check_circle"
                          className="checkIcon"
                          isFilled
                        />
                        <span className="C-heading size-xs bold mgb-0">
                          {word}
                        </span>
                      </Space>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
};

export default BannerCards;
