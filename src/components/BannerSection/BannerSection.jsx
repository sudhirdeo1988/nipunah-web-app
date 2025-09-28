import React from "react";
import "./BannerSection.scss";
import { Input, Select, Avatar } from "antd";

import { map as _map } from "lodash-es";
import Icon from "../Icon";
import CountryDetails from "@/utilities/CountryDetails.json";
import Image from "next/image";

const BannerSection = () => {
  return (
    <section className="c-topBanner">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-sm-12 col-md-8 col-xl-8">
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

              <div className="searchContainer row align-items-center">
                <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12 p-3">
                  <Input
                    size="large"
                    placeholder="Search"
                    prefix={<Icon name="search" />}
                    className="searchInput"
                  />
                </div>
                <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12 p-3">
                  <Select
                    placeholder="Select Section"
                    variant="borderless"
                    options={[
                      { value: "Companies", label: "Companies" },
                      { value: "Equipments", label: "Equipments" },
                      { value: "Experts", label: "Experts" },
                    ]}
                    className="selectInSearch"
                    // defaultValue={"Companies"}
                    suffixIcon={<Icon name="keyboard_arrow_down" />}
                    prefix={<Icon name="apps" />}
                  />
                </div>
                <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12 p-3">
                  <Select
                    showSearch
                    optionFilterProp="label"
                    placeholder="All locations"
                    variant="borderless"
                    options={_map(CountryDetails, (country) => {
                      return {
                        value: country?.countryName,
                        label: country?.countryName,
                      };
                    })}
                    suffixIcon={<Icon name="keyboard_arrow_down" />}
                    prefix={<Icon name="location_on" />}
                    className="selectInSearch"
                    // defaultValue={"India"}
                  />
                </div>
                <div className="col-lg-2 col-md-2 col-sm-6 col-xs-12 text-center">
                  <button className="C-button is-filled w-100 p-3">
                    Search
                  </button>
                </div>
              </div>

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
          <div className="col-sm-12 col-md-4 col-xl-4">
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
