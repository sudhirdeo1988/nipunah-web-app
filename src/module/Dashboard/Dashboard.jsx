"use client";

import React from "react";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import DashboardWidgets from "./components/DashboardWidgets";
import DashboardDateRangePicker from "./components/DateRangePicker";
import AnalyticsOverview from "./components/AnalyticsOverview";
import { useDashboard } from "./hooks/useDashboard";

const Dashboard = () => {
  const { dateRange, loading, stats, handleDateRangeChange } = useDashboard();

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Dashboard"
        subtitle="Overview of platform activity, stats and analytics"
        children={
          <div className="d-flex align-items-center gap-3">
            <span className="color-light semiBold">Date Range:</span>
            <DashboardDateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          </div>
        }
      />

      {/* Stats Widgets */}
      <div className="p-4">
        <DashboardWidgets stats={stats} loading={loading} />
        <AnalyticsOverview dateRange={dateRange} />
      </div>
    </div>
  );
};

export default Dashboard;
