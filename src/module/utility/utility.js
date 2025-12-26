import { ROUTES } from "@/constants/routes";

export const DASHBOARD_ROUTES = {
  COMPANY: [
    {
      route: ROUTES?.PRIVATE?.DASHBOARD,
      label: "Dashboard",
      subHeading: "Overview of your application and key metrics",
      id: "dashboard-1",
      icon: "dashboard",
    },
    {
      route: ROUTES?.PRIVATE?.CATEGORY,
      label: "Category",
      subHeading: "Manage categories and sub categories",
      id: "category-1",
      icon: "category",
    },
    {
      route: ROUTES?.PRIVATE?.EXPERTS,
      label: "Experts",
      subHeading: "Manage expert profiles and skill sets",
      id: "expert-1",
      icon: "shield_person",
    },
    {
      route: ROUTES?.PRIVATE?.USERS,
      label: "Users",
      subHeading: "Manage user accounts, permissions and profiles",
      id: "user-1",
      icon: "account_circle",
    },
    {
      route: ROUTES?.PRIVATE?.COMPANY,
      label: "Companies",
      subHeading: "Manage company profiles and business information",
      id: "company-1",
      icon: "factory",
    },
    {
      route: ROUTES?.PRIVATE?.JOB,
      label: "Jobs",
      subHeading: "Manage job postings and applications",
      id: "jobs-1",
      icon: "assignment_ind",
    },
    {
      route: ROUTES?.PRIVATE?.EQUIPMENT,
      label: "Equipment",
      subHeading: "Manage equipment listings and details",
      id: "equipment-1",
      icon: "precision_manufacturing",
    },
  ],
};
