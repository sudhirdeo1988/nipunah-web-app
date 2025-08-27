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
          <h2 className="C-heading size-5 color-white extraBold color-dark pb-3">
            We ensure transparency, real-time updates, and quality control at
            every stage.
          </h2>
        </div>
        <div className="row">
          <div className="col-lg-3 col-sm-6 col-xs-12 align-items-center">
            <div className="d-flex flex-column gap-4 process-items-card align-items-center">
              <div className="image border">
                <Icon name="format_list_numbered" />
              </div>
              <div className="text-center">
                <h4 className="C-heading size-6 bold mb-3 color-dark">
                  List Company
                </h4>
                <p className="C-heading size-6 mb-0">
                  Create your profile and add services, equipment, and products
                  offered.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6 col-xs-12 align-items-center">
            <div className="d-flex flex-column  gap-4 process-items-card align-items-center">
              <div className="image border">
                <Icon name="beenhere" />
              </div>
              <div className="text-center">
                <h4 className="C-heading size-6 bold mb-3 color-dark">
                  Get Verified
                </h4>
                <p className="C-heading size-6 mb-0">
                  Provide authentic details to build trust and boost
                  credibility.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6 col-xs-12 align-items-center">
            <div className="d-flex flex-column gap-4 process-items-card align-items-center">
              <div className="image border">
                <Icon name="person_search" />
              </div>
              <div className="text-center">
                <h4 className="C-heading size-6 bold mb-3 color-dark">
                  Be Discovered Globally
                </h4>
                <p className="C-heading size-6 mb-0">
                  Increase visibility, attract leads, and showcase your company
                  worldwide.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6 col-xs-12 align-items-center">
            <div className="d-flex flex-column gap-4 process-items-card align-items-center">
              <div className="image border">
                <Icon name="person_check" />
              </div>
              <div className="text-center">
                <h4 className="C-heading size-6 bold mb-3 color-dark">
                  List Company
                </h4>
                <p className="C-heading size-6 mb-0">
                  Create your profile and add services, equipment, and products
                  offered.
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
