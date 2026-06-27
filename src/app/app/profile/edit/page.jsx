"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { message, Spin } from "antd";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/userSlice";
import BecomeExpertModal from "@/components/BecomeExpertModal";
import ExpertProfileFormLayout from "@/components/BecomeExpertModal/ExpertProfileFormLayout";
import ProfileDetails from "@/components/Profile/ProfileDetails";
import CompanyProfileForm from "@/components/Profile/CompanyProfileForm";
import { PROFILE_SCHEMAS } from "@/components/Profile/profileSchemas";
import {
  expertBasicInfoFormValues,
  expertCareerFormValues,
} from "@/utilities/expertProfileNormalize";
import { companyProfileFormValues } from "@/utilities/companyProfileNormalize";
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
  const { user, role, isExpert, isCompany, reduxUser } =
    useNormalizedProfileUser();
  const [companyProfile, setCompanyProfile] = useState(null);
  const [loadingCompanyProfile, setLoadingCompanyProfile] = useState(isCompany);
  const [expertProfile, setExpertProfile] = useState(null);
  const [loadingExpertProfile, setLoadingExpertProfile] = useState(isExpert);

  const sections = useMemo(() => {
    if (role === "company") return PROFILE_SCHEMAS.company;
    if (role === "expert") return PROFILE_SCHEMAS.expert;
    return PROFILE_SCHEMAS.user;
  }, [role]);

  const companyId = useMemo(
    () => getIdFromStoredUser(reduxUser),
    [reduxUser]
  );

  const expertId = companyId;

  useEffect(() => {
    if (!isExpert) {
      setExpertProfile(null);
      setLoadingExpertProfile(false);
      return;
    }

    let cancelled = false;

    const loadExpertProfile = async () => {
      const sessionBase = reduxUser || user || {};

      if (!expertId) {
        setExpertProfile(sessionBase);
        setLoadingExpertProfile(false);
        return;
      }

      setLoadingExpertProfile(true);
      try {
        const latest = await fetchUserDetailsByRole({
          role: "expert",
          id: expertId,
        });
        const merged = applyRolePermissionsToUser({
          ...sessionBase,
          ...(latest || {}),
        });
        if (!cancelled) {
          setExpertProfile(merged);
          saveUserSession(merged);
          dispatch(setUser(merged));
        }
      } catch (error) {
        console.warn("Failed to load expert profile for edit:", error);
        if (!cancelled) {
          setExpertProfile(sessionBase);
        }
      } finally {
        if (!cancelled) {
          setLoadingExpertProfile(false);
        }
      }
    };

    loadExpertProfile();

    return () => {
      cancelled = true;
    };
  }, [dispatch, expertId, isExpert]);

  useEffect(() => {
    if (!isCompany) {
      setCompanyProfile(null);
      setLoadingCompanyProfile(false);
      return;
    }

    let cancelled = false;

    const loadCompanyProfile = async () => {
      const sessionBase = reduxUser || user || {};

      if (!companyId) {
        setCompanyProfile(sessionBase);
        setLoadingCompanyProfile(false);
        return;
      }

      setLoadingCompanyProfile(true);
      try {
        const latest = await fetchUserDetailsByRole({
          role: "company",
          id: companyId,
        });
        const merged = applyRolePermissionsToUser({
          ...sessionBase,
          ...(latest || {}),
        });
        if (!cancelled) {
          setCompanyProfile(merged);
          saveUserSession(merged);
          dispatch(setUser(merged));
        }
      } catch (error) {
        console.warn("Failed to load company profile for edit:", error);
        if (!cancelled) {
          setCompanyProfile(sessionBase);
        }
      } finally {
        if (!cancelled) {
          setLoadingCompanyProfile(false);
        }
      }
    };

    loadCompanyProfile();

    return () => {
      cancelled = true;
    };
  }, [companyId, dispatch, isCompany]);

  const companyFormInitialValues = useMemo(() => {
    if (!isCompany) return null;
    return companyProfileFormValues(companyProfile || user);
  }, [companyProfile, isCompany, user]);

  const expertFormInitialValues = useMemo(() => {
    if (!isExpert) return null;
    const source = expertProfile || user;
    return {
      ...expertBasicInfoFormValues(source),
      ...expertCareerFormValues(source),
    };
  }, [expertProfile, isExpert, user]);

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
        payload: { ...(reduxUser || {}), ...updated },
      });

      const latest = await fetchUserDetailsByRole({ role, id });
      const merged = applyRolePermissionsToUser({
        ...(reduxUser || {}),
        ...(latest || {}),
      });
      saveUserSession(merged);
      dispatch(setUser(merged));
      message.success("Profile updated successfully.");
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
        {loadingExpertProfile || !expertFormInitialValues ? (
          <div className="text-center py-5">
            <Spin size="large" />
          </div>
        ) : (
          <BecomeExpertModal
            variant="pageProfile"
            includeBasicInfo
            profileData={expertProfile || user}
            initialValues={expertFormInitialValues}
            onCancel={goToProfileView}
            onSubmit={handleExpertProfileSave}
            cancelText="Back to Profile"
            okText="Save Profile"
            closeAfterSubmit={false}
            successMessage="Profile updated successfully."
          />
        )}
      </ExpertProfileFormLayout>
    );
  }

  if (isCompany) {
    return (
      <ExpertProfileFormLayout
        title="Edit Profile"
        subtitle="Update your company details, addresses, categories, and statistics."
        onBack={goToProfileView}
        backLabel="Back to Profile"
      >
        <div className="profileDetails">
          {loadingCompanyProfile || !companyFormInitialValues ? (
            <div className="text-center py-5">
              <Spin size="large" />
            </div>
          ) : (
            <CompanyProfileForm
              key={`company-profile-${getIdFromStoredUser(companyProfile || reduxUser) || "edit"}`}
              initialValues={companyFormInitialValues}
              onSubmit={handleUserProfileSave}
              onCancel={goToProfileView}
              cancelText="Back to Profile"
              okText="Save Profile"
            />
          )}
        </div>
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
      <ProfileDetails
        data={user}
        sections={sections}
        role={role}
        onSave={handleUserProfileSave}
        showEditButton={false}
        hideHeader
        bare
        forceEditMode
        onCancelEdit={goToProfileView}
      />
    </ExpertProfileFormLayout>
  );
};

export default ProfileEditPage;
