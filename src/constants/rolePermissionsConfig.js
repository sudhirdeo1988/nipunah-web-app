/**
 * Role-based permissions config. Single source of truth for all roles and their permissions.
 *
 * To add a new role: push a new entry to ROLE_PERMISSIONS_CONFIG with:
 *   { role: { key: "role_key", label: "Display Name" }, modules: { ... } }
 * Copy modules structure from an existing role and adjust visible/permissions per module.
 * No code changes needed elsewhere; hooks derive everything from this config.
 *
 * To add a new permission key: add it to the module's permissions object in each role;
 * gate the feature in the UI with can(moduleKey, "new_permission_key").
 *
 * Fallback when role is unknown: uses DEFAULT_FALLBACK_ROLE_KEY below.
 */
export const DEFAULT_FALLBACK_ROLE_KEY = "admin";

export const ROLE_PERMISSIONS_CONFIG = [
  {
    role: { key: "expert", label: "Expert" },
    modules: {
      dashboard: {
        label: "Dashboard",
        visible: true,
        permissions: { view: true },
        components: {
          registered_companies: { label: "Registered Companies", visible: true },
          total_users: { label: "Total Users", visible: true },
          total_experts: { label: "Total Experts", visible: true },
          active_jobs: { label: "Active Jobs", visible: true },
        },
      },
      users: {
        label: "Users",
        visible: true,
        permissions: { view: true, add: false, edit: false, delete: false, approve: false },
      },
      experts: {
        label: "Experts",
        visible: false,
        permissions: { view: true, add: true, edit: true, delete: true, approve: true },
      },
      company: {
        label: "Companies",
        visible: true,
        permissions: { view: true, add: false, edit: false, delete: false, approve: false },
      },
      jobs: {
        label: "Jobs",
        visible: true,
        permissions: { view: true, add: true, edit: true, delete: true, apply: true },
      },
      equipments: {
        label: "Equipments",
        visible: false,
        permissions: { view: true, add: true, edit: true, delete: true },
      },
      categories: {
        label: "Categories",
        visible: true,
        permissions: {
          view: true,
          add: false,
          edit: true,
          delete: true,
          view_sub_category: true,
          add_sub_category: true,
          edit_sub_category: true,
          delete_sub_category: true,
        },
      },
      role_management: {
        label: "Role Management",
        visible: false,
        permissions: { view: true, add: true, edit: true, delete: true },
      },
    },
  },
  {
    role: { key: "admin", label: "Administrator" },
    modules: {
      dashboard: {
        label: "Dashboard",
        visible: true,
        permissions: { view: true },
        components: {
          registered_companies: { label: "Registered Companies", visible: true },
          total_users: { label: "Total Users", visible: true },
          total_experts: { label: "Total Experts", visible: true },
          active_jobs: { label: "Active Jobs", visible: true },
        },
      },
      users: {
        label: "Users",
        visible: true,
        permissions: { view: true, add: true, edit: true, delete: true, approve: true },
      },
      experts: {
        label: "Experts",
        visible: true,
        permissions: { view: true, add: true, edit: true, delete: true, approve: true },
      },
      company: {
        label: "Companies",
        visible: true,
        permissions: { view: true, add: true, edit: true, delete: true, approve: true },
      },
      jobs: {
        label: "Jobs",
        visible: true,
        permissions: { view: true, add: true, edit: true, delete: true, apply: true },
      },
      equipments: {
        label: "Equipments",
        visible: true,
        permissions: { view: true, add: true, edit: true, delete: true },
      },
      categories: {
        label: "Categories",
        visible: true,
        permissions: {
          view: true,
          add: true,
          edit: true,
          delete: true,
          view_sub_category: true,
          add_sub_category: true,
          edit_sub_category: true,
          delete_sub_category: true,
        },
      },
      role_management: {
        label: "Role Management",
        visible: true,
        permissions: { view: true, add: true, edit: true, delete: true },
      },
    },
  },
];

/**
 * Get permissions config for a role key. Works with any role key present in ROLE_PERMISSIONS_CONFIG.
 * Falls back to DEFAULT_FALLBACK_ROLE_KEY when role not found.
 */
export function getConfigForRole(roleKey) {
  const key = (roleKey || "").toLowerCase();
  const found = ROLE_PERMISSIONS_CONFIG.find(
    (c) => (c.role?.key || "").toLowerCase() === key
  );
  return (
    found ??
    ROLE_PERMISSIONS_CONFIG.find(
      (c) => (c.role?.key || "").toLowerCase() === DEFAULT_FALLBACK_ROLE_KEY
    ) ??
    ROLE_PERMISSIONS_CONFIG[0]
  );
}

/** All role keys from config (for dropdowns, etc.). */
export function getAllRoleKeys() {
  return ROLE_PERMISSIONS_CONFIG.map((c) => c.role?.key).filter(Boolean);
}
