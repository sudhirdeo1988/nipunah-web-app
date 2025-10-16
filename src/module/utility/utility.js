import { ROUTES } from "@/constants/routes";

export const DASHBOARD_ROUTES = {
  COMPANY: [
    {
      route: ROUTES?.PRIVATE?.DASHBOARD,
      label: "Dashboard",
      id: "dashboard-1",
      icon: "dashboard",
    },
    {
      route: ROUTES?.PRIVATE?.CATEGORY,
      label: "Category",
      id: "category-1",
      icon: "category",
    },
    {
      route: ROUTES?.PRIVATE?.JOB,
      label: "Jobs",
      id: "jobs-1",
      icon: "assignment_ind",
    },
  ],
};
