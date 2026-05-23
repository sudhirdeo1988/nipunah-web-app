"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/userSlice";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import BecomeExpertModal from "@/components/BecomeExpertModal";
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
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Edit Experience & Education"
        subtitle="Update your about section, work experience, skills, and education."
        children={
          <Button icon={<ArrowLeftOutlined />} onClick={goToProfile}>
            Back to profile
          </Button>
        }
      />
      <div className="p-4">
        <BecomeExpertModal
          variant="page"
          initialValues={careerInitialValues}
          onCancel={goToProfile}
          onSubmit={handleSave}
          title="Edit Experience & Education"
          okText="Save"
          closeAfterSubmit={false}
          successMessage="Experience and education updated successfully."
        />
      </div>
    </div>
  );
};

export default ExperienceEducationPage;
