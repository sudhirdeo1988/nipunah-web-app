"use client";

import React from "react";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import DashboardWidgets from "./components/DashboardWidgets";
import AnalyticsOverview from "./components/AnalyticsOverview";
import { useDashboard } from "./hooks/useDashboard";
import ProfileDetails from "@/components/Profile/ProfileDetails";
import ExpertCareerSection from "@/components/Profile/ExpertCareerSection";
import { PROFILE_SCHEMAS } from "@/components/Profile/profileSchemas";
import { useNormalizedProfileUser } from "@/hooks/useNormalizedProfileUser";

const Dashboard = () => {
  const router = useRouter();
  const { loading, stats } = useDashboard();
  const { user, role, isExpert: isExpertRole } = useNormalizedProfileUser();
  const isUserRole = role === "user";
  const showProfileCard = isUserRole || isExpertRole;
  const showAnalyticsOverview =
    !isUserRole &&
    !isExpertRole &&
    user?.dashboard_analytics_overview !== false;

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Dashboard"
        subtitle="Overview of platform activity, stats and analytics"
      />

      <div className="p-4">
        {showProfileCard && (
          <div className="mb-4">
            <ProfileDetails
              title="Profile"
              data={user || {}}
              sections={isExpertRole ? PROFILE_SCHEMAS.expert : PROFILE_SCHEMAS.user}
              showEditButton={false}
              headerAction={
                <Button onClick={() => router.push("/app/profile?edit=true")}>
                  Edit profile
                </Button>
              }
            />
            {isExpertRole && (
              <ExpertCareerSection data={user || {}} />
            )}
          </div>
        )}
        <DashboardWidgets stats={stats} loading={loading} />
        {showAnalyticsOverview && <AnalyticsOverview />}
      </div>
    </div>
  );
};

export default Dashboard;
