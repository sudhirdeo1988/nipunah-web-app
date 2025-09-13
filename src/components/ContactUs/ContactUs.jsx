import React from "react";
import Icon from "components/Icon/Icon";
import { Space } from "antd";
import "./ContactUs.scss";

const ContactUs = ({ hideInfo }) => {
  return (
    <section className={`c-contactUs ${hideInfo ? "" : "section-padding"}`}>
      <div className="container">
        <div className="row">
          {!hideInfo && (
            <div className="col-xl-6 col-lg-6 col-md-12 mt-4">
              <div className="section-title text-left mb-3">
                <div className="sub-title gradient-wrapper">
                  <span>CONTACT US</span>
                </div>
                <h2 className="C-heading size-4 extraBold gradient-text">
                  To Make Requests for <br />
                  Further Information, <br />
                  Contact Us
                </h2>
              </div>
              <div className="contact-us-content pt-4 mt-3">
                <div className="infu-box d-flex align-items-center">
                  <Space size={12}>
                    <div className="icon">
                      <Icon name="add_call" style={{ color: "#1890ff" }} />
                    </div>
                    <div className="infu">
                      <span className="C-heading size-xs semiBold mb-2">
                        Call Us
                      </span>
                      <h3 className="C-heading size-6 semiBold color-dark mb-0">
                        +69 009 494 094
                      </h3>
                    </div>
                  </Space>
                </div>
                <div className="infu-box d-flex align-items-center">
                  <Space size={12}>
                    <div className="icon">
                      <Icon name="distance" style={{ color: "#1890ff" }} />
                    </div>
                    <div className="infu">
                      <span className="C-heading size-xs semiBold mb-2">
                        Our Location
                      </span>
                      <h3 className="C-heading size-6 semiBold color-dark mb-0">
                        Lorem Ipsum is simply dummy text, <br /> of the printing
                        and
                      </h3>
                    </div>
                  </Space>
                </div>
                <div className="infu-box d-flex align-items-center">
                  <Space size={12}>
                    <div className="icon">
                      <Icon name="mail" style={{ color: "#1890ff" }} />
                    </div>
                    <div className="infu">
                      <span className="C-heading size-xs semiBold mb-2">
                        Mail Us
                      </span>
                      <h3 className="C-heading size-6 semiBold color-dark mb-0">
                        test@gmail.com
                      </h3>
                    </div>
                  </Space>
                </div>
              </div>
            </div>
          )}
          <div className={`${!hideInfo ? "col-xl-6 col-lg-6" : ""} col-md-12`}>
            <div className="contact-right mt-4 mt-md-0">
              <h3 className="C-heading size-5 extraBold color-dark text-center mb-4">
                Send Your Message!
              </h3>
              <form action="#" id="contact-form" method="POST">
                <div className="row g-3">
                  <div className="col-lg-6">
                    <div className="form-clt">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder="Your Name"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-clt">
                      <input
                        type="text"
                        name="email"
                        id="email"
                        placeholder="Email Address"
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-clt">
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>

                  <div className="col-lg-12">
                    <div className="form-clt-big form-clt">
                      <textarea
                        name="message"
                        id="message"
                        placeholder="Write a Message"
                      ></textarea>
                    </div>
                  </div>
                  <div className="col-lg-12 text-right">
                    <button type="submit" className="C-button is-filled">
                      Send Your Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
