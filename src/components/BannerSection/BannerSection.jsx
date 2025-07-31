import React from "react";
import "./BannerSection.scss";

const BannerSection = () => {
  return (
    <section className="c-topBanner mx-xl-5">
      <div className="shape">
        <img className="shape-1" src="assets/img/world.png" alt="" />
      </div>
      <div className="hero-bg bg-cover"></div>
      <div className="container">
        <div className="row">
          <div className="col-xl-6 col-lg-6 col-md-12 col-12">
            <div className="hero-content pe-xl-3 text-lg-start text-center tp-play-up">
              <h1 className="color-dark dont-break extraBold">
                Powering the Maritime Supply Chain: <br /> Discover. Connect.
                Collaborate.
              </h1>
              <p className="C-heading size-6 semiBold color-dark mb-3 dont-break font-family-secondary">
                Nipunah.com is the world's first integrated maritime industry
                platform connecting global stakeholders across shipping,
                dredging, ports, offshore, and marine services. Verified
                listings, digital visibility, and trusted partnerships all in
                one secure.
              </p>

              <p className="C-heading size-6 semiBold color-dark mb-3 dont-break font-family-secondary">
                Our purpose is to digitize and unify the maritime supply chain
                in a secure, verified, and globally accessible network. Whether
                you're a contractor, equipment supplier, or service provider,
                Nipunah.com helps you get discovered, trusted, and connected.
              </p>
              <div className="hero-button mt-4">
                <button className="C-button is-filled">Explore More</button>
              </div>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 col-md-12 col-12 wow fadeInUp">
            <div className="hero-image">
              <img src="https://placehold.co/590x590" alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
