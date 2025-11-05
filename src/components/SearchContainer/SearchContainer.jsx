import React, { useRef, useState, useEffect } from "react";
import CountryDetails from "@/utilities/CountryDetails.json";
import { Input, Select } from "antd";
import { map as _map } from "lodash-es";
import Icon from "../Icon";
import "./SearchContainer.scss";

const searchFieldOptions = [
  {
    type: "select",
    label: "",
    formFieldValue: "companyType",
    defaultValue: "",
    placeholder: "Select company type",
    options: [
      { value: "Companies", label: "Marine Engineering" },
      { value: "Equipments", label: "Marine Equipments" },
    ],
  },
  {
    type: "search",
    label: "",
    formFieldValue: "search",
    defaultValue: "",
    placeholder: "Search",
    icon: "",
  },
  {
    type: "countrySelect",
    label: "Select Location",
    icon: "",
    formFieldValue: "countrySelect",
    defaultValue: "",
    placeholder: "Select Location",
    options: _map(CountryDetails, (country) => {
      return {
        value: country?.countryName,
        label: country?.countryName,
      };
    }),
  },
];

const SearchContainer = (props) => {
  const {
    forListingPage,
    floatingEnable, // prop is to make it fixed on scroll
  } = props;

  const containerRef = useRef(null);
  const [isFixed, setIsFixed] = useState(false);
  const [fixedStyles, setFixedStyles] = useState({});
  const initialOffset = useRef(0);

  // Search
  const showSeatch = () => {
    return (
      <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12 p-3">
        <Input
          size="large"
          placeholder="Search"
          prefix={<Icon name="search" />}
          className="searchInput"
        />
      </div>
    );
  };

  useEffect(() => {
    if (floatingEnable) {
      let rect = {};
      let style = {};
      if (containerRef.current) {
        rect = containerRef.current.getBoundingClientRect();
        initialOffset.current = rect.top + window.scrollY - 72;

        // store width and left offset for fixed position
        style = {
          width: rect.width,
          left: rect.left,
        };
      }

      const handleScroll = () => {
        if (window.scrollY >= initialOffset.current) {
          setIsFixed(true);
          setFixedStyles(style);
        } else {
          setIsFixed(false);
          setFixedStyles({});
        }
      };

      window.addEventListener("scroll", handleScroll);
      handleScroll(); // trigger on mount

      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [floatingEnable]);

  return (
    <div
      className={`searchContainer row align-items-center shadow ${
        forListingPage ? "inListingPage" : ""
      } ${isFixed ? "fixed" : ""}`}
      ref={containerRef}
      style={fixedStyles}
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
          placeholder="Select Company Type"
          variant="borderless"
          options={[
            { value: "Companies", label: "Marine Engineering" },
            { value: "Equipments", label: "Marine Equipments" },
          ]}
          className="selectInSearch"
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
