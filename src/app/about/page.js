"use client";

import React, { useRef, useEffect, useState } from "react";
import PublicLayout from "@/layout/PublicLayout";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import Icon from "@/components/Icon";
import { map as _map } from "lodash-es";
import Image from "next/image";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import "./about-global.scss";
import { Carousel, Divider, Space } from "antd";

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
            <h2 className="C-heading size-4 extraBold color-dark text-center mb-5 font-family-creative">
              A Smarter Way to Connect the Maritime World
            </h2>
            <div className="row mb-5">
              <div className="col-md-4 col-sm-6 cl-xs-12">
                <Image
                  src="/assets/images/about-us.png"
                  alt="My Logo"
                  width={180}
                  height={60}
                  className="about-image img-thumbnail"
                />
              </div>
              <div
                className="col-md-8 col-sm-6 col-xs-12"
                style={{ position: "relative" }}
              >
                <div className="position-relative" style={{ zIndex: "1" }}>
                  <span className="C-heading size-6 mb-3">
                    <strong>Nipunah.com</strong> is not just a listing site —
                    it’s a specialized digital ecosystem built exclusively for
                    the maritime and ocean sectors.
                  </span>
                  <p className="C-heading size-6 mb-3">
                    Our platform unites a traditionally fragmented industry by
                    enabling verified companies, professionals, and institutions
                    to connect, collaborate, and grow — all in one trusted,
                    smart, and global space.
                  </p>
                  <p className="C-heading size-6 mb-3">
                    Whether you operate in shipping, ports, dredging, offshore
                    energy, marine technology, shipbuilding, tourism, training,
                    or regulation, Nipunah.com helps you showcase your services,
                    gain visibility, and build meaningful partnerships across
                    the globe.
                  </p>
                  <p className="C-heading size-5 mb-1 extraBold color-dark font-family-creative">
                    We help maritime businesses:
                  </p>

                  <div className="C-bulletList mb-3">
                    <ul>
                      <li>
                        <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                        <span className="C-heading color-dark size-6 mb-0 dont-break">
                          Be seen and trusted globally
                        </span>
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                        <span className="C-heading color-dark size-6 mb-0 dont-break">
                          Build reliable, long-term partnerships
                        </span>
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                        <span className="C-heading color-dark size-6 mb-0 dont-break">
                          Support sustainable and transparent supply chains
                        </span>
                      </li>
                    </ul>
                  </div>
                  <p className="C-heading size-5 mb-1 extraBold color-dark font-family-creative">
                    What makes us unique
                  </p>
                  <div className="C-bulletList mb-0">
                    <ul>
                      <li>
                        <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                        <span className="C-heading color-dark size-6 mb-0 dont-break">
                          Built exclusively for the maritime and ocean economy
                        </span>
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                        <span className="C-heading color-dark size-6 mb-0 dont-break">
                          All profiles are verified for credibility and trust
                        </span>
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                        <span className="C-heading color-dark size-6 mb-0 dont-break">
                          Smart filters, tags, and location-based search for
                          easy discovery
                        </span>
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                        <span className="C-heading color-dark size-6 mb-0 dont-break">
                          Live 24/7, 365 days — your business is always working
                        </span>
                      </li>
                      <li>
                        <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                        <span className="C-heading color-dark size-6 mb-0 dont-break">
                          Driven by visibility, trust, and global growth
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
            <div className="row g-2">
              <div className="col-md-4 col-sm-6 col-xs-12">
                <div className="bg-white shadow rounded p-4 d-flex flex-column gap-3 text-center">
                  <div className="image-with-pattern">
                    <Icon name="workspace_premium" />
                  </div>
                  <span className="C-heading size-5 color-dark extraBold mb-0 font-family-creative">
                    Our Vision
                  </span>
                  <span
                    className="C-heading size-6 mb-0"
                    style={{ minHeight: "80px" }}
                  >
                    To become the most trusted global hub for maritime
                    discovery, connection, and innovation.
                  </span>
                </div>
              </div>
              <div className="col-md-4 col-sm-6 col-xs-12">
                <div className="bg-white shadow rounded p-4 d-flex flex-column gap-3 text-center">
                  <div className="image-with-pattern">
                    <Icon name="diversity_4" />
                  </div>
                  <span className="C-heading size-5 color-dark extraBold mb-0 font-family-creative">
                    Our Mission
                  </span>
                  <span
                    className="C-heading size-6 mb-0"
                    style={{ minHeight: "80px" }}
                  >
                    To digitally connect and empower the global blue economy.
                  </span>
                </div>
              </div>
              <div className="col-md-4 col-sm-6 col-xs-12">
                <div className="bg-white shadow rounded p-4 d-flex flex-column gap-3 text-center">
                  <div className="image-with-pattern">
                    <Icon name="approval_delegation" />
                  </div>
                  <span className="C-heading size-5 color-dark extraBold mb-0 font-family-creative">
                    Business process
                  </span>
                  <span
                    className="C-heading size-6 mb-0"
                    style={{ minHeight: "80px" }}
                  >
                    An activity or set of activities that can accomplish a
                    specific organizational goal.
                  </span>
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
        <section className="counter-section bg-white shadow rounded-sm py-5">
          <div className="container">
            <div className="row g-0">
              <div className="col-md-4 col-sm-6 col-xs-12">
                <div className="countWrapper bordered d-flex flex-column align-items-center">
                  <Icon name="monitoring" />
                  <Counter to={200} />
                  <span className="c-heading size-5 color-white semiBold mb-0 font-family-creative">
                    Companies registered
                  </span>
                </div>
              </div>
              <div className="col-md-4 col-sm-6 col-xs-12">
                <div className="countWrapper bordered d-flex flex-column align-items-center">
                  <Icon name="group_add" />
                  <Counter to={100} />
                  <span className="c-heading size-5 color-white semiBold mb-0 font-family-creative">
                    Experts working
                  </span>
                </div>
              </div>
              <div className="col-md-4 col-sm-6 col-xs-12">
                <div className="countWrapper d-flex flex-column align-items-center">
                  <Icon name="globe" />
                  <Counter to={20} />
                  <span className="c-heading size-5 color-white semiBold mb-0 font-family-creative">
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
          <div className="container ">
            <h2 className="C-heading size-4 extraBold color-dark font-family-creative text-center mb-5">
              What You Can Do on Nipunah.com
            </h2>
            <div className="process-loader mb-5">
              <div className="process-card d-flex flex-column bg-white rounded shadow p-3">
                <div className="countCircle bordered mb-3 bg-color-primary">
                  01
                </div>
                <span className="C-heading size-6 extraBold color-dark mb-3 text-center font-family-creative">
                  List your company
                </span>
                <span className="C-heading size-6 mb-0 text-center">
                  List your company and showcase your services
                </span>
              </div>

              <div className="process-card d-flex flex-column bg-white rounded shadow p-3">
                <div className="countCircle bordered mb-3 text-center bg-color-primary">
                  02
                </div>
                <span className="C-heading size-6 extraBold color-dark mb-3 text-center font-family-creative">
                  Highlight certifications
                </span>
                <span className="C-heading size-6 mb-0 text-center">
                  Highlight certifications, projects, and areas of expertise
                </span>
              </div>

              <div className="process-card d-flex flex-column bg-white rounded shadow p-3">
                <div className="countCircle bordered mb-3 bg-color-primary">
                  03
                </div>
                <span className="C-heading size-6 extraBold color-dark mb-3 text-center font-family-creative">
                  Receive direct inquiries
                </span>
                <span className="C-heading size-6 mb-0 text-center">
                  Receive direct inquiries from clients, collaborators, and
                  partners
                </span>
              </div>

              <div className="process-card d-flex flex-column bg-white rounded shadow p-3">
                <div className="countCircle bordered mb-3 bg-color-primary">
                  04
                </div>
                <span className="C-heading size-6 extraBold color-dark mb-3 text-center font-family-creative">
                  Discover new suppliers
                </span>
                <span className="C-heading size-6 mb-0 text-center">
                  Discover new suppliers or subcontractors using smart filters
                  and geo-location
                </span>
              </div>

              <div className="process-card d-flex flex-column bg-white rounded shadow p-3">
                <div className="countCircle bordered mb-3 bg-color-primary">
                  05
                </div>
                <span className="C-heading size-6 extraBold color-dark mb-3 text-center font-family-creative">
                  Stay visible 24/7
                </span>
                <span className="C-heading size-6 mb-0 text-center">
                  Stay visible 24/7 with a profile that works year-round —
                  anywhere in the world
                </span>
              </div>
            </div>

            <h2 className="C-heading size-5 extraBold color-dark mb-2 text-center font-family-creative">
              Who We Serve
            </h2>
            <span className="C-heading size-6 mb-4 text-center">
              Nipunah.com supports every part of the maritime value chain. Our
              platform is built for:
            </span>
            <Carousel
              autoplay
              autoplaySpeed={4000}
              slidesToScroll={1}
              slidesToShow={3} // default (lg)
              draggable
              infinite={true}
              dots
              responsive={[
                {
                  breakpoint: 1024, // md
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                  },
                },
                {
                  breakpoint: 768, // sm
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                  },
                },
              ]}
            >
              <div className="sliderCard">
                <div className="cardIcon">
                  <Icon name="local_shipping" />
                </div>
                <div className="cardContent d-flex align-items-center">
                  <span className="C-heading size-6 bold mb-0">
                    Shipping & logistics companies
                  </span>
                </div>
              </div>
              <div className="sliderCard">
                <div className="cardIcon">
                  <Icon name="directions_boat" />
                </div>
                <div className="cardContent d-flex align-items-center">
                  <span className="C-heading size-6 bold mb-0">
                    Dredging contractors & marine service providers
                  </span>
                </div>
              </div>
              <div className="sliderCard">
                <div className="cardIcon">
                  <Icon name="anchor" />
                </div>
                <div className="cardContent d-flex align-items-center">
                  <span className="C-heading size-6 bold mb-0">
                    Port & terminal operators
                  </span>
                </div>
              </div>
              <div className="sliderCard">
                <div className="cardIcon">
                  <Icon name="energy_savings_leaf" />
                </div>
                <div className="cardContent d-flex align-items-center">
                  <span className="C-heading size-6 bold mb-0">
                    Offshore energy & renewables firms
                  </span>
                </div>
              </div>
              <div className="sliderCard">
                <div className="cardIcon">
                  <Icon name="anchor" />
                </div>
                <div className="cardContent d-flex align-items-center">
                  <span className="C-heading size-6 bold mb-0">
                    Shipbuilders & marine equipment suppliers
                  </span>
                </div>
              </div>
              <div className="sliderCard">
                <div className="cardIcon">
                  <Icon name="engineering" />
                </div>
                <div className="cardContent d-flex align-items-center">
                  <span className="C-heading size-6 bold mb-0">
                    Marine tech developers & innovators
                  </span>
                </div>
              </div>
              <div className="sliderCard">
                <div className="cardIcon">
                  <Icon name="model_training" />
                </div>
                <div className="cardContent d-flex align-items-center">
                  <span className="C-heading size-6 bold mb-0">
                    Training institutions & regulatory bodies
                  </span>
                </div>
              </div>
              <div className="sliderCard">
                <div className="cardIcon">
                  <Icon name="directions_boat" />
                </div>
                <div className="cardContent d-flex align-items-center">
                  <span className="C-heading size-6 bold mb-0">
                    Ocean tourism operators & government agencies
                  </span>
                </div>
              </div>
            </Carousel>
          </div>
        </section>
      </motion.div>
    </PublicLayout>
  );
};

export default AboutPage;
