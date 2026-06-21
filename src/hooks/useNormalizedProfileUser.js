"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { normalizeExpertUser } from "@/utilities/expertProfileNormalize";
import { normalizeCompanyUser } from "@/utilities/companyProfileNormalize";

/**
 * Redux user for profile/dashboard UIs.
 * Experts and companies are normalized once per Redux update.
 */
export function useNormalizedProfileUser() {
  const reduxUser = useAppSelector((state) => state.user.user);
  const reduxRole = useAppSelector((state) => state.user.role);

  const role = String(
    reduxRole || reduxUser?.role || reduxUser?.type || "user"
  ).toLowerCase();

  const isExpert = role === "expert";
  const isCompany = role === "company";

  const user = useMemo(() => {
    if (!reduxUser) return {};
    if (isExpert) return normalizeExpertUser(reduxUser);
    if (isCompany) return normalizeCompanyUser(reduxUser);
    return reduxUser;
  }, [reduxUser, isExpert, isCompany]);

  return { user, role, isExpert, isCompany, reduxUser };
}
