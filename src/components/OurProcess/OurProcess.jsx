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
                List Your Profile
                </h4>
                <p className="C-heading size-6 mb-0">
                Create your profile and add services, equipment, and products you offer.
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
                Platform Verification
                </h4>
                <p className="C-heading size-6 mb-0">
                Listed details are reviewed and verified by the platform to build profile trust.
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
                Increase visibility, attract global leads, and collaborate worldwide.
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
