"use client";

import React, { lazy, Suspense } from "react";
import ContactUs from "@/components/ContactUs";
import Icon from "@/components/Icon";
import { Space } from "antd";
import { motion } from "framer-motion";

const PageHeadingBanner = lazy(() =>
  import("@/components/StaticAtoms/PageHeadingBanner")
);
const PublicLayout = lazy(() => import("@/layout/PublicLayout"));

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const ContactPage = () => {
  return (
    <Suspense fallback={<></>}>
      <PublicLayout>
        <PageHeadingBanner
          heading="Contact Us"
          currentPageTitle="List of companies"
        />
        <section className="section-padding">
          <div className="container">
            <div className="row">
              <div className="col-md-4 col-sm-12">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  variants={fadeInUp}
                >
                  <h4 className="C-heading size-5 extraBold color-dark mb-3">
                    Get In Touch
                  </h4>
                  <p className="C-heading size-6 mb-4">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s
                  </p>
                  <span className="C-heading size-5 mb-4 gradient-text bold">
                    Chromium Co , 25 Silicon Road, London D04 89GR
                  </span>
                  <span className="C-heading size-6 mb-3 bold">
                    <Space>
                      <Icon name="call" />
                      +27 34 66 2455-198
                    </Space>
                  </span>
                  <span className="C-heading size-6 mb-3 bold">
                    <Space>
                      <Icon name="mail" />
                      Support@abc.Com
                    </Space>
                  </span>
                  <span className="C-heading size-6 mb-4 bold">
                    <Space>
                      <Icon name="chat_bubble" />
                      Info@abc.com
                    </Space>
                  </span>

                  <div className="social-icon d-flex align-items-center mt-3">
                    <button className="C-settingButton is-clean">
                      <i className="bi bi-facebook color-light"></i>
                    </button>
                    <button className="C-settingButton is-clean">
                      <i className="bi bi-linkedin color-light"></i>
                    </button>
                    <button className="C-settingButton is-clean">
                      <i className="bi bi-twitter color-light"></i>
                    </button>
                    <button className="C-settingButton is-clean">
                      <i className="bi bi-instagram color-light"></i>
                    </button>
                  </div>
                </motion.div>
              </div>
              <div className="col-md-8 col-sm-12">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  variants={fadeInUp}
                >
                  <ContactUs hideInfo />
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </PublicLayout>
    </Suspense>
  );
};

export default ContactPage;
