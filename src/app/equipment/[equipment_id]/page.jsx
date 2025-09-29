"use client";

import Icon from "@/components/Icon";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import { Divider, Space, Tabs, Image as ThumbnailImage } from "antd";
import Image from "next/image";
import React from "react";

const AboutCompany = () => {
  return (
    <>
      <p className="C-heading size-6 mb-4 semiBold">
        Moody’s Corporation, often referred to as Moody’s, is an American
        business and financial services company. It is the holding company for
        Moody’s Investors Service (MIS), an American credit rating agency, and
        Moody’s Analytics (MA), an American provider of financial analysis
        software and services.
      </p>
      <p className="C-heading size-6 mb-4 semiBold">
        Moody’s Corporation, often referred to as Moody’s, is an American
        business and financial services company. It is the holding company for
        Moody’s Investors Service (MIS), an American credit rating agency, and
        Moody’s Analytics (MA), an American provider of financial analysis
        software and services.
      </p>
      <p className="C-heading size-6 mb-3 semiBold">
        Moody’s Corporation, often referred to as Moody’s, is an American
        business and financial services company. It is the holding company for
        Moody’s Investors Service (MIS), an American credit rating agency, and
        Moody’s Analytics (MA), an American provider of financial analysis
        software and services.
      </p>
      <div className="C-bulletList mb-3">
        <ul>
          <li>
            <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
            <span className="C-heading semiBold size-6 mb-0 dont-break">
              <strong>Origin:</strong> Thailand
            </span>
          </li>
          <li>
            <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
            <span className="C-heading semiBold size-6 mb-0 dont-break">
              <strong>General Use:</strong> Outdoor Furniture
            </span>
          </li>
          <li>
            <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
            <span className="C-heading semiBold size-6 mb-0 dont-break">
              <strong>Instructions for use:</strong> Eat directly
            </span>
          </li>
          <li>
            <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
            <span className="C-heading semiBold size-6 mb-0 dont-break">
              <strong>Packing:</strong> 400g pack
            </span>
          </li>
        </ul>
      </div>
    </>
  );
};

const EquipmentImages = () => {
  return (
    <>
      <div className="row g-3">
        <div className="col-md-4 col-sm-6 col-xs-12">
          <ThumbnailImage
            src="/assets/images/equipment_2.jpg"
            className="img-fluid img-thumbnail"
          />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-12">
          <ThumbnailImage
            src="/assets/images/equipment_2.jpg"
            className="img-fluid img-thumbnail"
          />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-12">
          <ThumbnailImage
            src="/assets/images/equipment_2.jpg"
            className="img-fluid img-thumbnail"
          />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-12">
          <ThumbnailImage
            src="/assets/images/equipment_2.jpg"
            className="img-fluid img-thumbnail"
          />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-12">
          <ThumbnailImage
            src="/assets/images/equipment_2.jpg"
            className="img-fluid img-thumbnail"
          />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-12">
          <ThumbnailImage
            src="/assets/images/equipment_2.jpg"
            className="img-fluid img-thumbnail"
          />
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
                <div className="d-flex gap-2 mb-4">
                  <Image
                    src="/assets/images/equipment_2.jpg"
                    alt="My Logo"
                    width={260}
                    height={130}
                    className="img-thumbnail img-fluid"
                  />
                  <div className="flex-grow-1">
                    <h3 className="C-heading size-4 color-dark mb-2 extraBold">
                      Replacement Brake Pad and Rotor Kit
                    </h3>
                    <div className="d-flex justify-content-start gap-2 align-items-center mb-3">
                      <div>
                        <Space>
                          <Icon name="view_in_ar" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light semiBold mb-0">
                            KOE2553
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
                          <Icon name="sell" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light semiBold mb-0">
                            Available for{" "}
                            <strong className="color-primary">Sale</strong>
                          </span>
                        </Space>
                      </div>
                    </div>
                    <div className="d-flex justify-content-start gap-2 align-items-center">
                      <div>
                        <Space align="middle">
                          <Icon name="payments" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light semiBold mb-0">
                            <Space align="middle">
                              Rent:
                              <strong className="color-primary fs-4">
                                $3400
                              </strong>
                            </Space>
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
                      label: "Description",
                      children: <AboutCompany />,
                    },
                    {
                      key: "EquipmentImages",
                      label: "Images",
                      children: <EquipmentImages />,
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
                        Weight:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-xs bold color-dark mb-0 text-right">
                        112 kg
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-xs semiBold color-light mb-0 color-dark">
                        Built in:
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
                        Dimensions:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-xs bold color-dark mb-0 text-right">
                        12 X 2 X 1.5 m
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-xs semiBold color-light mb-0 color-dark">
                        Location:
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
                        Price:
                      </span>
                    </div>
                    <div className="col text-right">
                      <span className="C-heading size-xs bold color-dark mb-0 text-right">
                        $5500
                      </span>
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
