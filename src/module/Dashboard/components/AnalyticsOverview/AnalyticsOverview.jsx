"use client";

import React from "react";
import { Card } from "antd";
import Icon from "@/components/Icon";

const AnalyticsOverview = ({ dateRange }) => {
  return (
    <div className="mt-4">
      <Card
        style={{
          borderRadius: "12px",
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
        }}
      >
        <div className="text-center py-4">
          <Icon
            name="analytics"
            className="g-icon"
            style={{
              fontSize: "48px",
              color: "#5fa8d3",
              marginBottom: "16px",
            }}
          />
          <h4 className="C-heading size-4 color-dark mb-2 extraBold">
            Analytics Overview
          </h4>
          <p className="color-light mb-0">
            Data shown for the period: {dateRange[0]?.format("DD MMM YYYY")} -{" "}
            {dateRange[1]?.format("DD MMM YYYY")}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsOverview;
