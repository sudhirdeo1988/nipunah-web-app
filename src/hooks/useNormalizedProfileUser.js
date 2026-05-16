"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { normalizeExpertUser } from "@/utilities/expertProfileNormalize";

/**
 * Redux user for profile/dashboard UIs.
 * Experts are normalized once per Redux update (idempotent; stable reference when unchanged).
 */
export function useNormalizedProfileUser() {
  const reduxUser = useAppSelector((state) => state.user.user);
  const reduxRole = useAppSelector((state) => state.user.role);

  const role = String(
    reduxRole || reduxUser?.role || reduxUser?.type || "user"
  ).toLowerCase();

  const isExpert = role === "expert";

  const user = useMemo(() => {
    if (!reduxUser) return {};
    if (!isExpert) return reduxUser;
    return normalizeExpertUser(reduxUser);
  }, [reduxUser, isExpert]);

  return { user, role, isExpert, reduxUser };
}
