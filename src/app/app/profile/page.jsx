"use client";

import React, { useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import ProfileDetails from "@/components/Profile/ProfileDetails";
import { PROFILE_SCHEMAS } from "@/components/Profile/profileSchemas";
import { setUser } from "@/store/slices/userSlice";
import {
  applyRolePermissionsToUser,
  saveUserSession,
  getIdFromStoredUser,
  updateUserDetailsByRole,
  fetchUserDetailsByRole,
} from "@/utilities/sessionUser";

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const user = useAppSelector((state) => state.user.user) || {};
  const role = String(user?.role || user?.type || "user").toLowerCase();
  const startInEditMode = String(searchParams?.get("edit") || "").toLowerCase() === "true";

  const sections = useMemo(() => {
    if (role === "company") return PROFILE_SCHEMAS.company;
    return PROFILE_SCHEMAS.user;
  }, [role]);

  const handleSave = useCallback(
    async (updated) => {
      const id = getIdFromStoredUser(user);
      if (!id) {
        throw new Error("Unable to update profile: user id not found.");
      }

      // 1) Update via role-based PUT
      await updateUserDetailsByRole({
        role,
        id,
        payload: updated,
      });

      // 2) Re-fetch latest data via role-based GET
      const latest = await fetchUserDetailsByRole({ role, id });

      // 3) Apply permissions keys and sync storage + Redux
      const merged = applyRolePermissionsToUser({
        ...user,
        ...latest,
      });
      saveUserSession(merged);
      dispatch(setUser(merged));
    },
    [dispatch, user, role]
  );

  return (
    <div className="bg-white rounded shadow-sm p-4" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Profile"
        subtitle="View and update your profile information."
      />
      <div className="mt-3">
        <ProfileDetails
          title={"Profile"}
          data={user}
          sections={sections}
          onSave={handleSave}
          startInEditMode={startInEditMode}
        />
      </div>
    </div>
  );
};

export default ProfilePage;

