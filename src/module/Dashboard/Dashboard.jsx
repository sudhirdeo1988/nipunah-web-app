"use client";

import React, { useState, useCallback } from "react";
import { Button } from "antd";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import DashboardWidgets from "./components/DashboardWidgets";
import DashboardDateRangePicker from "./components/DateRangePicker";
import AnalyticsOverview from "./components/AnalyticsOverview";
import BecomeExpertModal from "@/components/BecomeExpertModal";
import { useDashboard } from "./hooks/useDashboard";

const BECOME_EXPERT_API = "/api/experts/become-expert";

const Dashboard = () => {
  const { dateRange, loading, stats, handleDateRangeChange } = useDashboard();
  const [becomeExpertOpen, setBecomeExpertOpen] = useState(false);

  const openBecomeExpert = useCallback(() => setBecomeExpertOpen(true), []);
  const closeBecomeExpert = useCallback(() => setBecomeExpertOpen(false), []);

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Dashboard"
        subtitle="Overview of platform activity, stats and analytics"
        children={
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span className="color-light semiBold">Date Range:</span>
            <DashboardDateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
            />
            <Button type="primary" onClick={openBecomeExpert}>
              Become an expert
            </Button>
          </div>
        }
      />

      <BecomeExpertModal
        open={becomeExpertOpen}
        onCancel={closeBecomeExpert}
        submitApiUrl={BECOME_EXPERT_API}
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
