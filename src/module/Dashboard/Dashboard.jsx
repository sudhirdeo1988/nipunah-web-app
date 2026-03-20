"use client";

import React, { useState, useCallback } from "react";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import DashboardWidgets from "./components/DashboardWidgets";
import DashboardDateRangePicker from "./components/DateRangePicker";
import AnalyticsOverview from "./components/AnalyticsOverview";
import BecomeExpertModal from "@/components/BecomeExpertModal";
import { useDashboard } from "./hooks/useDashboard";
import { useAppSelector } from "@/store/hooks";
import { useLogout } from "@/hooks/useLogout";
import ProfileDetails from "@/components/Profile/ProfileDetails";
import { PROFILE_SCHEMAS } from "@/components/Profile/profileSchemas";

const BECOME_EXPERT_API = "/api/experts/become-expert";

const Dashboard = () => {
  const router = useRouter();
  const { dateRange, loading, stats, handleDateRangeChange } = useDashboard();
  const [becomeExpertOpen, setBecomeExpertOpen] = useState(false);
  const { logout } = useLogout();
  const user = useAppSelector((state) => state.user.user);
  const reduxRole = useAppSelector((state) => state.user.role);
  const role = String(reduxRole || user?.role || user?.type || "").toLowerCase();
  const isUserRole = role === "user";
  const showAnalyticsOverview = user?.dashboard_analytics_overview !== false;

  const openBecomeExpert = useCallback(() => setBecomeExpertOpen(true), []);
  const closeBecomeExpert = useCallback(() => setBecomeExpertOpen(false), []);

  const handleBecomeExpertSubmit = useCallback(
    async (payload) => {
      const requestPayload = {
        ...payload,
        role: "expert",
      };

      const res = await fetch(BECOME_EXPERT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to submit become expert request."
        );
      }

      // User should be logged out after successful role upgrade request
      logout();
    },
    [logout]
  );

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
              <Button type="primary" onClick={openBecomeExpert}>
                Become an expert
              </Button>
            )}
          </div>
        }
      />

      {isUserRole && (
        <BecomeExpertModal
          open={becomeExpertOpen}
          onCancel={closeBecomeExpert}
          onSubmit={handleBecomeExpertSubmit}
        />
      )}

      {/* Stats Widgets */}
      <div className="p-4">
        {isUserRole && (
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
