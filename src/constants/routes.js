// src/constants/routes.js

export const ROUTES = {
  PUBLIC: {
    HOME: "/",
    ABOUT: "/about",
    CONTACT: "/contact",
    EXPERTS: "/experts",
    COMPANIES: "/company",
    EQUIPMENT: "/equipment",
    SUBSCRIPTION: "/subscription",
    LOGIN: "/login",
    SIGNUP: "/signup",
    FORGOT_PASSWORD: "/forgot-password",
  },
  PRIVATE: {
    DASHBOARD: "/app/dashboard",
    CATEGORY: "/app/category",
    JOB: "/app/job",
    USERS: "/app/users",
    COMPANY: "/app/company",
    EXPERTS: "/app/experts",
    EQUIPMENT: "/app/equipment",
    SETTINGS: "/app/settings",
    PROFILE: "/app/profile",
    SEC_COMPANY: {
      EQUIPMENT: "/sec/company/equipment",
      JOBS: "/sec/company/equipment",
      PROFILE: "/sec/company/profile",
    },
    SEC_USER: {
      JOBS: "/sec/user/equipment",
      PROFILE: "/sec/user/profile",
    },
    SEC_EXPERT: {
      JOBS: "/sec/expert/equipment",
      PROFILE: "/sec/expert/profile",
    },
  },
};
