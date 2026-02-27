/**
 * Mock API response: array of all roles for Role Management UI.
 * Each item: { role: { key, label }, modules: { ... } }
 * To add a new role: push a new entry with the same structure; the UI and API work with any role keys.
 */
const adminModules = {
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
};

export const ROLE_MANAGEMENT_MOCK = [
  {
    role: { key: "admin", label: "Administrator" },
    modules: { ...JSON.parse(JSON.stringify(adminModules)) },
  },
  {
    role: { key: "user", label: "User" },
    modules: { ...JSON.parse(JSON.stringify(adminModules)) },
  },
  {
    role: { key: "expert", label: "Expert" },
    modules: { ...JSON.parse(JSON.stringify(adminModules)) },
  },
  {
    role: { key: "company", label: "Company" },
    modules: { ...JSON.parse(JSON.stringify(adminModules)) },
  },
];
