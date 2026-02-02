import React from "react";
import EquipmentCard from "../EquipmentCard";

const TopJobsSection = () => {
  return (
    <section className="section-padding">
      <div className="container">
        <div className="section-title text-center mb-3">
          <div className="sub-title gradient-wrapper">
            <span>TOP MARINE EQUIPMENTS</span>
          </div>
          <h2 className="C-heading size-4 color-white extraBold color-dark pb-3 font-family-creative">
          Explore Maritime Equipment for Your Business
          </h2>
        </div>
        <div className="row g-3">
          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <EquipmentCard />
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <EquipmentCard />
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <EquipmentCard />
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <EquipmentCard />
          </div>
          <div className="col-12 text-center mt-4">
            <button className="C-button is-filled">See all</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopJobsSection;
