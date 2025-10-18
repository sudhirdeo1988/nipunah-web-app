"use client";

import React from "react";
import DashboardWidgets from "./components/DashboardWidgets";
import DashboardDateRangePicker from "./components/DateRangePicker";
import AnalyticsOverview from "./components/AnalyticsOverview";
import { useDashboard } from "./hooks/useDashboard";

const Dashboard = () => {
  const { dateRange, loading, stats, handleDateRangeChange } = useDashboard();

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      {/* Header Section */}
      <div className="p-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <span className="C-heading size-5 color-light mb-2 extraBold">
            Dashboard
          </span>
          <div className="d-flex align-items-center gap-3">
            <span className="color-light semiBold">Date Range:</span>
            <DashboardDateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          </div>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="p-4">
        <DashboardWidgets stats={stats} loading={loading} />
        <AnalyticsOverview dateRange={dateRange} />
      </div>
    </div>
  );
};

export default Dashboard;
