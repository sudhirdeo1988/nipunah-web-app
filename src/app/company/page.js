"use client"; // ✅ Required for interactive Ant Design components in App Router

import React, { useState } from "react";
import { Checkbox, Row, Col, Input, Tag, Drawer } from "antd";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import Icon from "@/components/Icon";
import CardListing from "@/components/CardListing";
import CompanyCard from "@/components/CompanyCard";

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

const CompanyFilter = () => {
  return (
    <>
      <div className="p-2 mb-3">
        <span className="C-heading size-xss extraBold mb-2 color-dark text-uppercase">
          Segments
        </span>
        <Checkbox.Group style={{ width: "100%" }}>
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Checkbox value="A1">
                <span className="C-heading size-xs semiBold mb-0">
                  Product Development
                </span>
              </Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox value="A2">
                <span className="C-heading size-xs semiBold mb-0">
                  Product Development
                </span>
              </Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox value="A3">
                <span className="C-heading size-xs semiBold mb-0">
                  Product Development
                </span>
              </Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox value="A4">
                <span className="C-heading size-xs semiBold mb-0">
                  Product Development
                </span>
              </Checkbox>
            </Col>
          </Row>
        </Checkbox.Group>
      </div>

      <div className="p-2 mb-3">
        <span className="C-heading size-xss extraBold mb-2 color-dark text-uppercase">
          Categories
        </span>
        <Checkbox.Group style={{ width: "100%" }}>
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Checkbox value="A1">
                <span className="C-heading size-xs semiBold mb-0">
                  Product Development
                </span>
              </Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox value="A2">
                <span className="C-heading size-xs semiBold mb-0">
                  Product Development
                </span>
              </Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox value="A3">
                <span className="C-heading size-xs semiBold mb-0">
                  Product Development
                </span>
              </Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox value="A4">
                <span className="C-heading size-xs semiBold mb-0">
                  Product Development
                </span>
              </Checkbox>
            </Col>
          </Row>
        </Checkbox.Group>
      </div>

      <div className="p-2 mb-3">
        <span className="C-heading size-xss extraBold mb-2 color-dark text-uppercase">
          Country
        </span>
        <Checkbox.Group style={{ width: "100%" }}>
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Checkbox value="A1">
                <span className="C-heading size-xs semiBold mb-0">
                  Product Development
                </span>
              </Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox value="A2">
                <span className="C-heading size-xs semiBold mb-0">
                  Product Development
                </span>
              </Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox value="A3">
                <span className="C-heading size-xs semiBold mb-0">
                  Product Development
                </span>
              </Checkbox>
            </Col>
            <Col span={24}>
              <Checkbox value="A4">
                <span className="C-heading size-xs semiBold mb-0">
                  Product Development
                </span>
              </Checkbox>
            </Col>
          </Row>
        </Checkbox.Group>
      </div>
    </>
  );
};

const CompanyListPage = () => {
  return (
    <PublicLayout>
      <PageHeadingBanner
        heading="Companies"
        currentPageTitle="List of companies"
      />
      <section className="section-padding small white-gradient-bg2">
        <div className="container">
          <h3 className="C-heading size-5 color-light extraBold mb-3">
            Top shipping companies in india
          </h3>
          <div className="row g-3">
            <div className="col-3">
              <div className="p-3 bg-light h-100">
                <CompanyFilter isSideBar />
              </div>
            </div>
            {/* Main Content */}
            <div className="col-9">
              <div className="v-filter">
                <div className="row align-items-center">
                  <div className="col-md-3 col-sm-4">
                    <span className="C-heading size-xs semiBold mb-0">
                      <strong>12</strong> Companies
                    </span>
                  </div>
                  <div className="col-md-6 col-sm-4">
                    <div className="C-tagList">
                      <ul>
                        <li>
                          <Tag closeIcon className="C-tag is-low">
                            Top Product Development
                          </Tag>
                        </li>
                        <li>
                          <Tag closeIcon className="C-tag is-low">
                            Top Product Development
                          </Tag>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-4 text-right">
                    <Input
                      placeholder="Search Company"
                      prefix={<Icon name="search" />}
                    />
                  </div>
                </div>
              </div>

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
