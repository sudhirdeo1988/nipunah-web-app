"use client";

import { useAppSelector } from "@/store/hooks";
import { USER_ROLES, ROLE_HIERARCHY } from "@/constants/roles";

/**
 * Custom hook for role-based access control
 * Provides utilities to check user roles and permissions
 */
export const useRole = () => {
  const user = useAppSelector((state) => state.user.user);
  const role = useAppSelector((state) => state.user.role);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  // Get current user role (normalized to lowercase)
  const currentRole = role?.toLowerCase() || user?.role?.toLowerCase() || user?.type?.toLowerCase();

  /**
   * Check if current user has a specific role
   */
  const hasRole = (targetRole) => {
    if (!isAuthenticated || !currentRole) return false;
    return currentRole === targetRole?.toLowerCase();
  };

  /**
   * Check if current user is admin
   */
  const isAdmin = () => {
    return hasRole(USER_ROLES.ADMIN);
  };

  /**
   * Check if current user is expert
   */
  const isExpert = () => {
    return hasRole(USER_ROLES.EXPERT);
  };

  /**
   * Check if current user is regular user
   */
  const isUser = () => {
    return hasRole(USER_ROLES.USER);
  };

  /**
   * Check if current user is company
   */
  const isCompany = () => {
    return hasRole(USER_ROLES.COMPANY);
  };

  /**
   * Check if current user has any of the specified roles
   */
  const hasAnyRole = (roles) => {
    if (!isAuthenticated || !currentRole || !Array.isArray(roles)) return false;
    return roles.some((r) => currentRole === r?.toLowerCase());
  };

  /**
   * Check if current user has minimum role level
   * Uses role hierarchy to determine access
   */
  const hasMinimumRole = (minimumRole) => {
    if (!isAuthenticated || !currentRole) return false;
    const userRoleLevel = ROLE_HIERARCHY[currentRole] || 0;
    const minimumRoleLevel = ROLE_HIERARCHY[minimumRole?.toLowerCase()] || 0;
    return userRoleLevel >= minimumRoleLevel;
  };

  return {
    user,
    role: currentRole,
    isAuthenticated,
    hasRole,
    isAdmin,
    isExpert,
    isUser,
    isCompany,
    hasAnyRole,
    hasMinimumRole,
  };
};

