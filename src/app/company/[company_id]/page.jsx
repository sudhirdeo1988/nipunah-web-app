"use client";

import Icon from "@/components/Icon";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import { Divider, Space, Tabs, Image as PreviewImage } from "antd";
import Image from "next/image";
import React from "react";

const AboutCompany = () => {
  return (
    <>
      <h4 className="C-heading size-5 bold mb-3 font-family-creative">
        About Company
      </h4>
      <span className="C-heading size-6 mb-4 font-family-creative">
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book. It has survived not only five
        centuries,
      </span>
      <span className="C-heading size-6 mb-4  font-family-creative">
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book. It has survived not only five
        centuries,
      </span>
      <span className="C-heading size-6 mb-5  font-family-creative">
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book. It has survived not only five
        centuries,
      </span>

      <h4 className="C-heading size-5 bold mb-3  font-family-creative">
        Key Clients
      </h4>
      <div className="row">
        <div className="col-md-4 col-sm-6 col-xs-12 ">
          <div className="p-3 border rounded-3 mb-3 text-center">
            <Image
              src="/assets/images/logo.png"
              alt="My Logo"
              width={180}
              height={60}
              className="mx-auto d-block"
            />
          </div>
        </div>
        <div className="col-md-4 col-sm-6 col-xs-12">
          <div className="p-3 border rounded-3 mb-3">
            <Image
              src="/assets/images/logo.png"
              alt="My Logo"
              width={180}
              height={60}
              className="mx-auto d-block"
            />
          </div>
        </div>
        <div className="col-md-4 col-sm-6 col-xs-12">
          <div className="p-3 border rounded-3 mb-3">
            <Image
              src="/assets/images/logo.png"
              alt="My Logo"
              width={180}
              height={60}
              className="mx-auto d-block"
            />
          </div>
        </div>
        <div className="col-md-4 col-sm-6 col-xs-12">
          <div className="p-3 border rounded-3 mb-3">
            <Image
              src="/assets/images/logo.png"
              alt="My Logo"
              width={180}
              height={60}
              className="mx-auto d-block"
            />
          </div>
        </div>
      </div>
    </>
  );
};

