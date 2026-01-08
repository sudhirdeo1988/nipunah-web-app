"use client";

import React from "react";
import { useRole } from "@/hooks/useRole";
import { USER_ROLES } from "@/constants/roles";

/**
 * RoleGuard Component
 * 
 * Protects routes/components based on user roles.
 * Only renders children if user has the required role(s).
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render if role check passes
 * @param {string|string[]} props.allowedRoles - Single role or array of roles that can access
 * @param {React.ReactNode} props.fallback - Content to render if role check fails (optional)
 * @param {boolean} props.requireAll - If true, user must have ALL roles (for multiple roles)
 */
const RoleGuard = ({
  children,
  allowedRoles,
  fallback = null,
  requireAll = false,
}) => {
  const { hasRole, hasAnyRole, isAdmin } = useRole();

  // Admin has access to everything
  if (isAdmin()) {
    return <>{children}</>;
  }

  // Check if user has required role(s)
  let hasAccess = false;

  if (Array.isArray(allowedRoles)) {
    if (requireAll) {
      // User must have ALL roles
      hasAccess = allowedRoles.every((role) => hasRole(role));
    } else {
      // User must have ANY of the roles
      hasAccess = hasAnyRole(allowedRoles);
    }
  } else {
    // Single role check
    hasAccess = hasRole(allowedRoles);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default RoleGuard;

