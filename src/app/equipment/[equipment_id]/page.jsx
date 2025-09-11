"use client";

import Icon from "@/components/Icon";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import { Divider, Space, Tabs } from "antd";
import Image from "next/image";
import React from "react";

const AboutCompany = () => {
  return (
    <>
      <h4 className="C-heading size-5 extraBold mb-3 font-family-primary">
        About Company
      </h4>
      <p className="C-heading size-6 mb-4 font-family-primary semiBold">
        Moody’s Corporation, often referred to as Moody’s, is an American
        business and financial services company. It is the holding company for
        Moody’s Investors Service (MIS), an American credit rating agency, and
        Moody’s Analytics (MA), an American provider of financial analysis
        software and services.
      </p>
      <p className="C-heading size-6 mb-4 font-family-primary semiBold">
        Moody’s Corporation, often referred to as Moody’s, is an American
        business and financial services company. It is the holding company for
        Moody’s Investors Service (MIS), an American credit rating agency, and
        Moody’s Analytics (MA), an American provider of financial analysis
        software and services.
      </p>
      <p className="C-heading size-6 mb-3 font-family-primary semiBold">
        Moody’s Corporation, often referred to as Moody’s, is an American
        business and financial services company. It is the holding company for
        Moody’s Investors Service (MIS), an American credit rating agency, and
        Moody’s Analytics (MA), an American provider of financial analysis
        software and services.
      </p>
    </>
  );
};

