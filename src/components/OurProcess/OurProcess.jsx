import React from "react";
import "./OurProcess.scss";

const OurProcess = () => {
  return (
    <section className="c-ourProcess section-padding">
      <div className="shape">
        <img className="shape-1" src={"assets/images/shape-1.png"} alt="" />
        <img className="shape-2" src={"assets/images/shape-2.png"} alt="" />
        <img className="shape-3" src={"assets/images/shape-3.png"} alt="" />
        <img
          className="shape-4 d-none d-xxl-block"
          src={"assets/images/shape-4.png"}
          alt=""
        />
        <img
          className="shape-5 d-none d-xxl-block"
          src={"assets/images/shape-5.png"}
          alt=""
        />
      </div>
      <div className="container">
        <div className="section-title text-center">
          <div className="sub-title">
            <span className="color-light bold">WORKING PROCESS</span>
          </div>
          <h2 className="C-heading size-4 color-white extraBold color-dark">
            We ensure transparency, real-time updates, and quality control at
            every stage.
          </h2>
        </div>
        <div className="process-items d-grid justify-content-between">
          <div className="single-process-item text-center mt-xxl-5 pt-xxl-4">
            <div className="icon">01</div>
            <div className="image mb-3">
              <img src="https://placehold.co/372x333" alt="" />
            </div>
            <h4 className="C-heading size-5 color-white extraBold mb-2">
              Register & Verify
            </h4>
            <p className="C-heading size-xs color-white px-3 dont-break semiBold mb-0">
              Create your profile and submit business credentials for
              verification.
            </p>
          </div>
          <div className="single-process-item text-center">
            <div className="icon">02</div>
            <div className="image mb-3">
              <img src="https://placehold.co/372x333" alt="" />
            </div>
            <h4 className="C-heading size-5 color-white extraBold mb-2">
              List Your Services
            </h4>
            <p className="C-heading size-xs color-white px-3 dont-break semiBold mb-0">
              Showcase your offerings, certifications, past projects, and
              contact details.
            </p>
          </div>
          <div className="single-process-item text-center mt-xxl-5 pt-xxl-4">
            <div className="icon">03</div>
            <div className="image mb-3">
              <img src="https://placehold.co/372x333" alt="" />
            </div>
            <h4 className="C-heading size-5 color-white extraBold mb-2">
              Get Discovered
            </h4>
            <p className="C-heading size-xs color-white px-3 dont-break semiBold mb-0">
              Appear in search results when potential clients look for maritime
              services.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurProcess;
