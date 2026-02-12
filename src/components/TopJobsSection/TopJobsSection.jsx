"use client";

import React, { useEffect } from "react";
import EquipmentCard from "../EquipmentCard";
import { useEquipment } from "@/module/Equipment/hooks/useEquipment";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

const TopJobsSection = () => {
  const router = useRouter();
  const { equipment, loading, error, fetchEquipment } = useEquipment();

  // Fetch top 4 equipment items on mount
  useEffect(() => {
    fetchEquipment({ page: 1, limit: 4 });
  }, [fetchEquipment]);

  // Show only first 4 items
  const topEquipment = equipment.slice(0, 4);

  // Hide entire section if loading, error, or empty
  if (loading || error || topEquipment.length === 0) {
    return null;
  }

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
          {topEquipment.map((item) => (
            <div key={item.id} className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <EquipmentCard data={item} />
            </div>
          ))}
        </div>
        <div className="col-12 text-center mt-4">
          <button 
            className="C-button is-filled"
            onClick={() => router.push(ROUTES?.PUBLIC?.EQUIPMENT)}
          >
            See all
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopJobsSection;
