"use client";

import React, { useRef, useEffect, useState } from "react";
import PublicLayout from "@/layout/PublicLayout";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import Icon from "@/components/Icon";
import { map as _map } from "lodash-es";
import Image from "next/image";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import "./about-global.scss";

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const Counter = ({ from = 0, to = 200, duration = 2 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true }); // trigger once when in viewport
  const [displayValue, setDisplayValue] = useState(from);

  // motion value and spring for smooth animation
  const count = useMotionValue(from);
  const spring = useSpring(count, { duration: duration * 1000 });

  useEffect(() => {
    if (isInView) {
      count.set(to); // animate to target
    }
  }, [isInView, to, count]);

  useEffect(() => {
    // update displayed value as spring changes
    return spring.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [spring]);

  return (
    <motion.span ref={ref} className="count">
      {displayValue}
      <sup>+</sup>
    </motion.span>
  );
};

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
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            variants={fadeInUp}
          >
            <h2 className="C-heading size-4 extraBold gradient-text text-center mb-5">
              A Smarter Way to Connect the Maritime World
            </h2>
            <div className="row mb-5">
              <div className="col-md-4 col-sm-6 cl-xs-12">
                <Image
                  src="/assets/images/about.jpg"
                  alt="My Logo"
                  width={180}
                  height={60}
                  className="about-image"
                />
              </div>
              <div
                className="col-md-8 col-sm-6 cl-xs-12 p-4"
                style={{ position: "relative" }}
              >
                <div className="position-relative" style={{ zIndex: "1" }}>
                  <span className="C-heading size-6 mb-3 semiBold">
                    <strong>Nipunah.com</strong> is not just a listing site —
                    it’s a specialized digital ecosystem built exclusively for
                    the maritime and ocean sectors.
                  </span>
                  <p className="C-heading size-6 mb-3 semiBold">
                    Our platform unites a traditionally fragmented industry by
                    enabling verified companies, professionals, and institutions
                    to connect, collaborate, and grow — all in one trusted,
                    smart, and global space.
                  </p>
                  <p className="C-heading size-6 mb-3 semiBold">
                    Whether you operate in shipping, ports, dredging, offshore
                    energy, marine technology, shipbuilding, tourism, training,
                    or regulation, Nipunah.com helps you showcase your services,
                    gain visibility, and build meaningful partnerships across
                    the globe.
                  </p>
                  <p className="C-heading size-6 mb-1 bold color-dark">
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

                <Image
                  src="/assets/images/pattern-2.webp"
                  alt="My Logo"
                  width={180}
                  height={60}
                  className="pattern-image"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            variants={fadeInUp}
          >
            <div className="row">
              <div className="col-md-4 col-sm-6 col-xs-12">
                <div className="featureBox d-flex flex-column gap-3 align-items-center">
                  <span className="C-heading size-5 color-dark extraBold mb-0">
                    Our Vision
                  </span>
                  <span
                    className="C-heading size-6 semiBold mb-0"
                    style={{ minHeight: "80px" }}
                  >
                    To become the most trusted global hub for maritime
                    discovery, connection, and innovation.
                  </span>
                  <div className="iconSection">
                    <Icon name="workspace_premium" />
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-sm-6 col-xs-12">
                <div className="featureBox d-flex flex-column gap-3 align-items-center">
                  <span className="C-heading size-5 color-dark extraBold mb-0">
                    Our Mission
                  </span>
                  <span
                    className="C-heading size-6 semiBold mb-0"
                    style={{ minHeight: "80px" }}
                  >
                    To digitally connect and empower the global blue economy.
                  </span>
                  <div className="iconSection">
                    <Icon name="diversity_4" />
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-sm-6 col-xs-12">
                <div className="featureBox d-flex flex-column gap-3 align-items-center">
                  <span className="C-heading size-5 color-dark extraBold mb-0">
                    Business process
                  </span>
                  <span
                    className="C-heading size-6 semiBold mb-0"
                    style={{ minHeight: "80px" }}
                  >
                    An activity or set of activities that can accomplish a
                    specific organizational goal.
                  </span>
                  <div className="iconSection">
                    <Icon name="approval_delegation" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Static about us section End */}

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        variants={fadeInUp}
      >
        <section className="counter-section">
          <div className="container">
            <div className="row g-0">
              <div className="col-md-4 col-sm-6 col-xs-12">
                <div className="countWrapper bordered d-flex flex-column align-items-center">
                  <Icon name="monitoring" />
                  <Counter to={200} />
                  <span className="c-heading size-xs mb-0 color-light">
                    Companies registered
                  </span>
                </div>
              </div>
              <div className="col-md-4 col-sm-6 col-xs-12">
                <div className="countWrapper bordered d-flex flex-column align-items-center">
                  <Icon name="group_add" />
                  <Counter to={100} />
                  <span className="c-heading size-xs mb-0 color-light">
                    Experts working
                  </span>
                </div>
              </div>
              <div className="col-md-4 col-sm-6 col-xs-12">
                <div className="countWrapper d-flex flex-column align-items-center">
                  <Icon name="globe" />
                  <Counter to={20} />
                  <span className="c-heading size-xs mb-0 color-light">
                    Countries we serve
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        variants={fadeInUp}
      >
        <section className="section-padding pattern-3">
          <div className="container">
            <div className="row">
              <div className="col-md-4 col-sm-6 col-xs-12">
                <h2 className="C-heading size-5 extraBold gradient-text text-center mb-4">
                  What You Can Do on Nipunah.com
                </h2>
                <div className="row align-items-center py-3">
                  <div className="col-2">
                    <div className="countCircle bordered">01</div>
                  </div>
                  <div className="col-9">
                    <span className="C-heading size-6 extraBold color-dark mb-1">
                      List your company
                    </span>
                    <span className="C-heading size-xs semiBold mb-0">
                      List your company and showcase your services
                    </span>
                  </div>
                </div>
                <div className="row align-items-center py-3">
                  <div className="col-2">
                    <div className="countCircle bordered">02</div>
                  </div>
                  <div className="col-9">
                    <span className="C-heading size-6 extraBold color-dark mb-1">
                      Highlight certifications
                    </span>
                    <span className="C-heading size-6 mb-0">
                      Highlight certifications, projects, and areas of expertise
                    </span>
                  </div>
                </div>
                <div className="row align-items-center py-3">
                  <div className="col-2">
                    <div className="countCircle bordered">03</div>
                  </div>
                  <div className="col-10">
                    <span className="C-heading size-6 extraBold color-dark mb-1">
                      Receive direct inquiries
                    </span>
                    <span className="C-heading size-6 mb-0">
                      Receive direct inquiries from clients, collaborators, and
                      partners
                    </span>
                  </div>
                </div>
                <div className="row align-items-center py-3">
                  <div className="col-2">
                    <div className="countCircle bordered">04</div>
                  </div>
                  <div className="col-10">
                    <span className="C-heading size-6 extraBold color-dark mb-1">
                      Discover new suppliers
                    </span>
                    <span className="C-heading size-6 mb-0">
                      Discover new suppliers or subcontractors using smart
                      filters and geo-location
                    </span>
                  </div>
                </div>
                <div className="row align-items-center py-3">
                  <div className="col-2">
                    <div className="countCircle">05</div>
                  </div>
                  <div className="col-10">
                    <span className="C-heading size-6 extraBold color-dark mb-1">
                      Stay visible 24/7
                    </span>
                    <span className="C-heading size-6 mb-0">
                      Stay visible 24/7 with a profile that works year-round —
                      anywhere in the world
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-sm-6 col-xs-12">
                <h2 className="C-heading size-5 extraBold gradient-text mb-4">
                  Who We Serve
                </h2>
                <span className="C-heading size-6 mb-3">
                  Nipunah.com supports every part of the maritime value chain.
                  Our platform is built for:
                </span>
                <div className="C-bulletList">
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
              </div>
              <div className="col-md-4 col-sm-6 col-xs-12">
                <h2 className="C-heading size-5 extraBold mb-4 gradient-text">
                  What makes us unique
                </h2>

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
      </motion.div>
    </PublicLayout>
  );
};

export default AboutPage;