const CompanyJobs = () => {
  return (
    <>
      <h4 className="C-heading size-6 bold mb-3 ">Current available jobs</h4>
      <div className="row g-3">
        <div className="col-md-6 col-xs-12">
          <div className="p-3 rounded-2 bg-white shadow-sm">
            <h4 className="C-heading size-6 gradient-text semiBold mb-1 text-truncate">
              Senior Food manager
            </h4>
            <span className="C-heading size-6 mb-2 ">
              <Icon
                name="location_on"
                className="me-1"
                size="small"
                isFilled
                color="#bdbdbd"
              />
              1000-1198 Apono Pl Hilo, HI 96720
            </span>
            <span className="C-heading size-6 mb-2">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lor
            </span>
            <div className="d-flex justify-content-start gap-2 align-items-center">
              <div>
                <Space size={4}>
                  <Icon name="payments" color="#b1b1b1" size="small" isFilled />
                  <span className="C-heading size-6 mb-0">$30k - $35k</span>
                </Space>
              </div>
              <Divider
                type="vertical"
                style={{
                  backgroundColor: "#b1b1b1",
                  width: "2px",
                  margin: "0 4px",
                }}
              />
              <div>
                <Space size={4}>
                  <Icon
                    name="account_circle"
                    color="#b1b1b1"
                    size="small"
                    isFilled
                  />
                  <span className="C-heading size-6 mb-0">5-7 Years</span>
                </Space>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xs-12">
          <div className="p-3 rounded-2 bg-white shadow-sm">
            <h4 className="C-heading size-6 gradient-text semiBold mb-1 text-truncate">
              Senior Food manager
            </h4>
            <span className="C-heading size-6 mb-2 ">
              <Icon
                name="location_on"
                className="me-1"
                size="small"
                isFilled
                color="#bdbdbd"
              />
              1000-1198 Apono Pl Hilo, HI 96720
            </span>
            <span className="C-heading size-6 mb-2">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lor
            </span>
            <div className="d-flex justify-content-start gap-2 align-items-center">
              <div>
                <Space size={4}>
                  <Icon name="payments" color="#b1b1b1" size="small" isFilled />
                  <span className="C-heading size-6 mb-0">$30k - $35k</span>
                </Space>
              </div>
              <Divider
                type="vertical"
                style={{
                  backgroundColor: "#b1b1b1",
                  width: "2px",
                  margin: "0 4px",
                }}
              />
              <div>
                <Space size={4}>
                  <Icon
                    name="account_circle"
                    color="#b1b1b1"
                    size="small"
                    isFilled
                  />
                  <span className="C-heading size-6 mb-0">5-7 Years</span>
                </Space>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xs-12">
          <div className="p-3 rounded-2 bg-white shadow-sm">
            <h4 className="C-heading size-6 gradient-text semiBold mb-1 text-truncate">
              Senior Food manager
            </h4>
            <span className="C-heading size-6 mb-2 ">
              <Icon
                name="location_on"
                className="me-1"
                size="small"
                isFilled
                color="#bdbdbd"
              />
              1000-1198 Apono Pl Hilo, HI 96720
            </span>
            <span className="C-heading size-6 mb-2">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lor
            </span>
            <div className="d-flex justify-content-start gap-2 align-items-center">
              <div>
                <Space size={4}>
                  <Icon name="payments" color="#b1b1b1" size="small" isFilled />
                  <span className="C-heading size-6 mb-0">$30k - $35k</span>
                </Space>
              </div>
              <Divider
                type="vertical"
                style={{
                  backgroundColor: "#b1b1b1",
                  width: "2px",
                  margin: "0 4px",
                }}
              />
              <div>
                <Space size={4}>
                  <Icon
                    name="account_circle"
                    color="#b1b1b1"
                    size="small"
                    isFilled
                  />
                  <span className="C-heading size-6 mb-0">5-7 Years</span>
                </Space>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xs-12">
          <div className="p-3 rounded-2 bg-white shadow-sm">
            <h4 className="C-heading size-6 gradient-text semiBold mb-1 text-truncate">
              Senior Food manager
            </h4>
            <span className="C-heading size-6 mb-2 ">
              <Icon
                name="location_on"
                className="me-1"
                size="small"
                isFilled
                color="#bdbdbd"
              />
              1000-1198 Apono Pl Hilo, HI 96720
            </span>
            <span className="C-heading size-6 mb-2">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lor
            </span>
            <div className="d-flex justify-content-start gap-2 align-items-center">
              <div>
                <Space size={4}>
                  <Icon name="payments" color="#b1b1b1" size="small" isFilled />
                  <span className="C-heading size-6 mb-0">$30k - $35k</span>
                </Space>
              </div>
              <Divider
                type="vertical"
                style={{
                  backgroundColor: "#b1b1b1",
                  width: "2px",
                  margin: "0 4px",
                }}
              />
              <div>
                <Space size={4}>
                  <Icon
                    name="account_circle"
                    color="#b1b1b1"
                    size="small"
                    isFilled
                  />
                  <span className="C-heading size-6 mb-0">5-7 Years</span>
                </Space>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const CompanyEquipments = () => {
  return (
    <>
      <h4 className="C-heading size-6 bold mb-3 ">Equipments by company</h4>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        <div className="col">
          <div className="card h-100">
            <Image
              src="/assets/images/about.jpg"
              alt="My Logo"
              width={180}
              height={160}
              style={{ width: "100%" }}
            />
            <div className="card-body p-3">
              <h5 className="C-heading size-6 gradient-text semiBold mb-2 text-truncate">
                Equipment title
              </h5>
              <span className="C-heading size-6 color-light mb-2">
                <Icon
                  name="view_in_ar"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                Model: <strong>Model Name / id</strong>
              </span>
              <span className="C-heading size-6 color-light mb-2">
                <Icon
                  name="settings"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                Type: <strong>Marine</strong>
              </span>
              <span className="C-heading size-6 color-light mb-2">
                <Icon
                  name="category"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                Category: <strong>Logistics</strong>
              </span>
              <span className="C-heading size-6 color-light mb-0">
                <Icon
                  name="calendar_month"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                Year of build: <strong>2015</strong>
              </span>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card h-100">
            <Image
              src="/assets/images/about.jpg"
              alt="My Logo"
              width={180}
              height={160}
              style={{ width: "100%" }}
            />
            <div className="card-body">
              <h5 className="C-heading size-6 gradient-text semiBold mb-2 text-truncate">
                Equipment title
              </h5>
              <span className="C-heading size-6 color-light mb-2">
                <Icon
                  name="view_in_ar"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                Model: <strong>Model Name / id</strong>
              </span>
              <span className="C-heading size-6 color-light mb-2">
                <Icon
                  name="settings"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                Type: <strong>Marine</strong>
              </span>
              <span className="C-heading size-6 color-light mb-2">
                <Icon
                  name="category"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                Category: <strong>Logistics</strong>
              </span>
              <span className="C-heading size-6 color-light mb-0">
                <Icon
                  name="calendar_month"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                Year of build: <strong>2015</strong>
              </span>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card h-100">
            <Image
              src="/assets/images/about.jpg"
              alt="My Logo"
              width={180}
              height={160}
              style={{ width: "100%" }}
            />
            <div className="card-body">
              <h5 className="C-heading size-6 gradient-text semiBold mb-2 text-truncate">
                Equipment title
              </h5>
              <span className="C-heading size-6 color-light mb-2">
                <Icon
                  name="view_in_ar"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                Model: <strong>Model Name / id</strong>
              </span>
              <span className="C-heading size-6 color-light mb-2">
                <Icon
                  name="settings"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                Type: <strong>Marine</strong>
              </span>
              <span className="C-heading size-6 color-light mb-2">
                <Icon
                  name="category"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                Category: <strong>Logistics</strong>
              </span>
              <span className="C-heading size-6 color-light mb-0">
                <Icon
                  name="calendar_month"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                Year of build: <strong>2015</strong>
              </span>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card h-100">
            <Image
              src="/assets/images/about.jpg"
              alt="My Logo"
              width={180}
              height={160}
              style={{ width: "100%" }}
            />
            <div className="card-body">
              <h5 className="C-heading size-6 gradient-text semiBold mb-2 text-truncate">
                Equipment title
              </h5>
              <span className="C-heading size-6 color-light mb-2">
                <Icon
                  name="view_in_ar"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                Model: <strong>Model Name / id</strong>
              </span>
              <span className="C-heading size-6 color-light mb-2">
                <Icon
                  name="settings"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                Type: <strong>Marine</strong>
              </span>
              <span className="C-heading size-6 color-light mb-2">
                <Icon
                  name="category"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                Category: <strong>Logistics</strong>
              </span>
              <span className="C-heading size-6 color-light mb-0">
                <Icon
                  name="calendar_month"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                Year of build: <strong>2015</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const CompanyDocuments = () => {
  return (
    <>
      <h4 className="C-heading size-6 bold mb-3 ">Photoes and Videos</h4>
      <div className="row g-3">
        <div className="col-md-3 col-sm-6 col-xs-12">
          <div className="card h-100">
            <PreviewImage
              src="/assets/images/about.jpg"
              alt="My Logo"
              style={{ width: "100%", maxHeight: "500px" }}
            />
            <div className="card-body p-2">
              <h5 className="C-heading size-6 gradient-text semiBold mb-1 text-truncate">
                Document title
              </h5>
              <p className="C-heading size-6 color-light mb-0">
                Some quick example text to build on the card.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 col-xs-12">
          <div className="card h-100">
            <PreviewImage
              src="/assets/images/about.jpg"
              alt="My Logo"
              style={{ width: "100%", maxHeight: "500px" }}
            />
            <div className="card-body p-2">
              <h5 className="C-heading size-6 gradient-text semiBold mb-1 text-truncate">
                Document title
              </h5>
              <p className="C-heading size-6 color-light mb-0">
                Some quick example text to build on the card.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 col-xs-12">
          <div className="card h-100">
            <PreviewImage
              src="/assets/images/about.jpg"
              alt="My Logo"
              style={{ width: "100%", maxHeight: "500px" }}
            />
            <div className="card-body p-2">
              <h5 className="C-heading size-6 gradient-text semiBold mb-1 text-truncate">
                Document title
              </h5>
              <p className="C-heading size-6 color-light mb-0">
                Some quick example text to build on the card.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 col-xs-12">
          <div className="card h-100">
            <PreviewImage
              src="/assets/images/about.jpg"
              alt="My Logo"
              style={{ width: "100%", maxHeight: "500px" }}
              preview={{
                destroyOnHidden: true,
                imageRender: () => (
                  <video
                    muted
                    width="70%"
                    controls
                    src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/file/A*uYT7SZwhJnUAAAAAAAAAAAAADgCCAQ"
                  />
                ),
                toolbarRender: () => null,
              }}
            />
            <div className="card-body p-2">
              <h5 className="C-heading size-6 gradient-text semiBold mb-1 text-truncate">
                Document title
              </h5>
              <p className="C-heading size-6 color-light mb-0">
                Some quick example text to build on the card.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const CompanyDetails = () => {
  return (
    <>
      <PublicLayout>
        <PageHeadingBanner
          heading="Moody's Corporation"
          currentPageTitle="List of companies"
        />
        <section className="section-padding small">
          <div className="container">
            <div className="row">
              <div className="col-12">
                {/* Logo and company title */}
                <div className="d-flex gap-3 mb-4">
                  <div className="p-3 border rounded-3 mb-3">
                    <Image
                      src="/assets/images/logo.png"
                      alt="My Logo"
                      width={160}
                      height={50}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <h3 className="C-heading size-4 color-dark mb-2 bold">
                      Moody's Corporation
                    </h3>
                    <div className="d-flex justify-content-start gap-2 align-items-center">
                      <div>
                        <Space>
                          <Icon name="location_on" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light mb-0">
                            London, UK
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
                          <span className="C-heading size-6 color-light mb-0">
                            Accounting / Finance
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
                          <Icon name="mail" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light mb-0">
                            info@nipunah.com
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
                      key: "companyEquipments",
                      label: "Equipments",
                      children: <CompanyEquipments />,
                    },
                    {
                      key: "companyJobs",
                      label: "Jobs",
                      children: <CompanyJobs />,
                    },
                    {
                      key: "companyDocs",
                      label: "Documants",
                      children: <CompanyDocuments />,
                    },
                  ]}
                  className="C-tab"
                />
              </div>
              <div className="col-md-4 col-sm-12">
                <div className="bg-white shadow-sm rounded-2 p-4">
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">
                        Primary industry:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-6 semiBold color-dark mb-0 text-right">
                        Marine Engineering
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">
                        Company size:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-6 semiBold color-dark mb-0 text-right">
                        1000
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">
                        Founded in:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-6 semiBold color-dark mb-0 text-right">
                        2015
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">
                        Turnover:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-6 semiBold color-dark mb-0 text-right">
                        $ 35M
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">
                        Business Location:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-6 semiBold color-dark mb-0 text-right">
                        London, UK
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">
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

export default CompanyDetails;
