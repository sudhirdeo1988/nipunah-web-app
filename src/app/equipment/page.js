"use client"; // ✅ Required for interactive Ant Design components in App Router

import React from "react";
import { Checkbox, Row, Col, Tag, Input } from "antd";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import Icon from "@/components/Icon";
import EquipmentCard from "@/components/EquipmentCard";
import CardListing from "@/components/CardListing";

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

const EquipmentsFilter = () => {
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

const EquipmentListPage = () => {
  return (
    <PublicLayout>
      <PageHeadingBanner
        heading="Companies"
        currentPageTitle="List of companies"
      />
      <section className="section-padding small white-gradient-bg2">
        <div className="container">
          <h3 className="C-heading size-5 color-light extraBold mb-3">
            Top categories in marine Engineering
          </h3>
          <div className="row g-3">
            <div className="col-3">
              <div className="p-3 bg-light h-100">
                <EquipmentsFilter />
              </div>
            </div>
            {/* Main Content */}
            <div className="col-9">
              <div className="v-filter">
                <div className="row align-items-center">
                  <div className="col-md-3 col-sm-4">
                    <span className="C-heading size-xs semiBold mb-0">
                      <strong>12</strong> Equipments
                    </span>
                  </div>
                  <div className="col-md-7 col-sm-4">
                    <div className="C-tagList">
                      <ul>
                        <li>
                          <Tag closeIcon className="C-tag is-low">
                            Top 10 Equipments
                          </Tag>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-md-2 col-sm-4 text-right">
                    <Input
                      placeholder="Search Equipment"
                      prefix={<Icon name="search" />}
                    />
                  </div>
                </div>
              </div>

              <CardListing
                data={data}
                CardComponent={EquipmentCard}
                size={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
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
