"use client"; // ✅ Required for interactive Ant Design components in App Router

import React from "react";
import { Checkbox, Row, Col, Input, Space, Select, Tag } from "antd";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import Icon from "@/components/Icon";
import EquipmentCard from "@/components/EquipmentCard";
import CardListing from "@/components/CardListing";

const data = [
  {
    id: 1,
    name: "Company Name Here",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been Lorem Ipsum is",
    logo: "",
    segment: "Logistics",
    category: ["Product Development"],
    createdOn: "1 hours ago",
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
    id: 2,
    name: "Company Name Here",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been Lorem Ipsum is",
    logo: "",
    segment: "Logistics",
    category: ["Product Development"],
    createdOn: "1 hours ago",
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

const EquipmentListPage = () => {
  return (
    <PublicLayout>
      <PageHeadingBanner
        heading="Equipment"
        currentPageTitle="List of equipments"
      />
      <section className="section-padding small">
        <div className="container">
          <div className="row">
            {/* Sidebar */}
            <div className="col-md-3 col-sm-6 col-xs-12">
              <div className="sidebar-widget">
                <span className="C-heading size-xs extraBold mb-2 color-dark text-uppercase">
                  Applied Filters
                </span>
                <Tag
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                    console.log(e);
                  }}
                  color="blue"
                >
                  Top 10 Product
                </Tag>
              </div>
              <div className="sidebar-widget">
                <span className="C-heading size-xs extraBold mb-2 color-dark text-uppercase">
                  SEARCH
                </span>
                <Input
                  placeholder="Enter company name"
                  prefix={<Icon name="search" />}
                />
              </div>
              <div className="sidebar-widget">
                <span className="C-heading size-xs extraBold mb-2 color-dark text-uppercase">
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

              <div className="sidebar-widget">
                <span className="C-heading size-xs extraBold mb-2 color-dark text-uppercase">
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
            </div>

            {/* Main Content */}
            <div className="col-md-9 col-sm-6 col-xs-12">
              <Row className="mb-3" align="middle">
                <Col md={16}>
                  <span className="C-heading size-xs mb-0 semiBold">
                    Show 10 jobs
                  </span>
                </Col>
                <Col md={8} className="text-right">
                  <Space>
                    <Select
                      placeholder="Sort by (Default)"
                      optionFilterProp="label"
                      options={[
                        {
                          value: "jack",
                          label: "Jack",
                        },
                        {
                          value: "lucy",
                          label: "Lucy",
                        },
                        {
                          value: "tom",
                          label: "Tom",
                        },
                      ]}
                    />
                  </Space>
                </Col>
              </Row>
              <CardListing
                data={data}
                CardComponent={EquipmentCard}
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
