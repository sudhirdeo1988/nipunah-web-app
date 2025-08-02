import React from "react";

import "./BrandSlider.scss";

const BrandSlider = () => {
  return (
    <section className="c-brandWrapper">
      <div className="container">
        <div className="row mb-5">
          <div className="col-xl-8 col-lg-8 col-md-12 mt-3">
            <div className="choose-us-content">
              <div className="section-title mb-4">
                <div className="sub-title">
                  <span>PARTNER WITH US</span>
                </div>
                <h2 className="C-heading size-4 extraBold color-dark">
                  Partnering with Nipunah
                </h2>
              </div>
              <div className="mb-4">
                <p className="C-heading size-6 extraBold mb-1 dont-break color-primary">
                  Partnering with Nipunah: Amplifying Global Maritime Excellence
                  Together
                </p>
                <p className="C-heading size-6 semiBold mb-3 dont-break">
                  At Nipunah, we’re more than just a platform - we’re a gateway
                  to a globally connected, digitally enabled maritime ecosystem.
                  Our partnership journey is built on shared values, mutual
                  trust, and a bold vision: to connect, digitize, and elevate
                  the maritime industry through collaboration, innovation, and
                  verified expertise.
                </p>
                <p className="C-heading size-6 extraBold mb-1 dont-break color-primary">
                  Why Our Partners Choose Nipunah
                </p>
                <p className="C-heading size-6 semiBold mb-2 dont-break">
                  In a fragmented industry, partners like you are seeking a
                  reliable, purpose-driven platform that not only understands
                  your challenges but actively works to solve them. Nipunah was
                  born out of that very need — to bring together dredging,
                  shipping, ports, marine engineering, equipment suppliers,
                  regulatory consultants, and training institutions under one
                  secure digital roof.
                </p>
                <p className="C-heading size-6 extraBold mb-1 dont-break color-primary">
                  Our partners are those who recognized:
                </p>
                <p className="C-heading size-6 semiBold mb-1 dont-break">
                  The need for <b>verified visibility</b> in a global
                  marketplace.
                </p>
                <p className="C-heading size-6 semiBold mb-1 dont-break">
                  The importance of being part of a{" "}
                  <b>trusted, authenticated network</b>.
                </p>
                <p className="C-heading size-6 semiBold mb-1 dont-break">
                  The value of <b>data-driven connections</b> that lead to real
                  opportunities — not just listings.
                </p>
              </div>
            </div>
          </div>
          <div className="col-xl-4 col-lg-12 col-md-12">
            <div className="choose-us-images">
              <img src="https://placehold.co/400x520" alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSlider;
