/**
 * User Roles Constants
 * Defines all available user roles in the system
 */
export const USER_ROLES = {
  ADMIN: "admin",
  EXPERT: "expert",
  USER: "user",
  COMPANY: "company",
};

/**
 * Role hierarchy for permission checking
 * Higher roles have access to lower role permissions
 */
export const ROLE_HIERARCHY = {
  [USER_ROLES.ADMIN]: 4,
  [USER_ROLES.COMPANY]: 3,
  [USER_ROLES.EXPERT]: 2,
  [USER_ROLES.USER]: 1,
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role) => {
  const roleMap = {
    [USER_ROLES.ADMIN]: "Admin",
    [USER_ROLES.EXPERT]: "Expert",
    [USER_ROLES.USER]: "User",
    [USER_ROLES.COMPANY]: "Company",
  };
  return roleMap[role] || role;
};

