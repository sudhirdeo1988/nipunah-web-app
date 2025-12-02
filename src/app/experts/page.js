"use client";

import React, { useState } from "react";
import { Tag, Space, Drawer } from "antd";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import CardListing from "@/components/CardListing";
import ExpertCard from "@/components/ExpertCard";
import { map as _map } from "lodash-es";
import SearchContainer from "@/components/SearchContainer";
import CountryDetails from "@/utilities/CountryDetails.json";
import Icon from "@/components/Icon";
import {
  EXPERTS_DATA,
  EXPERT_CATEGORIES,
} from "@/module/Experts/constants/expertConstants";

const ExpertsPage = () => {
  const [open, setOpen] = useState(false);
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  // Search field configuration
  const searchFieldOptions = [
    {
      type: "search",
      label: "",
      formFieldValue: "search",
      defaultValue: "",
      placeholder: "Search",
      icon: "",
    },
    {
      type: "select",
      label: "",
      formFieldValue: "expertType",
      defaultValue: "",
      placeholder: "Select expert type",
      options: _map(EXPERT_CATEGORIES, (category) => ({
        value: category.value,
        label: category.label,
      })),
    },

    {
      type: "countrySelect",
      label: "",
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

  // Handle search form submission
  const handleSearch = (values) => {
    console.log("Search values:", values);
    // Here you can implement your search logic
    // Example: filter data based on values
    // values.expertType, values.search, values.countrySelect
  };

  return (
    <>
      <PublicLayout>
        <PageHeadingBanner
          heading="Experts"
          currentPageTitle="List of companies"
        />
        <section className="section-padding small pt-0">
          <div className="container">
            <div className="d-none d-md-block">
              <SearchContainer
                forListingPage
                floatingEnable
                searchFieldOptions={searchFieldOptions}
                onSearch={handleSearch}
              />
            </div>

            <div className="row align-items-center my-2">
              <div className="col-10">
                <h3 className="C-heading size-4 bold mb-4 font-family-creative">
                  Top shipping experts in india
                </h3>
              </div>
              <div className="col-2 text-right d-md-none">
                <button className="C-settingButton" onClick={showDrawer}>
                  <Icon name="filter_alt" isFilled />
                </button>
              </div>
            </div>

            <div className="row border-bottom pb-2 mb-3">
              <div className="col-md-4 col-sm-12">
                <span className="C-heading size-6 semiBold mb-0">
                  <strong>12</strong> experts found
                </span>
              </div>
              <div className="col-md-8 col-sm-12 text-right">
                <Space>
                  <Tag closeIcon className="C-tag is-low small">
                    Top Product Development
                  </Tag>
                  <Tag closeIcon className="C-tag is-low small">
                    Top Product Development
                  </Tag>
                </Space>
              </div>
            </div>
            <div className="row">
              {/* Main Content */}
              <div className="col-12 col-md-12">
                <CardListing
                  data={EXPERTS_DATA}
                  CardComponent={ExpertCard}
                  // loading={loading}
                  // onPageChange={loadExperts}
                  size={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                />
              </div>
            </div>
          </div>
        </section>
        <Drawer
          title="Filter Experts"
          closable={{ "aria-label": "Close Button" }}
          onClose={onClose}
          open={open}
        >
          <SearchContainer
            forListingPage
            floatingEnable
            searchFieldOptions={searchFieldOptions}
            onSearch={handleSearch}
            inSidebar
          />
        </Drawer>
      </PublicLayout>
    </>
  );
};

export default ExpertsPage;
