"use client";

import React, { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/userSlice";
import BecomeExpertModal from "@/components/BecomeExpertModal";
import ExpertProfileFormLayout from "@/components/BecomeExpertModal/ExpertProfileFormLayout";
import ProfileDetails from "@/components/Profile/ProfileDetails";
import { PROFILE_SCHEMAS } from "@/components/Profile/profileSchemas";
import {
  expertBasicInfoFormValues,
  expertCareerFormValues,
} from "@/utilities/expertProfileNormalize";
import { useNormalizedProfileUser } from "@/hooks/useNormalizedProfileUser";
import {
  applyRolePermissionsToUser,
  saveUserSession,
  getIdFromStoredUser,
  updateUserDetailsByRole,
  fetchUserDetailsByRole,
} from "@/utilities/sessionUser";
import { ROUTES } from "@/constants/routes";

const ProfileEditPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, role, isExpert, reduxUser } = useNormalizedProfileUser();

  const sections = useMemo(() => {
    if (role === "company") return PROFILE_SCHEMAS.company;
    if (role === "expert") return PROFILE_SCHEMAS.expert;
    return PROFILE_SCHEMAS.user;
  }, [role]);

  const expertFormInitialValues = useMemo(() => {
    if (!isExpert) return null;
    return {
      ...expertBasicInfoFormValues(user),
      ...expertCareerFormValues(user),
    };
  }, [isExpert, user]);

  const goToProfileView = useCallback(() => {
    router.push(ROUTES.PRIVATE.PROFILE);
  }, [router]);

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

  const handleExpertProfileSave = useCallback(
    async (payload) => {
      await syncExpertAfterSave(payload);
      router.push(ROUTES.PRIVATE.PROFILE);
    },
    [syncExpertAfterSave, router]
  );

  const handleUserProfileSave = useCallback(
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
      router.push(ROUTES.PRIVATE.PROFILE);
    },
    [dispatch, reduxUser, role, router]
  );

  if (isExpert) {
    return (
      <ExpertProfileFormLayout
        title="Edit Profile"
        subtitle="Update your basic information, experience, skills, and education."
        onBack={goToProfileView}
        backLabel="Back to Profile"
      >
        <BecomeExpertModal
          variant="page"
          includeBasicInfo
          profileData={user}
          initialValues={expertFormInitialValues}
          onCancel={goToProfileView}
          onSubmit={handleExpertProfileSave}
          cancelText="Back to Profile"
          okText="Submit"
          closeAfterSubmit={false}
          successMessage="Profile updated successfully."
        />
      </ExpertProfileFormLayout>
    );
  }

  return (
    <ExpertProfileFormLayout
      title="Edit Profile"
      subtitle="Update your profile information."
      onBack={goToProfileView}
      backLabel="Back to Profile"
    >
      <div className="becomeExpertModal becomeExpertModal--page">
        <div className="becomeExpertModal__pageCard">
          <ProfileDetails
            data={user}
            sections={sections}
            role={role}
            onSave={handleUserProfileSave}
            showEditButton={false}
            hideHeader
            forceEditMode
            onCancelEdit={goToProfileView}
          />
        </div>
      </div>
    </ExpertProfileFormLayout>
  );
};

export default ProfileEditPage;
