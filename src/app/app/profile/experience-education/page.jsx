"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/userSlice";
import BecomeExpertModal from "@/components/BecomeExpertModal";
import ExpertProfileFormLayout from "@/components/BecomeExpertModal/ExpertProfileFormLayout";
import { expertCareerFormValues } from "@/utilities/expertProfileNormalize";
import { useNormalizedProfileUser } from "@/hooks/useNormalizedProfileUser";
import {
  applyRolePermissionsToUser,
  saveUserSession,
  getIdFromStoredUser,
  updateUserDetailsByRole,
  fetchUserDetailsByRole,
} from "@/utilities/sessionUser";

const ExperienceEducationPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isExpert, reduxUser } = useNormalizedProfileUser();

  const careerInitialValues = useMemo(
    () => expertCareerFormValues(user),
    [user]
  );

  useEffect(() => {
    if (!isExpert) {
      router.replace("/app/profile");
    }
  }, [isExpert, router]);

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
    async (payload) => {
      await syncExpertAfterSave(payload);
      router.push("/app/profile");
    },
    [syncExpertAfterSave, router]
  );

  const goToProfile = useCallback(() => {
    router.push("/app/profile");
  }, [router]);

  if (!isExpert) {
    return null;
  }

  return (
    <ExpertProfileFormLayout
      title="Edit Experience & Education"
      subtitle="Update your about section, work experience, skills, and education & training."
      onBack={goToProfile}
      backLabel="Back to Profile"
    >
      <BecomeExpertModal
        variant="page"
        initialValues={careerInitialValues}
        onCancel={goToProfile}
        onSubmit={handleSave}
        cancelText="Back to Profile"
        okText="Submit"
        closeAfterSubmit={false}
        successMessage="Experience and education updated successfully."
      />
    </ExpertProfileFormLayout>
  );
};

export default ExperienceEducationPage;
