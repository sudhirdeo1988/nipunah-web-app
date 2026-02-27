import { ROUTES } from "@/constants/routes";

/** Each nav item has moduleKey for role-permissions config (visibility) */
export const DASHBOARD_ROUTES = {
  COMPANY: [
    {
      route: ROUTES?.PRIVATE?.DASHBOARD,
      label: "Dashboard",
      subHeading: "Overview of your application and key metrics",
      id: "dashboard-1",
      icon: "dashboard",
      moduleKey: "dashboard",
    },
    {
      route: ROUTES?.PRIVATE?.CATEGORY,
      label: "Category",
      subHeading: "Manage categories and sub categories",
      id: "category-1",
      icon: "category",
      moduleKey: "categories",
    },
    {
      route: ROUTES?.PRIVATE?.EXPERTS,
      label: "Experts",
      subHeading: "Manage expert profiles and skill sets",
      id: "expert-1",
      icon: "shield_person",
      moduleKey: "experts",
    },
    {
      route: ROUTES?.PRIVATE?.USERS,
      label: "Users",
      subHeading: "Manage user accounts, permissions and profiles",
      id: "user-1",
      icon: "account_circle",
      moduleKey: "users",
    },
    {
      route: ROUTES?.PRIVATE?.COMPANY,
      label: "Companies",
      subHeading: "Manage company profiles and business information",
      id: "company-1",
      icon: "factory",
      moduleKey: "company",
    },
    {
      route: ROUTES?.PRIVATE?.JOB,
      label: "Jobs",
      subHeading: "Manage job postings and applications",
      id: "jobs-1",
      icon: "assignment_ind",
      moduleKey: "jobs",
    },
    {
      route: ROUTES?.PRIVATE?.EQUIPMENT,
      label: "Equipments",
      subHeading: "Manage equipment listings",
      id: "equipment-1",
      icon: "build",
      moduleKey: "equipments",
    },
    {
      route: ROUTES?.PRIVATE?.ROLES,
      label: "Role Management",
      subHeading: "Manage user roles and permissions",
      id: "roles-1",
      icon: "shield",
      moduleKey: "role_management",
    },
  ],
};
