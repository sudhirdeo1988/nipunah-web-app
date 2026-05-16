"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import ProfileDetails from "@/components/Profile/ProfileDetails";
import ExpertCareerSection from "@/components/Profile/ExpertCareerSection";
import BecomeExpertModal from "@/components/BecomeExpertModal";
import { PROFILE_SCHEMAS } from "@/components/Profile/profileSchemas";
import { setUser } from "@/store/slices/userSlice";
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
import { expertBasicInfoFormValues } from "@/utilities/expertProfileNormalize";
import { useNormalizedProfileUser } from "@/hooks/useNormalizedProfileUser";
import { useAuth } from "@/utilities/AuthContext";
import { Button } from "antd";

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuth();
  const { user, role, isExpert, reduxUser } = useNormalizedProfileUser();
  const startInEditMode = String(searchParams?.get("edit") || "").toLowerCase() === "true";
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

  const expertFormInitialValues = useMemo(() => {
    if (!isExpert) return null;
    const basic = expertBasicInfoFormValues(user);
    return {
      ...basic,
      workExperience: user.workExperience?.length
        ? user.workExperience
        : undefined,
      education: user.education?.length ? user.education : undefined,
      skills: user.skills?.length ? user.skills : undefined,
    };
  }, [isExpert, user]);

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

  const syncExpertAfterSave = useCallback(
    async (payload) => {
      const id = getIdFromStoredUser(reduxUser);
      if (!id) {
        throw new Error("Unable to update profile: user id not found.");
      }

      const base = reduxUser || {};
      await updateUserDetailsByRole({
        role: "expert",
        id,
        payload: { ...base, ...payload },
      });

      const latest = await fetchUserDetailsByRole({ role: "expert", id });
      const merged = applyRolePermissionsToUser({
        ...base,
        ...(latest || {}),
      });
      saveUserSession(merged);
      dispatch(setUser(merged));
    },
    [dispatch, reduxUser]
  );

  const handleSave = useCallback(
    async (updated) => {
      const id = getIdFromStoredUser(reduxUser);
      if (!id) {
        throw new Error("Unable to update profile: user id not found.");
      }

      await updateUserDetailsByRole({
        role,
        id,
        payload: updated,
      });

      const latest = await fetchUserDetailsByRole({ role, id });
      const merged = applyRolePermissionsToUser({
        ...(reduxUser || {}),
        ...(latest || {}),
      });
      saveUserSession(merged);
      dispatch(setUser(merged));
      router.push("/app/dashboard");
    },
    [dispatch, reduxUser, role, router]
  );

  const handleExpertProfileSave = useCallback(
    async (payload) => {
      await syncExpertAfterSave(payload);
      router.push("/app/dashboard");
    },
    [syncExpertAfterSave, router]
  );

  const handleExpertCareerSave = useCallback(
    async (careerPayload) => {
      await syncExpertAfterSave(careerPayload);
    },
    [syncExpertAfterSave]
  );

  const goToDashboard = useCallback(() => {
    router.push("/app/dashboard");
  }, [router]);

  return (
    <div className="bg-white rounded shadow-sm p-4" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Profile"
        subtitle="View and update your profile information."
      />
      <div className="mt-3">
        {isExpert && startInEditMode ? (
          <BecomeExpertModal
            variant="page"
            includeBasicInfo
            profileData={user}
            initialValues={expertFormInitialValues}
            onCancel={goToDashboard}
            onSubmit={handleExpertProfileSave}
            title="Edit profile"
            okText="Save profile"
            closeAfterSubmit={false}
            successMessage="Profile updated successfully."
          />
        ) : (
          <>
            <ProfileDetails
              title="Profile"
              data={user}
              sections={sections}
              onSave={isExpert ? undefined : handleSave}
              startInEditMode={!isExpert && startInEditMode}
              showEditButton={!isExpert}
              headerAction={
                isExpert ? (
                  <Button
                    type="primary"
                    onClick={() => router.push("/app/profile?edit=true")}
                  >
                    Edit profile
                  </Button>
                ) : null
              }
            />
            {isExpert && (
              <ExpertCareerSection data={user} onSave={handleExpertCareerSave} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
