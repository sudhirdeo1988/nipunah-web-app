"use client"; // ✅ Required for interactive Ant Design components in App Router

import React from "react";
import { Tag, Space } from "antd";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import CardListing from "@/components/CardListing";
import CompanyCard from "@/components/CompanyCard";
import { map as _map } from "lodash-es";
import SearchContainer from "@/components/SearchContainer";

const data = [
  {
    id: 1,
    name: "Company Name Here",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry",
    logo: "",
    segment: "Logistics",
    category: ["Product Development"],
    createdOn: "3 weeks ago",
    createdBy: "",
    location: {
      state: "London",
      country: "UK",
      address: "",
    },
    isApplied: false,
    isPaid: false,
    isPriority: true,
  },
  {
    id: 2,
    name: "Company Name Here",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been Lorem Ipsum is",
    logo: "",
    segment: "Logistics",
    category: ["Product Development"],
    createdOn: "1 month ago",
    createdBy: "",
    location: {
      state: "London",
      country: "UK",
      address: "",
    },
    isApplied: false,
    isPaid: false,
  },
  {
    id: 22,
    name: "Company Name Here",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been Lorem Ipsum is",
    logo: "",
    segment: "Logistics",
    category: ["Product Development"],
    createdOn: "1 month ago",
    createdBy: "",
    location: {
      state: "London",
      country: "UK",
      address: "",
    },
    isApplied: false,
    isPaid: false,
  },
  {
    id: 21,
    name: "Company Name Here",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been Lorem Ipsum is",
    logo: "",
    segment: "Logistics",
    category: ["Product Development"],
    createdOn: "1 month ago",
    createdBy: "",
    location: {
      state: "London",
      country: "UK",
      address: "",
    },
    isApplied: false,
    isPaid: false,
  },
];

const CompanyListPage = () => {
  return (
    <PublicLayout>
      <PageHeadingBanner
        heading="Companies"
        currentPageTitle="List of companies"
      />
      <section className="section-padding small pt-0">
        <div className="container">
          <SearchContainer forListingPage floatingEnable />

          <h3 className="C-heading size-4 bold mb-4 font-family-creative">
            Top shipping companies in india
          </h3>

          <div className="row border-bottom pb-2 mb-3">
            <div className="col-md-4 col-sm-12">
              <span className="C-heading size-6 semiBold mb-0">
                <strong>12</strong> Companies found
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
            <div className="col-12 col-md-12">
              <CardListing
                data={data}
                CardComponent={CompanyCard}
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

export default CompanyListPage;
