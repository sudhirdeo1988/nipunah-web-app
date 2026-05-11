"use client";

import React from "react";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import DashboardWidgets from "./components/DashboardWidgets";
import DashboardDateRangePicker from "./components/DateRangePicker";
import AnalyticsOverview from "./components/AnalyticsOverview";
import { useDashboard } from "./hooks/useDashboard";
import { useAppSelector } from "@/store/hooks";
import ProfileDetails from "@/components/Profile/ProfileDetails";
import { PROFILE_SCHEMAS } from "@/components/Profile/profileSchemas";

const Dashboard = () => {
  const router = useRouter();
  const { dateRange, loading, stats, handleDateRangeChange } = useDashboard();
  const user = useAppSelector((state) => state.user.user);
  const reduxRole = useAppSelector((state) => state.user.role);
  const role = String(reduxRole || user?.role || user?.type || "").toLowerCase();
  const isUserRole = role === "user";
  const isExpertRole = role === "expert";
  const showProfileCard = isUserRole || isExpertRole;
  const showAnalyticsOverview = user?.dashboard_analytics_overview !== false;

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Dashboard"
        subtitle="Overview of platform activity, stats and analytics"
        children={
          <div className="d-flex align-items-center gap-3 flex-wrap">
            {!isUserRole && (
              <>
                <span className="color-light semiBold">Date Range:</span>
                <DashboardDateRangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                />
              </>
            )}
            {isUserRole && (
              <Button
                type="primary"
                onClick={() => router.push("/app/dashboard/upgrade-expert")}
              >
                Upgrade to expert profile (Free)
              </Button>
            )}
          </div>
        }
      />

      {/* Stats Widgets */}
      <div className="p-4">
        {showProfileCard && (
          <div className="mb-4">
            <ProfileDetails
              title="Profile"
              data={user || {}}
              sections={PROFILE_SCHEMAS.user}
              showEditButton={false}
              headerAction={
                <Button onClick={() => router.push("/app/profile?edit=true")}>
                  Edit profile
                </Button>
              }
            />
          </div>
        )}
        <DashboardWidgets stats={stats} loading={loading} />
        {showAnalyticsOverview && <AnalyticsOverview dateRange={dateRange} />}
      </div>
    </div>
  );
};

export default Dashboard;
