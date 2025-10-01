"use client"; // ✅ Required for interactive Ant Design components in App Router

import React from "react";
import { Tag, Space } from "antd";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import EquipmentCard from "@/components/EquipmentCard";
import CardListing from "@/components/CardListing";
import SearchContainer from "@/components/SearchContainer";

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
  return (
    <PublicLayout>
      <PageHeadingBanner
        heading="Equipments"
        currentPageTitle="List of Equipments"
      />
      <section className="section-padding small pt-0">
        <div className="container">
          <SearchContainer forListingPage floatingEnable />

          <h3 className="C-heading size-4 bold mb-4 font-family-creative">
            Top equipments in marine Engineering
          </h3>

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
    </PublicLayout>
  );
};

export default EquipmentListPage;
