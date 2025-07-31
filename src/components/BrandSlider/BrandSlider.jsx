import React from "react";
import { Carousel } from "antd";
import "./BrandSlider.scss";
import Image from "next/image";

const BrandSlider = () => {
  // Slider Settings
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    autoplay: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 920,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  return (
    <section className="c-brandWrapper">
      <div className="container">
        <div className="brand-inner text-center text-lg-start">
          <h3 className="C-heading size-4 extraBold color-dark mb-4">
            Partnering with Nipunah
          </h3>
          <div className="mb-4">
            <p className="C-heading size-6 extraBold mb-1 dont-break color-primary">
              Partnering with Nipunah: Amplifying Global Maritime Excellence
              Together
            </p>
            <p className="C-heading size-6 semiBold mb-3 dont-break">
              At Nipunah, we’re more than just a platform - we’re a gateway to a
              globally connected, digitally enabled maritime ecosystem. Our
              partnership journey is built on shared values, mutual trust, and a
              bold vision: to connect, digitize, and elevate the maritime
              industry through collaboration, innovation, and verified
              expertise.
            </p>
            <p className="C-heading size-6 extraBold mb-1 dont-break color-primary">
              Why Our Partners Choose Nipunah
            </p>
            <p className="C-heading size-6 semiBold mb-2 dont-break">
              In a fragmented industry, partners like you are seeking a
              reliable, purpose-driven platform that not only understands your
              challenges but actively works to solve them. Nipunah was born out
              of that very need — to bring together dredging, shipping, ports,
              marine engineering, equipment suppliers, regulatory consultants,
              and training institutions under one secure digital roof.
            </p>
            <p className="C-heading size-6 extraBold mb-1 dont-break color-primary">
              Our partners are those who recognized:
            </p>
            <p className="C-heading size-6 semiBold mb-1 dont-break">
              The need for <b>verified visibility</b> in a global marketplace.
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
          <h3 className="C-heading size-5 extraBold color-dark mb-4">
            Our Global partners
          </h3>
          <div className=" mt-4 pt-3">
            <Carousel {...settings} className="swiper-wrapper">
              <div className="brand-logo">
                <Image
                  src="/assets/images/01.png"
                  alt="My Logo"
                  width={200}
                  height={60}
                />
              </div>

              <div className="brand-logo">
                <Image
                  src="/assets/images/01.png"
                  alt="My Logo"
                  width={60}
                  height={60}
                />
              </div>

              <div className="brand-logo">
                <Image
                  src="/assets/images/01.png"
                  alt="My Logo"
                  width={60}
                  height={60}
                />
              </div>

              <div className="brand-logo">
                <Image
                  src="/assets/images/01.png"
                  alt="My Logo"
                  width={60}
                  height={60}
                />
              </div>

              <div className="brand-logo">
                <Image
                  src="/assets/images/01.png"
                  alt="My Logo"
                  width={60}
                  height={60}
                />
              </div>

              <div className="brand-logo">
                <Image
                  src="/assets/images/01.png"
                  alt="My Logo"
                  width={60}
                  height={60}
                />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSlider;