const CompanyLocations = () => {
  return (
    <>
      <h4 className="C-heading size-5 extraBold mb-3 font-family-primary">
        Company Locations
      </h4>
      <div className="row">
        <div className="col-md-6 col-xs-12">
          <div className="p-3 border rounded-3 mb-3">
            <h4 className="C-heading size-6 color-dark bold mb-1">
              Moody's Corporation
            </h4>
            <span className="C-heading size-xs semiBold mb-3">
              <Icon
                name="globe"
                size="small"
                isFilled
                className="me-1"
                color="#b2b2b2"
              />
              London, UK
            </span>
            <span className="C-heading size-xs semiBold mb-3">
              <Icon
                name="location_on"
                size="small"
                isFilled
                className="me-1"
                color="#b2b2b2"
              />
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lor
            </span>
          </div>
        </div>
        <div className="col-md-6 col-xs-12">
          <div className="p-3 border rounded-3 mb-3">
            <h4 className="C-heading size-6 color-dark bold mb-1">
              Moody's Corporation
            </h4>
            <span className="C-heading size-xs semiBold mb-3">
              <Icon
                name="globe"
                size="small"
                isFilled
                className="me-1"
                color="#b2b2b2"
              />
              London, UK
            </span>
            <span className="C-heading size-xs semiBold mb-3">
              <Icon
                name="location_on"
                size="small"
                isFilled
                className="me-1"
                color="#b2b2b2"
              />
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lor
            </span>
          </div>
        </div>
        <div className="col-md-6 col-xs-12">
          <div className="p-3 border rounded-3 mb-3">
            <h4 className="C-heading size-6 color-dark bold mb-1">
              Moody's Corporation
            </h4>
            <span className="C-heading size-xs semiBold mb-3">
              <Icon
                name="globe"
                size="small"
                isFilled
                className="me-1"
                color="#b2b2b2"
              />
              London, UK
            </span>
            <span className="C-heading size-xs semiBold mb-3">
              <Icon
                name="location_on"
                size="small"
                isFilled
                className="me-1"
                color="#b2b2b2"
              />
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lor
            </span>
          </div>
        </div>
        <div className="col-md-6 col-xs-12">
          <div className="p-3 border rounded-3 mb-3">
            <h4 className="C-heading size-6 color-dark bold mb-1">
              Moody's Corporation
            </h4>
            <span className="C-heading size-xs semiBold mb-3">
              <Icon
                name="globe"
                size="small"
                isFilled
                className="me-1"
                color="#b2b2b2"
              />
              London, UK
            </span>
            <span className="C-heading size-xs semiBold mb-3">
              <Icon
                name="location_on"
                size="small"
                isFilled
                className="me-1"
                color="#b2b2b2"
              />
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lor
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

const EquipmentDetails = () => {
  return (
    <>
      <PublicLayout>
        <PageHeadingBanner
          heading="Equipment Details"
          currentPageTitle="List of companies"
        />
        <section className="section-padding small">
          <div className="container">
            <div className="row">
              <div className="col-12">
                {/* Logo and company title */}
                <div class="d-flex gap-2 mb-4">
                  <Image
                    src="/assets/images/about.jpg"
                    alt="My Logo"
                    width={260}
                    height={130}
                    className="mb-2"
                  />
                  <div className="flex-grow-1">
                    <h3 className="C-heading size-4 color-dark mb-2 extraBold">
                      Moody’s Corporation
                    </h3>
                    <div className="d-flex justify-content-start gap-2 align-items-center">
                      <div>
                        <Space>
                          <Icon name="settings" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light semiBold mb-0">
                            Logistics
                          </span>
                        </Space>
                      </div>
                      <Divider
                        type="vertical"
                        style={{
                          backgroundColor: "#b1b1b1",
                          width: "2px",
                          margin: "0 8px",
                        }}
                      />
                      <div>
                        <Space>
                          <Icon name="view_in_ar" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light semiBold mb-0">
                            Model Name / id
                          </span>
                        </Space>
                      </div>
                      <Divider
                        type="vertical"
                        style={{
                          backgroundColor: "#b1b1b1",
                          width: "2px",
                          margin: "0 8px",
                        }}
                      />
                      <div>
                        <Space>
                          <Icon name="sell" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light semiBold mb-0">
                            Available for <strong>Sale</strong>
                          </span>
                        </Space>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-8 col-sm-12">
                <Tabs
                  type="card"
                  items={[
                    {
                      key: "aboutCompany",
                      label: "About Company",
                      children: <AboutCompany />,
                    },
                    {
                      key: "companyLocations",
                      label: "Locations",
                      children: <CompanyLocations />,
                    },
                    {
                      key: "3",
                      label: "Tab 3",
                      children: "Content of Tab Pane 3",
                    },
                  ]}
                  className="C-tab"
                />
              </div>
              <div className="col-md-4 col-sm-12">
                <div className="background-highlight rounded-2 p-4">
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-xs semiBold color-light mb-0 color-dark">
                        Primary industry:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-xs bold color-dark mb-0 text-right">
                        Marine Engineering
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-xs semiBold color-light mb-0 color-dark">
                        Company size:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-xs bold color-dark mb-0 text-right">
                        1000
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-xs semiBold color-light mb-0 color-dark">
                        Founded in:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-xs bold color-dark mb-0 text-right">
                        2015
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-xs semiBold color-light mb-0 color-dark">
                        Turnover:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-xs bold color-dark mb-0 text-right">
                        $ 35M
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-xs semiBold color-light mb-0 color-dark">
                        Business Location:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-xs bold color-dark mb-0 text-right">
                        London, UK
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-xs semiBold color-light mb-0 color-dark">
                        Social Media:
                      </span>
                    </div>
                    <div className="col text-right">
                      <Space size={0}>
                        <button className="C-settingButton is-clean small">
                          <i className="bi bi-facebook color-light"></i>
                        </button>
                        <button className="C-settingButton is-clean small">
                          <i className="bi bi-linkedin color-light"></i>
                        </button>
                        <button className="C-settingButton is-clean small">
                          <i className="bi bi-twitter color-light"></i>
                        </button>
                        <button className="C-settingButton is-clean small">
                          <i className="bi bi-instagram color-light"></i>
                        </button>
                      </Space>
                    </div>
                  </div>
                  <button className="C-button is-filled full-width">
                    www.abc.com
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </PublicLayout>
    </>
  );
};

export default EquipmentDetails;
