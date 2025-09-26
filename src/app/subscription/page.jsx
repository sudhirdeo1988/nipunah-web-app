"use client";

import React from "react";
import Icon from "@/components/Icon";
import { Divider, Space, List } from "antd";
import { map as _map } from "lodash-es";
import PublicLayout from "@/layout/PublicLayout";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";

const plans = [
  {
    id: 1,
    plan_name: "Starter Plan",
    price: "500",
    currency: "INR",
    frequency: "Month",
    description:
      "Vivamus est, sodales facilisis et, luctus amet risus dolor felis Vivamus est, sodales facilisis et.",
    features: [
      "Full Company Profile",
      "Showcase up to 3 services/equipment with 1 image each",
      "Verified Badge",
      "List in 1 category & 1 location/port",
      "Analytics Dashboard",
      "Social Media Sharing",
    ],
  },
  {
    id: 2,
    plan_name: "Growth Plan",
    price: "1500",
    currency: "INR",
    frequency: "Month",
    description:
      "Vivamus est, sodales facilisis et, luctus amet risus dolor felis Vivamus est, sodales facilisis et.",
    most_popular: true,
    features: [
      "Full Company Profile",
      "Showcase up to 15 services/equipment with up to 1 image for Services and 5 images for equipment each",
      "Verified Badge",
      "List in 5 category & 5 location/port",
      "Analytics Dashboard",
      "Social Media Sharing",
    ],
  },
  {
    id: 3,
    plan_name: "Premium Plan",
    price: "2500",
    currency: "INR",
    frequency: "Month",
    description:
      "Vivamus est, sodales facilisis et, luctus amet risus dolor felis Vivamus est, sodales facilisis et.",
    features: [
      "Full Company Profile",
      "Showcase up to 25 services/equipment with up to 1 image for Services and 5 images for equipment each",
      "Verified + Premium Badge",
      "List in 10 category & 10 location/port",
      "Analytics Dashboard",
      "Social Media Sharing",
      "Featured in Category Highlights",
    ],
  },
];

const SubscriptionPage = () => {
  return (
    <>
      <PublicLayout>
        <PageHeadingBanner
          heading="Subscription Plans"
          currentPageTitle="Subscription Plans"
        />
        <section className="section-padding">
          <div className="container">
            <div className="row g-3">
              {_map(plans, (planCard) => {
                return (
                  <div
                    className="col-md-4 col-sm-6 col-xs-12"
                    key={planCard?.id}
                  >
                    <div
                      className={`h-100 rounded-3 d-flex flex-column ${
                        planCard?.most_popular ? "gradient-wrapper" : "border"
                      }`}
                    >
                      <div className="head p-3">
                        <div className="mb-3">
                          <Space align="center">
                            <h3 className="C-heading size-5 extraBold gradient-text font-secondary mb-0">
                              {planCard?.plan_name}
                            </h3>
                            {planCard?.most_popular && (
                              <span className="badge bg-secondary color-white p-2 px-3 rounded-pill">
                                Most Popular 🔥
                              </span>
                            )}
                          </Space>
                        </div>
                        <Space align="center" size={12} className="mb-3">
                          <h3 className="C-heading size-4 extraBold color-dark font-secondary mb-0">
                            {planCard?.currency} {planCard?.price}
                          </h3>
                          <span className="C-heading size-xs color-light semiBold mb-0">
                            / {planCard?.frequency}
                          </span>
                        </Space>
                        <span className="C-heading size-xs color-light semiBold mb-3">
                          {planCard?.description}
                        </span>

                        <button className="C-button is-filled w-100">
                          Choose plan
                        </button>
                      </div>
                      <div className="body p-3 pt-0">
                        <Divider orientation="left">
                          <span className="C-heading size-xss color-light mb-0 text-uppercase bold">
                            Features
                          </span>
                        </Divider>
                        <List
                          itemLayout="horizontal"
                          dataSource={planCard?.features}
                          bordered={false}
                          renderItem={(item) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={
                                  <Icon
                                    name="check_circle"
                                    isFilled
                                    color="#dadada"
                                  />
                                }
                                title={
                                  <span className="C-heading size-xs color-light semiBold mb-0">
                                    {item}
                                  </span>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </PublicLayout>
    </>
  );
};

export default SubscriptionPage;
