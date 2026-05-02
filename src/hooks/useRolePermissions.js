"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { loadUserSession, getRoleFromStoredUser } from "@/utilities/sessionUser";
import {
  clearRolePermissionsCache,
  fetchRolePermissions,
} from "@/utilities/rolePermissionsApi";

const DEFAULT_ROLE = "expert";
const MODULE_KEY_TO_NAV_KEY = {
  dashboard: "nav_dashboard",
  categories: "nav_categories",
  experts: "nav_experts",
  users: "nav_users",
  company: "nav_companies",
  services: "nav_services",
  jobs: "nav_jobs",
  enquiries: "nav_enquiries",
  equipments: "nav_equipments",
  role_management: "nav_role_management",
  pricing: "nav_pricing",
};

const MODULE_PERMISSION_NAMES = {
  dashboard: ["view"],
  users: ["view", "add", "edit", "delete", "approve"],
  experts: ["view", "add", "edit", "delete", "approve"],
  company: ["view", "add", "edit", "delete", "approve"],
  services: ["view", "add", "edit", "delete"],
  jobs: ["view", "add", "edit", "delete", "apply", "approve"],
  enquiries: ["view", "delete", "respond"],
  equipments: ["view", "add", "edit", "delete"],
  categories: [
    "view",
    "add",
    "edit",
    "delete",
    "view_sub_category",
    "add_sub_category",
    "edit_sub_category",
    "delete_sub_category",
  ],
  role_management: ["view", "add", "edit", "delete"],
  pricing: ["view", "edit"],
};

const DASHBOARD_COMPONENT_KEY_MAP = {
  registered_companies: "dashboard_registered_companies",
  total_users: "dashboard_total_users",
  total_experts: "dashboard_total_experts",
  active_jobs: "dashboard_active_jobs",
};

function normalizeRoleKey(roleKey) {
  const role = String(roleKey || "").toLowerCase();
  return role || DEFAULT_ROLE;
}

/**
 * Hook for role-based permissions using flat role permissions object.
 * Role source priority: Redux -> localStorage session -> DEFAULT_ROLE.
 */
export function useRolePermissions() {
  const roleFromRedux = useAppSelector((state) => state.user.role);
  const userFromRedux = useAppSelector((state) => state.user.user);
  const roleFromUser = useAppSelector((state) => state.user.user?.role);
  const typeFromUser = useAppSelector((state) => state.user.user?.type);
  const [permissionsVersion, setPermissionsVersion] = useState(0);
  const [permissionsByRole, setPermissionsByRole] = useState(null);
  const [permissionsReady, setPermissionsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onPermissionsUpdated = () => {
      clearRolePermissionsCache();
      setPermissionsVersion((prev) => prev + 1);
    };
    window.addEventListener("role-permissions-updated", onPermissionsUpdated);
    return () => {
      window.removeEventListener("role-permissions-updated", onPermissionsUpdated);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const loadPermissions = async () => {
      try {
        const payload = await fetchRolePermissions();
        if (!cancelled && payload && typeof payload === "object") {
          setPermissionsByRole(payload);
        }
      } catch {
        // ignore and keep empty permissions
      } finally {
        if (!cancelled) {
          setPermissionsReady(true);
        }
      }
    };
    loadPermissions();
    return () => {
      cancelled = true;
    };
  }, [permissionsVersion]);

  return useMemo(() => {
    const stored = loadUserSession();
    const resolvedRole = normalizeRoleKey(
      roleFromRedux ||
        roleFromUser ||
        typeFromUser ||
        getRoleFromStoredUser(stored) ||
        DEFAULT_ROLE
    );
    const roleFlat =
      permissionsByRole &&
      typeof permissionsByRole === "object" &&
      permissionsByRole[resolvedRole] &&
      typeof permissionsByRole[resolvedRole] === "object"
        ? permissionsByRole[resolvedRole]
        : {};

    // Keep user profile fields, with API permissions merged in.
    const flat =
      userFromRedux && typeof userFromRedux === "object"
        ? { ...userFromRedux, ...roleFlat }
        : roleFlat;

    const visibleModuleKeys = new Set(
      Object.keys(MODULE_KEY_TO_NAV_KEY).filter((moduleKey) =>
        Boolean(flat[MODULE_KEY_TO_NAV_KEY[moduleKey]])
      )
    );

    const isModuleVisible = (moduleKey) => visibleModuleKeys.has(moduleKey);

    const can = (moduleKey, permissionKey) => {
      return Boolean(flat[`${moduleKey}_${permissionKey}`]);
    };

    const visibleDashboardComponentKeys = new Set(
      Object.keys(DASHBOARD_COMPONENT_KEY_MAP).filter((componentKey) =>
        Boolean(flat[DASHBOARD_COMPONENT_KEY_MAP[componentKey]])
      )
    );

    const getDashboardVisibleComponentKeys = () =>
      Array.from(visibleDashboardComponentKeys);

    const getModuleConfig = (moduleKey) => {
      const permissionNames = MODULE_PERMISSION_NAMES[moduleKey] ?? [];
      const permissions = permissionNames.reduce((acc, permissionName) => {
        acc[permissionName] = Boolean(flat[`${moduleKey}_${permissionName}`]);
        return acc;
      }, {});
      return {
        visible: Boolean(flat[MODULE_KEY_TO_NAV_KEY[moduleKey]]),
        permissions,
      };
    };

    return {
      role: resolvedRole,
      permissionsReady,
      flatPermissions: flat,
      visibleModuleKeys,
      visibleDashboardComponentKeys,
      isModuleVisible,
      can,
      getDashboardVisibleComponentKeys,
      getModuleConfig,
    };
  }, [roleFromRedux, roleFromUser, typeFromUser, userFromRedux, permissionsByRole, permissionsReady]);
}
