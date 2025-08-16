import React from "react";
import PublicLayout from "@/layout/PublicLayout";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import Icon from "@/components/Icon";
import { map as _map } from "lodash-es";
import Partners from "@/components/Partners";
import { Divider, Space } from "antd";

const data = [
  {
    id: 1,
    title: "Global Visibility for Maritime Services",
    subTitle:
      "Join the fastest-growing digital network for marine contractors, consultants, and suppliers. Increase your reach and unlock opportunities across the globe.",
    icon: "globe",
  },
  {
    id: 2,
    title: "Verified & Trusted Industry Listings",
    subTitle:
      " Every profile is vetted for authenticity to ensure secure, professional collaborations.",
    icon: "verified_user",
    // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
  },
  {
    id: 3,
    title: "Digitizing Marine Procurement & Collaboration",
    subTitle:
      "Streamline sourcing, reduce costs, and boost transparency in service discovery and procurement.",
    icon: "mimo",
    // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
  },
  {
    id: 4,
    title: "A Hub for All Maritime Sectors",
    subTitle:
      "From dredging and shipbuilding to offshore energy and marine tourism — we connect every link in the maritime value chain.",
    icon: "settings",
    // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
  },
];

const AboutPage = () => {
  return (
    <PublicLayout>
      <PageHeadingBanner
        heading="About Nipunah"
        currentPageTitle="About Nipunah"
      />

      {/* Static about us section Start */}
      <section className="C-about-wrapper section-padding">
        <div className="container">
          <div className="row">
            <div className="col-xl-6 col-lg-12">
              <div className="about-images">
                <img
                  className="shape-2"
                  src="/assets/images/shape-net.png"
                  alt=""
                />

                <div className="image-1">
                  <img src="https://placehold.co/510x610" alt="img" />
                </div>
                <div className="image-2">
                  <img src="https://placehold.co/280x280" alt="img" />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-12">
              <div className="choose-us-content ms-xl-4 ps-xl-1">
                <div className="section-title mb-2">
                  <div className="sub-title">
                    <span>NIPUNAH</span>
                  </div>
                  <h2 className="C-heading size-5 extraBold color-dark">
                    A Smarter Way to Connect the Maritime World
                  </h2>
                </div>
                <p className="C-heading size-6 mb-3 dont-break">
                  Nipunah.com is not just a listing site — it’s a specialized
                  digital ecosystem built exclusively for the maritime and ocean
                  sectors.
                </p>
                <p className="C-heading size-6 mb-3 dont-break">
                  Our platform unites a traditionally fragmented industry by
                  enabling verified companies, professionals, and institutions
                  to connect, collaborate, and grow — all in one trusted, smart,
                  and global space.
                </p>
                <p className="C-heading size-6 mb-3 dont-break">
                  Whether you operate in shipping, ports, dredging, offshore
                  energy, marine technology, shipbuilding, tourism, training, or
                  regulation, Nipunah.com helps you showcase your services, gain
                  visibility, and build meaningful partnerships across the
                  globe.
                </p>

                <h2 className="C-heading size-6 extraBold color-dark mb-2">
                  <Space>
                    <i className="bi bi-award-fill color-secondary"></i>
                    Our Vision
                  </Space>
                </h2>
                <p className="C-heading size-6 mb-3 dont-break">
                  To become the most trusted global hub for maritime discovery,
                  connection, and innovation.
                </p>

                <h2 className="C-heading size-6 extraBold color-dark mb-2">
                  <Space>
                    <i className="bi bi-shield-fill-check color-secondary"></i>
                    Our Purpose
                  </Space>
                </h2>
                <p className="C-heading size-6 mb-1 dont-break">
                  To digitally connect and empower the global blue economy.
                </p>
                <p className="C-heading size-6 mb-1 dont-break">
                  We help maritime businesses:
                </p>

                <div className="C-bulletList mb-0">
                  <ul>
                    <li>
                      <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                      <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                        Be seen and trusted globally
                      </span>
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                      <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                        Build reliable, long-term partnerships
                      </span>
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                      <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                        Support sustainable and transparent supply chains
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Static about us section End */}

      <section className="c-cardsWrapper section-padding">
        <div className="shape">
          <img
            className="shape-1"
            src={"assets/images/shape-5-black.png"}
            alt=""
          />
          <img className="shape-2" src={"assets/images/shape-12.png"} alt="" />
        </div>
        <div className="container">
          <div className="section-title mb-2 text-center">
            <div className="sub-title">
              <span>NIPUNAH</span>
            </div>
            <h2 className="C-heading size-5 extraBold color-dark">
              What You Can Do on Nipunah.com
            </h2>
          </div>
          <div className="row mt-4 mb-4">
            <div className="col-xl-3 col-lg-6 col-md-6">
              <div className="signle-process-item pe-xl-4">
                <img
                  className="arrow-shape-1"
                  src="assets/images/shape-6-arrow.png"
                  alt=""
                />
                <div className="icons">
                  <div className="icon-1">
                    <Icon name="format_list_numbered" />
                  </div>
                  <div className="icon-2">01</div>
                </div>
                <h4 className="C-heading size-5 extraBold color-dark mb-2">
                  List your company
                </h4>
                <p className="C-heading size-6 dont-break color-dark mb-0">
                  List your company and showcase your services
                </p>
              </div>
            </div>
            <div
              className="col-xl-3 col-lg-6 col-md-6 mt-xl-5 "
              data-wow-delay="400ms"
            >
              <div className="signle-process-item pe-xl-3 ps-xl-2 ">
                <img
                  className="arrow-shape-2"
                  src="assets/images/shape-7-arrow.png"
                  alt=""
                />
                <div className="icons">
                  <div className="icon-1">
                    <Icon name="psychology" />
                  </div>
                  <div className="icon-2">02</div>
                </div>
                <h4 className="C-heading size-5 extraBold color-dark mb-2">
                  Highlight Skills
                </h4>
                <p className="C-heading size-6 dont-break color-dark mb-0">
                  Highlight certifications, projects, and areas of expertise
                </p>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 ">
              <div className="signle-process-item ps-xl-3 pe-xl-2">
                <img
                  className="arrow-shape-1"
                  src="assets/images/shape-6-arrow.png"
                  alt=""
                />
                <div className="icons">
                  <div className="icon-1">
                    <Icon name="order_approve" />
                  </div>
                  <div className="icon-2">03</div>
                </div>
                <h4 className="C-heading size-5 extraBold color-dark mb-2">
                  Receive Inqueries
                </h4>
                <p className="C-heading size-6 dont-break color-dark mb-0">
                  Receive direct inquiries from clients, collaborators, and
                  partners, Discover new suppliers or subcontractors using smart
                  filters and geo-location
                </p>
              </div>
            </div>
            <div
              className="col-xl-3 col-lg-6 col-md-6 mt-xl-5 "
              data-wow-delay="400ms"
            >
              <div className="signle-process-item ps-xl-4">
                <div className="icons">
                  <div className="icon-1">
                    <Icon name="support_agent" />
                  </div>
                  <div className="icon-2">04</div>
                </div>
                <h4 className="C-heading size-5 extraBold color-dark mb-2">
                  visible 24/7
                </h4>
                <p className="C-heading size-6 dont-break color-dark mb-0">
                  Stay visible 24/7 with a profile that works year-round —
                  anywhere in the world
                </p>
              </div>
            </div>
          </div>
          <Divider />
          <div className="row">
            <div className="col-md-6 col-sm-12">
              <div className="section-title mb-3">
                <h2 className="C-heading size-5 extraBold color-dark">
                  Who We Serve
                </h2>
              </div>
              <span className="C-heading size-6 mb-3">
                Nipunah.com supports every part of the maritime value chain. Our
                platform is built for:
              </span>
              <div className="C-bulletList mb-3">
                <ul>
                  <li>
                    <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                    <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                      Shipping & logistics companies
                    </span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                    <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                      Dredging contractors & marine service providers
                    </span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                    <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                      Port & terminal operators
                    </span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                    <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                      Offshore energy & renewables firms
                    </span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                    <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                      Shipbuilders & marine equipment suppliers
                    </span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                    <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                      Marine tech developers & innovators
                    </span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                    <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                      Training institutions & regulatory bodies
                    </span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                    <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                      Ocean tourism operators & government agencies
                    </span>
                  </li>
                </ul>
              </div>
              <span className="C-heading size-6 mb-3 dont-break">
                Whether you're offering services, solutions, technology, or
                infrastructure, Nipunah.com helps you connect with verified
                clients, partners, and collaborators worldwide.
              </span>
            </div>
            <div className="col-md-6 col-sm-12">
              <div className="section-title mb-3">
                <h2 className="C-heading size-5 extraBold color-dark">
                  What makes us unique
                </h2>
              </div>
              <div className="C-bulletList mb-0">
                <ul>
                  <li>
                    <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                    <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                      Built exclusively for the maritime and ocean economy
                    </span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                    <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                      All profiles are verified for credibility and trust
                    </span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                    <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                      Smart filters, tags, and location-based search for easy
                      discovery
                    </span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                    <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                      Live 24/7, 365 days — your business is always working
                    </span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                    <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                      Driven by visibility, trust, and global growth
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding pb-0">
        <div className="container">
          <div className="cta-section">
            <div className="row align-items-center">
              <div className="col-md-8 col-sm-12">
                <span className="C-heading size-5 extraBold color-dark mb-2 dont-break">
                  Get Listed. Get Discovered. Grow Globally
                </span>
                <span className="C-heading size-6 semiBold color-dark mb-2">
                  Nipunah.com is your gateway to new markets, trusted
                  connections, and global visibility.
                </span>
                <span className="C-heading size-6 semiBold color-dark mb-2 dont-break">
                  Join a platform where your profile is always active — helping
                  you connect with the right people, at the right time, anywhere
                  in the world.
                </span>
              </div>
              <div className="col-md-4 col-sm-12 text-center">
                <button className="C-button is-filled">Get Listed Now</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* cards Start */}
      <section className="coloredSection section-padding">
        <div className="shape">
          <img className="shape-1" src="assets/images/shape-21.png" alt="" />
          <img className="shape-2" src="assets/images/shape-11.png" alt="" />
          <img className="shape-3" src="assets/images/shape-22.png" alt="" />
        </div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="section-title mb-4 text-center">
                <div className="sub-title">
                  <span>SERVICES</span>
                </div>
                <h2 className="C-heading size-4 extraBold color-dark">
                  Few of our top services
                </h2>
              </div>
            </div>
          </div>
          <div className="row g-2">
            {_map(data, (item, index) => {
              return (
                <div
                  className="col-lg-3 col-md-4 col-sm-2 col-xs-1"
                  key={index}
                >
                  <div className="single-feature-item text-center">
                    <div className="icon" style={{ margin: "0 auto" }}>
                      <Icon name={item?.icon || "mimo"} />
                    </div>
                    <h4 className="C-heading size-6 dont-break is- mgb-0 color-dark font-family-primary">
                      {item?.title}
                    </h4>
                    <p className="C-heading size-xs dont-break is-animated mb-3 font-family-primary">
                      {item?.subTitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* cards End */}
      </section>
      <div className="mb-4">
        <Partners />
      </div>
    </PublicLayout>
  );
};

export default AboutPage;
