"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useRolePermissions } from "./useRolePermissions";

/**
 * Use in a page to enforce module visibility. Redirects to dashboard if module not visible.
 * @param {string} moduleKey - e.g. 'users', 'experts', 'company', 'jobs', 'equipments', 'categories', 'role_management', 'dashboard'
 * @returns {{ allowed: boolean, permissions: object, config: object }} allowed; permissions for the module (stable reference when config unchanged)
 */
export function useModuleAccess(moduleKey) {
  const router = useRouter();
  const { isModuleVisible, getModuleConfig } = useRolePermissions();
  const allowed = isModuleVisible(moduleKey);
  const config = getModuleConfig(moduleKey);
  const permissions = useMemo(
    () => config?.permissions ?? {},
    [config]
  );

  useEffect(() => {
    if (!moduleKey) return;
    if (!allowed) {
      router.replace(ROUTES?.PRIVATE?.DASHBOARD ?? "/app/dashboard");
    }
  }, [moduleKey, allowed, router]);

  return useMemo(
    () => ({ allowed, permissions, config }),
    [allowed, permissions, config]
  );
}
