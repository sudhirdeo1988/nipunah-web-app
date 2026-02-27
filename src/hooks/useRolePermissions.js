"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { getConfigForRole } from "@/constants/rolePermissionsConfig";

/** Static default when Redux role is null (e.g. on refresh). Change to any key in ROLE_PERMISSIONS_CONFIG. */
const DEFAULT_ROLE = "expert";

/**
 * Hook for role-based permissions. Fully driven by ROLE_PERMISSIONS_CONFIG.
 * Add new roles/permissions in config only; no code changes needed here.
 */
export function useRolePermissions() {
  const roleFromRedux = useAppSelector((state) => state.user.role);
  const role = roleFromRedux ?? DEFAULT_ROLE;

  return useMemo(() => {
    const config = getConfigForRole(role);
    const modules = config?.modules ?? {};

    const visibleModuleKeys = new Set(
      Object.keys(modules).filter((k) => modules[k]?.visible)
    );

    const isModuleVisible = (moduleKey) => visibleModuleKeys.has(moduleKey);

    const can = (moduleKey, permissionKey) => {
      const mod = modules[moduleKey];
      const perms = mod?.permissions ?? {};
      return Boolean(perms[permissionKey]);
    };

    const dashboardMod = modules.dashboard;
    const dashboardComps = dashboardMod?.components ?? {};
    const visibleDashboardComponentKeys = new Set(
      Object.keys(dashboardComps).filter((k) => dashboardComps[k]?.visible)
    );

    const getDashboardVisibleComponentKeys = () =>
      Array.from(visibleDashboardComponentKeys);

    const getModuleConfig = (moduleKey) => modules[moduleKey] ?? null;

    return {
      role: (role || DEFAULT_ROLE).toLowerCase(),
      modules,
      visibleModuleKeys,
      visibleDashboardComponentKeys,
      isModuleVisible,
      can,
      getDashboardVisibleComponentKeys,
      getModuleConfig,
    };
  }, [role]);
}
