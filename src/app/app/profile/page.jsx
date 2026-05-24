"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import ProfileDetails from "@/components/Profile/ProfileDetails";
import ExpertCareerSection from "@/components/Profile/ExpertCareerSection";
import { PROFILE_SCHEMAS } from "@/components/Profile/profileSchemas";
import { setUser } from "@/store/slices/userSlice";
import {
  applyRolePermissionsToUser,
  saveUserSession,
  loadUserSession,
  getIdFromStoredUser,
  fetchUserDetailsByRole,
  fetchCurrentUserMe,
  applyUserIdFromCookieIfMissing,
} from "@/utilities/sessionUser";
import { useNormalizedProfileUser } from "@/hooks/useNormalizedProfileUser";
import { useAuth } from "@/utilities/AuthContext";
import { Button } from "antd";
import { ROUTES } from "@/constants/routes";

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuth();
  const { user, role, isExpert, reduxUser } = useNormalizedProfileUser();
  const hasRenderableProfileData = Boolean(
    user?.first_name ||
      user?.last_name ||
      user?.email ||
      user?.name ||
      user?.title ||
      user?.username ||
      user?.contact_number
  );

  const sections = useMemo(() => {
    if (role === "company") return PROFILE_SCHEMAS.company;
    if (role === "expert") return PROFILE_SCHEMAS.expert;
    return PROFILE_SCHEMAS.user;
  }, [role]);

  // Legacy links: /app/profile?edit=true → dedicated edit route
  useEffect(() => {
    if (String(searchParams?.get("edit") || "").toLowerCase() === "true") {
      router.replace(ROUTES.PRIVATE.PROFILE_EDIT);
    }
  }, [searchParams, router]);

  // Sync cookie user id into Redux only — depend on reduxUser, not derived `user`.
  useEffect(() => {
    if (!reduxUser) return;
    const patched = applyUserIdFromCookieIfMissing(reduxUser);
    if (patched === reduxUser) return;
    const merged = applyRolePermissionsToUser(patched);
    saveUserSession(merged);
    dispatch(setUser(merged));
  }, [reduxUser, dispatch]);

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

  const goToEditProfile = useCallback(() => {
    router.push(ROUTES.PRIVATE.PROFILE_EDIT);
  }, [router]);

  return (
    <div className="bg-white rounded shadow-sm p-4" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Profile"
        subtitle="View and update your profile information."
      />
      <div className="mt-3">
        <ProfileDetails
          title="Profile"
          data={user}
          sections={sections}
          role={role}
          showEditButton={false}
          headerAction={
            <Button
              type="primary"
              className="C-button is-filled"
              onClick={goToEditProfile}
            >
              Edit Profile
            </Button>
          }
        />
        {isExpert && <ExpertCareerSection data={user} canEdit />}
      </div>
    </div>
  );
};

export default ProfilePage;
