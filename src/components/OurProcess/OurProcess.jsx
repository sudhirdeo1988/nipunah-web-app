import React from "react";
import "./OurProcess.scss";
import Icon from "../Icon";

const OurProcess = () => {
  return (
    <section className="c-ourProcess section-padding">
      <div className="container">
        <div className="section-title text-center mb-3">
          <div className="sub-title gradient-wrapper">
            <span>WORKING PROCESS</span>
          </div>
          <h2 className="C-heading size-4 color-white extraBold color-dark pb-3 font-family-creative">
          Providing end-to-end transparency, 
            <br /> real-time tracking, and assured quality at every stage.
          </h2>
        </div>

        <div className="row g-1">
          <div className="col-lg-4 col-sm-6 col-xs-12">
            <div className="process-items-card shadow-sm p-5 bg-white rounded text-center">
              <div className="arrow rounded-circle bg-white">
                <Icon name="keyboard_double_arrow_right" />
              </div>
              <div className="image-with-pattern">
                <Icon name="list_alt" />
              </div>
              <div className="text-center">
                <h4 className="C-heading size-5 semiBold color-dark mb-2 font-family-creative">
                List Your Company
                </h4>
                <p className="C-heading size-6 mb-0">
                Create a detailed Business (Company )profile with your services, equipment, and product offerings.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-sm-6 col-xs-12">
            <div className="process-items-card shadow-sm p-5 bg-white rounded text-center">
              <div className="arrow rounded-circle bg-white">
                <Icon name="keyboard_double_arrow_right" />
              </div>
              <div className="image-with-pattern">
                <Icon name="admin_panel_settings" />
              </div>
              <div className="text-center">
                <h4 className="C-heading size-5 semiBold color-dark mb-2 font-family-creative">
                  Get Verified
                </h4>
                <p className="C-heading size-6 mb-0">
                Increase visibility, attract qualified leads, and position your company for worldwide discovery.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-sm-6 col-xs-12">
            <div className="process-items-card shadow-sm p-5 bg-white rounded text-center">
              <div className="image-with-pattern">
                <Icon name="person_search" />
              </div>
              <div className="text-center">
                <h4 className="C-heading size-5 semiBold color-dark mb-2 font-family-creative">
                  Be Discovered Globally
                </h4>
                <p className="C-heading size-6 mb-0">
                  Increase visibility, attract leads, and showcase your company
                  worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurProcess;
