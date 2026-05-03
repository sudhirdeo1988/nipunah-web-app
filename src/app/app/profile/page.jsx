"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import ProfileDetails from "@/components/Profile/ProfileDetails";
import { PROFILE_SCHEMAS } from "@/components/Profile/profileSchemas";
import { setUser } from "@/store/slices/userSlice";
import { Spin } from "antd";
import {
  applyRolePermissionsToUser,
  saveUserSession,
  loadUserSession,
  getIdFromStoredUser,
  updateUserDetailsByRole,
  fetchUserDetailsByRole,
  fetchCurrentUserMe,
  applyUserIdFromCookieIfMissing,
} from "@/utilities/sessionUser";
import { useAuth } from "@/utilities/AuthContext";

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuth();
  const reduxUser = useAppSelector((state) => state.user.user);
  const user = reduxUser || {};
  const role = String(reduxUser?.role || reduxUser?.type || "user").toLowerCase();
  const startInEditMode = String(searchParams?.get("edit") || "").toLowerCase() === "true";
  const hasRenderableProfileData = Boolean(
    user?.first_name ||
      user?.last_name ||
      user?.email ||
      user?.name ||
      user?.title
  );

  const sections = useMemo(() => {
    if (role === "company") return PROFILE_SCHEMAS.company;
    return PROFILE_SCHEMAS.user;
  }, [role]);

  // If Redux user has null id but `user_id` cookie was set at login, sync id into Redux + storage
  useEffect(() => {
    const patched = applyUserIdFromCookieIfMissing(user);
    if (patched === user) return;
    const merged = applyRolePermissionsToUser(patched);
    saveUserSession(merged);
    dispatch(setUser(merged));
  }, [user, dispatch]);

  useEffect(() => {
    const hydrateProfileOnRefresh = async () => {
      if (!isLoggedIn) return;
      if (hasRenderableProfileData) return;

      let sessionUser = reduxUser || loadUserSession() || {};
      sessionUser = applyUserIdFromCookieIfMissing(sessionUser);

      let resolvedRole = String(sessionUser?.role || sessionUser?.type || "").toLowerCase();
      let resolvedId = getIdFromStoredUser(sessionUser);

      if (!resolvedRole || !resolvedId) {
        try {
          const me = await fetchCurrentUserMe();
          sessionUser = applyUserIdFromCookieIfMissing({
            ...(sessionUser || {}),
            ...(me || {}),
          });
          resolvedRole = String(sessionUser?.role || sessionUser?.type || "").toLowerCase();
          resolvedId = getIdFromStoredUser(sessionUser);
        } catch {
          return;
        }
      }

      if (!resolvedRole || !resolvedId) return;

      try {
        const latest = await fetchUserDetailsByRole({
          role: resolvedRole,
          id: resolvedId,
        });
        const merged = applyRolePermissionsToUser({
          ...sessionUser,
          ...(latest || {}),
        });
        saveUserSession(merged);
        dispatch(setUser(merged));
      } catch {
        // keep existing fallback UI if API fails
      }
    };

    hydrateProfileOnRefresh();
  }, [dispatch, hasRenderableProfileData, isLoggedIn, reduxUser]);

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
      router.push("/app/dashboard");
    },
    [dispatch, user, role, router]
  );

  return (
    <div className="bg-white rounded shadow-sm p-4" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Profile"
        subtitle="View and update your profile information."
      />
      <div className="mt-3">
        {startInEditMode && !hasRenderableProfileData ? (
          <div className="py-5 text-center">
            <Spin size="large" />
          </div>
        ) : (
          <ProfileDetails
            title={"Profile"}
            data={user}
            sections={sections}
            onSave={handleSave}
            startInEditMode={startInEditMode}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

