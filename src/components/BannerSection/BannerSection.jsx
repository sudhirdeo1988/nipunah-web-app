import React from "react";
import "./BannerSection.scss";
import { Input, Select } from "antd";
import { map as _map } from "lodash-es";
import Icon from "../Icon";
import CountryDetails from "@/utilities/CountryDetails.json";

const BannerSection = () => {
  return (
    <section className="c-topBanner">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="hero-content text-center">
              <div className="w-75 mx-auto">
                <h1 className="color-dark dont-break extraBold gradient-text">
                  List. Connect. Grow
                </h1>
                <p className="C-heading size-6 mb-3 dont-break ">
                  Be seen by the right people. Expand your reach. <br /> Build
                  trusted global partnerships.
                </p>

                <div className="searchContainer gradient-wrapper row align-items-center">
                  <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                    <Input
                      size="large"
                      placeholder="Search"
                      prefix={<Icon name="search" />}
                      className="searchInput"
                    />
                  </div>
                  <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                    <Select
                      placeholder="Select Category"
                      variant="borderless"
                      options={[
                        { value: "Companies", label: "Companies" },
                        { value: "Equipments", label: "Equipments" },
                        { value: "Experts", label: "Experts" },
                      ]}
                      className="selectInSearch"
                      defaultValue={"Companies"}
                      suffixIcon={<Icon name="keyboard_arrow_down" />}
                    />
                  </div>
                  <div className="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                    <Select
                      showSearch
                      optionFilterProp="label"
                      placeholder="Select Country"
                      variant="borderless"
                      options={_map(CountryDetails, (country) => {
                        return {
                          value: country?.countryName,
                          label: country?.countryName,
                        };
                      })}
                      suffixIcon={<Icon name="keyboard_arrow_down" />}
                      className="selectInSearch"
                      defaultValue={"India"}
                    />
                  </div>
                  <div className="col-lg-2 col-md-2 col-sm-6 col-xs-12 text-center">
                    <button className="C-button is-filled large">Search</button>
                  </div>
                </div>

                <p className="C-heading size-6 color-dark mb-0 bold dont-break ">
                  Join Nipunah.com — grow your maritime network, the smart way.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
