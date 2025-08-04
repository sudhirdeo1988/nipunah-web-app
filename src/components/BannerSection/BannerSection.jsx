import React from "react";
import "./BannerSection.scss";
import { Input } from "antd";
import Icon from "../Icon";

const BannerSection = () => {
  return (
    <section className="c-topBanner mx-xl-5">
      <div className="shape">
        <img className="shape-1" src="assets/img/world.png" alt="" />
      </div>
      <div className="hero-bg bg-cover"></div>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="hero-content pe-xl-3 text-center tp-play-up text-center">
              <div className="w-75 mx-auto">
                <h1 className="color-dark dont-break extraBold">
                  List. Connect. Grow
                </h1>
                <p className="C-heading size-6 semiBold color-dark mb-3 dont-break ">
                  Be seen by the right people. Expand your reach. Build trusted
                  global partnerships.
                </p>

                <p className="C-heading size-6 semiBold color-dark mb-3 dont-break ">
                  Nipunah.com is the world's first integrated digital platform
                  for the maritime and ocean economy — connecting shipowners,
                  dredging firms, ports, offshore service providers, and marine
                  tech companies.
                </p>

                <p className="C-heading size-5 bold color-dark mb-3 dont-break ">
                  Join Nipunah.com — grow your maritime network, the smart way.
                </p>
              </div>

              <div className="searchContainer">
                <Input
                  size="large"
                  placeholder="Search, compare, and connect with verified maritime companies."
                  prefix={<Icon name="search" />}
                  className="searchInput"
                />
              </div>
            </div>
          </div>
          <div className="col-12"></div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
