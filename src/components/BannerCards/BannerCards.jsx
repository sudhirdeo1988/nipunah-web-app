import React from "react";
import Icon from "components/Icon/Icon";
import { Space, Carousel } from "antd";
import { map as _map, take as _take } from "lodash-es";
import "./BannerCards.scss";

const BannerCards = () => {
  const data = [
    {
      id: 1,
      title: "Global Visibility for Maritime Services",
      subTitle:
        "Join the fastest-growing digital network for marine contractors, consultants, and suppliers. Increase your reach and unlock opportunities across the globe.",
      icon: "globe",
    },
    {
      id: 2,
      title: "Verified & Trusted Industry Listings",
      subTitle:
        " Every profile is vetted for authenticity to ensure secure, professional collaborations.",
      icon: "verified_user",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
    {
      id: 3,
      title: "Digitizing Marine Procurement & Collaboration",
      subTitle:
        "Streamline sourcing, reduce costs, and boost transparency in service discovery and procurement.",
      icon: "mimo",
      // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
    },
    {
      id: 4,
      title: "A Hub for All Maritime Sectors",
      subTitle:
        "From dredging and shipbuilding to offshore energy and marine tourism — we connect every link in the maritime value chain.",
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
                <h4 className="C-heading size-5 dont-break is- mgb-0 color-dark font-family-primary">
                  {item?.title}
                </h4>
                <p className="C-heading size-6 dont-break is-animated mb-3 font-family-primary">
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
