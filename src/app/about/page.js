import React from "react";
import PublicLayout from "@/layout/PublicLayout";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import Icon from "@/components/Icon";
import { map as _map } from "lodash-es";
import Partners from "@/components/Partners";

const data = [
  {
    id: 1,
    title: "Global Visibility for Maritime Services",
    subTitle:
      "Join the fastest-growing digital network for marine contractors, consultants, and suppliers. Increase your reach and unlock opportunities across the globe.",
    icon: "globe",
  },
  {
    id: 2,
    title: "Verified & Trusted Industry Listings",
    subTitle:
      " Every profile is vetted for authenticity to ensure secure, professional collaborations.",
    icon: "verified_user",
    // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
  },
  {
    id: 3,
    title: "Digitizing Marine Procurement & Collaboration",
    subTitle:
      "Streamline sourcing, reduce costs, and boost transparency in service discovery and procurement.",
    icon: "mimo",
    // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
  },
  {
    id: 4,
    title: "A Hub for All Maritime Sectors",
    subTitle:
      "From dredging and shipbuilding to offshore energy and marine tourism — we connect every link in the maritime value chain.",
    icon: "settings",
    // list: ['Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text', 'Lorem Ipsum is dummy text']
  },
];

const AboutPage = () => {
  return (
    <PublicLayout>
      <PageHeadingBanner
        heading="About Nipunah"
        currentPageTitle="About Nipunah"
      />

      {/* Static about us section Start */}
      <section className="C-about-wrapper section-padding">
        <div className="container">
          <div className="row">
            <div className="col-xl-6 col-lg-12">
              <div className="about-images">
                <img
                  className="shape-2"
                  src="/assets/images/shape-net.png"
                  alt=""
                />

                <div className="image-1">
                  <img src="https://placehold.co/510x610" alt="img" />
                </div>
                <div className="image-2">
                  <img src="https://placehold.co/280x280" alt="img" />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-12">
              <div className="choose-us-content ms-xl-4 ps-xl-1">
                <div className="section-title mb-4">
                  <div className="sub-title">
                    <span>NIPUNAH</span>
                  </div>
                  <h2 className="C-heading size-4 extraBold color-dark">
                    Powering the Maritime Supply Chain
                  </h2>
                </div>
                <p className="C-heading size-6 mb-3 dont-break">
                  Nipunah.com is the worlds first integrated maritime industry
                  platform connecting global stakeholders across shipping,
                  dredging, ports, offshore, and marine services. Verified
                  listings, digital visibility, and trusted partnerships all in
                  one secure.
                </p>
                <p className="C-heading size-6 mb-3 dont-break">
                  Our purpose is to digitize and unify the maritime supply chain
                  in a secure, verified, and globally accessible network.
                  Whether youre a contractor, equipment supplier, or service
                  provider, Nipunah.com helps you get discovered, trusted, and
                  connected.
                </p>
                <p className="C-heading size-6 mb-3 dont-break">
                  Our purpose is to digitize and unify the maritime supply chain
                  in a secure, verified, and globally accessible network.
                  Whether youre a contractor, equipment supplier, or service
                  provider, Nipunah.com helps you get discovered, trusted, and
                  connected.
                </p>

                <div className="C-bulletList">
                  <ul>
                    <li>
                      <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                      <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                        Nipunah.com is the worlds first integrated maritime
                        industry platform
                      </span>
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                      <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                        Nipunah.com is the worlds first integrated maritime
                        industry platform connecting
                      </span>
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
                      <span className="C-heading semiBold color-dark size-6 mb-0 dont-break">
                        Nipunah.com is the worlds first integrated maritime
                        industry platform connecting
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Static about us section End */}

      {/* cards Start */}
      <section className="coloredSection section-padding">
        <div className="shape">
          <img class="shape-1" src="assets/images/shape-21.png" alt="" />
          <img class="shape-2" src="assets/images/shape-11.png" alt="" />
          <img class="shape-3" src="assets/images/shape-22.png" alt="" />
        </div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="section-title mb-4 text-center">
                <div className="sub-title">
                  <span>SERVICES</span>
                </div>
                <h2 className="C-heading size-4 extraBold color-dark">
                  Few of our top services
                </h2>
              </div>
            </div>
          </div>
          <div className="row g-2">
            {_map(data, (item, index) => {
              return (
                <div
                  className="col-lg-3 col-md-4 col-sm-2 col-xs-1"
                  key={index}
                >
                  <div className="single-feature-item text-center">
                    <div className="icon" style={{ margin: "0 auto" }}>
                      <Icon name={item?.icon || "mimo"} />
                    </div>
                    <h4 className="C-heading size-6 dont-break is- mgb-0 color-dark font-family-primary">
                      {item?.title}
                    </h4>
                    <p className="C-heading size-xs dont-break is-animated mb-3 font-family-primary">
                      {item?.subTitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* cards End */}
      </section>
      <Partners />
    </PublicLayout>
  );
};

export default AboutPage;
