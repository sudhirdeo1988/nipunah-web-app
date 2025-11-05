"use client"; // ✅ Required for interactive Ant Design components in App Router

import React, { useState } from "react";
import { Tag, Space, Drawer } from "antd";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import EquipmentCard from "@/components/EquipmentCard";
import CardListing from "@/components/CardListing";
import { map as _map } from "lodash-es";
import SearchContainer from "@/components/SearchContainer";
import CountryDetails from "@/utilities/CountryDetails.json";
import Icon from "@/components/Icon";

const data = [
  {
    id: 1,
    name: "Equipment Name Here",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been Lorem Ipsum is",
    logo: "",
    type: "Logistics",
    model: "XYZ-123",
    category: "Shipping",
    createdOn: "2023",
    availableFor: "Sale",
    createdBy: "",
    location: {
      state: "London",
      country: "UK",
      address: "",
    },
    photoes: [],
    isApplied: false,
    isPaid: false,
  },
  {
    id: 2,
    name: "Equipment Name Here",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been Lorem Ipsum is",
    logo: "",
    type: "Logistics",
    model: "XYZ-123",
    category: "Marine",
    createdOn: "2023",
    availableFor: "Lease",
    createdBy: "",
    location: {
      state: "London",
      country: "UK",
      address: "",
    },
    photoes: [],
    isApplied: false,
    isPaid: false,
  },
  {
    id: 22,
    name: "Equipment Name Here",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been Lorem Ipsum is",
    logo: "",
    type: "Ship Building",
    model: "XYZ-123",
    category: "Shipping",
    createdOn: "2023",
    availableFor: "Lease",
    createdBy: "",
    location: {
      state: "London",
      country: "UK",
      address: "",
    },
    photoes: [],
    isApplied: false,
    isPaid: false,
  },
  {
    id: 21,
    name: "Equipment Name Here",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been Lorem Ipsum is",
    logo: "",
    type: "Ship Building",
    model: "XYZ-123",
    category: "Engineering",
    createdOn: "2023",
    availableFor: "Rental",
    createdBy: "",
    location: {
      state: "London",
      country: "UK",
      address: "",
    },
    photoes: [],
    isApplied: false,
    isPaid: false,
  },
];

const EquipmentListPage = () => {
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
      formFieldValue: "equipmentType",
      defaultValue: "",
      placeholder: "Select equipment type",
      options: [
        { value: "Companies", label: "Marine Engineering" },
        { value: "Equipments", label: "Marine Equipments" },
      ],
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
    // values.equipmentType, values.search, values.countrySelect
  };

  return (
    <PublicLayout>
      <PageHeadingBanner
        heading="Equipments"
        currentPageTitle="List of Equipments"
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
                Top equipments in marine Engineering
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
                <strong>12</strong> equipments found
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
          <div className="row g-3">
            {/* Main Content */}
            <div className="col-12">
              <CardListing
                data={data}
                CardComponent={EquipmentCard}
                size={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                // loading={loading}
                // onPageChange={loadCompanies}
              />
            </div>
          </div>
        </div>
      </section>
      <Drawer
        title="Filter Equipments"
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
  );
};

export default EquipmentListPage;
