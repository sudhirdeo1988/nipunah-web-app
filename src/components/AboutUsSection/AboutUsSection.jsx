import React from "react";
import Icon from "components/Icon/Icon";

import "./AboutUsSection.scss";

const AboutUsSection = () => {
  return (
    <section className="choose-us-wrapper choose-us-1 section-padding">
      <div className="shape">
        <img src={"assets/images/world.png"} alt="" />
      </div>
      <div className="container">
        <div className="row">
          <div className="col-xl-6 col-lg-12 col-md-12">
            <div
              className="choose-us-images wow fadeInLeft"
              data-wow-delay="300ms"
            >
              <img src="https://placehold.co/590x705" alt="" />
              <div className="shape-img">
                <img src={"assets/images/animated-circle.png"} alt="" />
              </div>
            </div>
          </div>
          <div
            className="col-xl-6 col-lg-8 col-md-12 mt-3 wow fadeInRight"
            data-wow-delay="300ms"
          >
            <div className="choose-us-content ms-xl-4 ps-xl-1">
              <div className="section-title mb-4">
                <div className="sub-title">
                  <span>WHY CHOOSE US</span>
                </div>
                <h2 className="C-heading size-4 extraBold color-dark">
                  Why Choose Nipunah?
                </h2>
              </div>
              <p className="text-center text-md-start C-heading size-6 mb-2 dont-break">
                <b className="color-primary">Industry-First Platform:</b> The
                only maritime-specific platform combining company discovery,
                profiles, analytics, and expert directories.
              </p>
              <p className="text-center text-md-start C-heading size-6 mb-2 dont-break">
                <b className="color-primary">Verified & Trusted:</b> Every
                profile goes through verification to ensure reliability and
                transparency.
              </p>
              <p className="text-center text-md-start C-heading size-6 mb-2 dont-break">
                <b className="color-primary">Maritime-Tailored:</b> Built around
                maritime-specific categories, services, and equipment for
                precision matching.
              </p>
              <p className="text-center text-md-start C-heading size-6 mb-2 dont-break">
                <b className="color-primary">Global & Multilingual:</b> Designed
                for international reach with multilingual access and
                geo-targeted visibility.
              </p>
              <p className="text-center text-md-start C-heading size-6 mb-2 dont-break">
                <b className="color-primary">Focused on Results:</b> Helps you
                connect with the right clients, partners, and opportunities
                faster.
              </p>
              <p className="text-center text-md-start C-heading size-6 mb-2 dont-break">
                <b className="color-primary">Customer-Centric:</b> Designed for
                ease of use, quick navigation, and responsive support.
              </p>
              <div className="icon-box d-flex mt-4 pt-3 text-center text-md-start">
                <div className="single-icon-box">
                  <div className="icon mb-2">
                    <Icon name="language" />
                  </div>
                  <h4 className="C-heading size-6 extraBold color-dark mb-2">
                    Mission
                  </h4>
                  <p className="C-heading size-6 mb-0 dont-break">
                    To connect and digitize the maritime supply chain through a
                    verified, user-friendly ecosystem.
                  </p>
                </div>
                <div className="single-icon-box">
                  <div className="icon mb-2">
                    <Icon name="workspace_premium" />
                  </div>
                  <h4 className="C-heading size-6 extraBold color-dark mb-2">
                    Vision
                  </h4>
                  <p className="C-heading size-6 mb-0 dont-break">
                    To build the most trusted global platform where the world’s
                    maritime services find each other.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
