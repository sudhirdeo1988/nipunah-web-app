import React, { lazy, Suspense } from "react";
import { Avatar } from "antd";
import { map as _map } from "lodash-es";
import Icon from "../Icon";
import Image from "next/image";

import "./BannerSection.scss";

const SearchContainer = lazy(() => import("../SearchContainer"));

const BannerSection = () => {
  return (
    <section className="c-topBanner">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-sm-12 col-md-12 col-lg-8 col-xl-8">
            <div className="hero-content text-left">
              <h1 className="color-dark dont-break extraBold font-family-creative">
                List. Connect. Grow
              </h1>
              <p className="C-heading size-6 mb-3 dont-break ">
                Be seen by the right people. Expand your reach. <br /> Build
                trusted global partnerships.
              </p>

              <p className="C-heading size-6 color-dark mb-0 bold dont-break ">
                Join Nipunah.com — grow your maritime network, the smart way.
              </p>

              <Suspense fallback={<></>}>
                <SearchContainer />
              </Suspense>

              <span className="C-heading size-xs">
                <strong>Popular Searches:</strong>
                <button className="C-button is-link p-0 small color-light mx-1 underline">
                  Marine expert in india,
                </button>
                <button className="C-button is-link p-0 small color-light mx-1 underline">
                  Ship engineering equipments in India
                </button>
              </span>
            </div>
          </div>
          <div className="col-md-4 col-xl-4 d-lg-block d-none">
            <div className="bannerImage">
              <Image
                src="/assets/images/dummy-banner.jpg"
                alt="My Logo"
                width={180}
                height={60}
                className="img-fluid img-thumbnail rounded-5 shadow"
              />
              <div className="p-4 bg-white shadow-sm rounded content-1 text-center">
                <span className="C-heading size-xs bold color-dark mb-2">
                  10k+ Candidates
                </span>
                <Avatar.Group>
                  <Avatar style={{ backgroundColor: "#3cadc3" }} size={40}>
                    <Icon name="person" color="#ffffff" />
                  </Avatar>
                  <Avatar style={{ backgroundColor: "#3cadc3" }} size={40}>
                    <Icon name="person" color="#ffffff" />
                  </Avatar>
                  <Avatar style={{ backgroundColor: "#3cadc3" }} size={40}>
                    <Icon name="person" color="#ffffff" />
                  </Avatar>
                  <Avatar
                    style={{ backgroundColor: "#f9ab00" }}
                    icon={<Icon name="add" color="#ffffff" />}
                    size={40}
                  />
                </Avatar.Group>
              </div>
              <div className="p-4 bg-white shadow-sm rounded content-2 text-center">
                <span className="C-heading size-xs bold color-dark mb-2">
                  100+ Companies
                </span>
                <Avatar.Group shape="square">
                  <Avatar style={{ backgroundColor: "#3cadc3" }} size={40}>
                    <Icon
                      name="business_center"
                      isFilled
                      color="#ffffff"
                      size="small"
                    />
                  </Avatar>
                  <Avatar style={{ backgroundColor: "#3cadc3" }} size={40}>
                    <Icon
                      name="business_center"
                      isFilled
                      color="#ffffff"
                      size="small"
                    />
                  </Avatar>
                  <Avatar style={{ backgroundColor: "#3cadc3" }} size={40}>
                    <Icon
                      name="business_center"
                      isFilled
                      color="#ffffff"
                      size="small"
                    />
                  </Avatar>
                  <Avatar
                    style={{ backgroundColor: "#f9ab00" }}
                    icon={<Icon name="add" color="#ffffff" />}
                    size={40}
                  />
                </Avatar.Group>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
