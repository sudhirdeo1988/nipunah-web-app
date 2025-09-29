import React from "react";
import "./SearchContainer.scss";
import CountryDetails from "@/utilities/CountryDetails.json";
import { Input, Select } from "antd";
import { map as _map } from "lodash-es";
import Icon from "../Icon";

const SearchContainer = (props) => {
  const { forListingPage } = props;
  return (
    <div
      className={`searchContainer row align-items-center shadow ${
        forListingPage ? "inListingPage" : ""
      }`}
    >
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
        <button className="C-button is-filled w-100 p-3">Search</button>
      </div>
    </div>
  );
};

export default SearchContainer;
