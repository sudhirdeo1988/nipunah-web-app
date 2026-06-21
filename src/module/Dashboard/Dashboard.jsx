"use client";

import React from "react";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import ProfileDetails from "@/components/Profile/ProfileDetails";
import ExpertCareerSection from "@/components/Profile/ExpertCareerSection";
import { PROFILE_SCHEMAS } from "@/components/Profile/profileSchemas";
import { useNormalizedProfileUser } from "@/hooks/useNormalizedProfileUser";
import { ROUTES } from "@/constants/routes";

const Dashboard = () => {
  const router = useRouter();
  const { user, role, isExpert: isExpertRole } = useNormalizedProfileUser();
  const isUserRole = role === "user";
  const showProfileCard = isUserRole || isExpertRole;
  const showAdminCompanyPlaceholder = !isUserRole && !isExpertRole;

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Dashboard"
        subtitle="Overview of your account and activity"
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
                <Button
                  type="primary"
                  className="C-button is-filled"
                  onClick={() => router.push(ROUTES.PRIVATE.PROFILE_EDIT)}
                >
                  Edit Profile
                </Button>
              }
            />
            {isExpertRole && <ExpertCareerSection data={user || {}} />}
          </div>
        )}
        {showAdminCompanyPlaceholder ? (
          <p className="C-heading size-6 color-light mb-0 text-center py-5">
            To be decided what to show here
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;
