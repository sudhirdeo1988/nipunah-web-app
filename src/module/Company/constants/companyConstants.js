"use client";

/**
 * Mock company data for development/testing purposes
 * TODO: Replace with actual API calls in production
 * @type {Array<Object>}
 */
export const MOCK_COMPANY_DATA = [
  {
    id: 1,
    name: "TechCorp Solutions",
    shortName: "TechCorp",
    foundYear: "2015",
    websiteUrl: "https://techcorp.com",
    logoUrl: "/assets/images/logo.png",
    description:
      "Leading technology solutions provider specializing in enterprise software development and digital transformation services.",
    industry: "Technology",
    employeeCount: 250,
    contactEmail: "contact@techcorp.com",
    contactNumber: "+1-555-0123",
    turnOver: 5000000,
    isMnc: true,
    subscriptionPlan: "premium",
    paymentDetails: {
      isPaidCompany: true,
    },
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    status: "approved", // approved, pending, blocked
    postedJobs: [
      {
        jobId: 1,
        title: "Senior Software Engineer",
        description: "Full-stack development role",
        location: "San Francisco, CA",
        employmentType: "Full-time",
        experienceLevel: "Senior",
        salaryRange: "$120,000 - $150,000",
        skillsRequired: ["React", "Node.js", "AWS"],
        postedDate: "2024-01-18",
        applicationDeadline: "2024-02-18",
        isActive: true,
        appliedPeopleCount: 25,
        status: "active",
      },
      {
        jobId: 2,
        title: "Frontend Developer",
        description: "React and JavaScript development",
        location: "San Francisco, CA",
        employmentType: "Full-time",
        experienceLevel: "Mid",
        salaryRange: "$90,000 - $120,000",
        skillsRequired: ["React", "JavaScript", "CSS"],
        postedDate: "2024-01-20",
        applicationDeadline: "2024-02-20",
        isActive: true,
        appliedPeopleCount: 18,
        status: "active",
      },
    ],
    categories: [
      {
        id: 1,
        name: "Software Development",
        description: "Custom software solutions",
        createdAt: "2024-01-15",
        updatedAt: "2024-01-15",
        logoUrl: "",
        subCategories: [
          {
            id: 1,
            name: "Web Development",
            description: "Frontend and backend web applications",
            createdAt: "2024-01-15",
            updatedAt: "2024-01-15",
            logoUrl: "",
          },
        ],
      },
    ],
    socialLinks: [
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/company/techcorp",
      },
      {
        platform: "Twitter",
        url: "https://twitter.com/techcorp",
      },
    ],
    locations: [
      {
        city: "San Francisco",
        country: "USA",
        address: "123 Tech Street, SF, CA 94105",
        isPrimaryLocation: true,
      },
      {
        city: "New York",
        country: "USA",
        address: "456 Business Ave, NY, NY 10001",
        isPrimaryLocation: false,
      },
    ],
  },
  {
    id: 2,
    name: "Global Logistics Inc",
    shortName: "GLI",
    foundYear: "2010",
    websiteUrl: "https://globallogistics.com",
    logoUrl: "/assets/images/logo2.png",
    description:
      "International logistics and shipping company providing end-to-end supply chain solutions.",
    industry: "Logistics",
    employeeCount: 1200,
    contactEmail: "info@globallogistics.com",
    contactNumber: "+1-555-0456",
    turnOver: 15000000,
    isMnc: true,
    subscriptionPlan: "basic",
    paymentDetails: {
      isPaidCompany: true,
    },
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18",
    status: "pending",
    postedJobs: [
      {
        jobId: 2,
        title: "Logistics Coordinator",
        description: "Coordinate shipping and logistics operations",
        location: "Miami, FL",
        employmentType: "Full-time",
        experienceLevel: "Mid",
        salaryRange: "$60,000 - $80,000",
        skillsRequired: ["Logistics", "Supply Chain", "Communication"],
        postedDate: "2024-01-16",
        applicationDeadline: "2024-02-16",
        isActive: true,
        appliedPeopleCount: 12,
        status: "active",
      },
      {
        jobId: 3,
        title: "Warehouse Manager",
        description: "Manage warehouse operations and inventory",
        location: "Miami, FL",
        employmentType: "Full-time",
        experienceLevel: "Senior",
        salaryRange: "$70,000 - $90,000",
        skillsRequired: ["Warehouse Management", "Inventory", "Leadership"],
        postedDate: "2024-01-10",
        applicationDeadline: "2024-02-10",
        isActive: false,
        appliedPeopleCount: 8,
        status: "hold",
      },
    ],
    categories: [
      {
        id: 2,
        name: "Logistics",
        description: "Shipping and logistics services",
        createdAt: "2024-01-10",
        updatedAt: "2024-01-10",
        logoUrl: "",
        subCategories: [
          {
            id: 2,
            name: "Freight Forwarding",
            description: "International freight services",
            createdAt: "2024-01-10",
            updatedAt: "2024-01-10",
            logoUrl: "",
          },
        ],
      },
    ],
    socialLinks: [
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/company/global-logistics",
      },
    ],
    locations: [
      {
        city: "Miami",
        country: "USA",
        address: "789 Port Blvd, Miami, FL 33101",
        isPrimaryLocation: true,
      },
    ],
  },
  {
    id: 3,
    name: "StartupXYZ",
    shortName: "XYZ",
    foundYear: "2022",
    websiteUrl: "https://startupxyz.com",
    logoUrl: "/assets/images/logo3.png",
    description:
      "Innovative startup focused on AI-powered solutions for small businesses.",
    industry: "Technology",
    employeeCount: 25,
    contactEmail: "hello@startupxyz.com",
    contactNumber: "+1-555-0789",
    turnOver: 500000,
    isMnc: false,
    subscriptionPlan: "free",
    paymentDetails: {
      isPaidCompany: false,
    },
    createdAt: "2024-01-20",
    updatedAt: "2024-01-22",
    status: "blocked",
    postedJobs: [],
    categories: [
      {
        id: 3,
        name: "Artificial Intelligence",
        description: "AI and machine learning solutions",
        createdAt: "2024-01-20",
        updatedAt: "2024-01-20",
        logoUrl: "",
        subCategories: [
          {
            id: 3,
            name: "Machine Learning",
            description: "ML model development and deployment",
            createdAt: "2024-01-20",
            updatedAt: "2024-01-20",
            logoUrl: "",
          },
        ],
      },
    ],
    socialLinks: [
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/company/startupxyz",
      },
      {
        platform: "Facebook",
        url: "https://facebook.com/startupxyz",
      },
    ],
    locations: [
      {
        city: "Austin",
        country: "USA",
        address: "321 Innovation Dr, Austin, TX 78701",
        isPrimaryLocation: true,
      },
    ],
  },
];

/**
 * Table column configuration constants
 */
export const TABLE_COLUMNS_CONFIG = {
  COMPANY_NAME: "Company Name",
  INDUSTRY: "Industry",
  EMPLOYEES: "Employees",
  PLAN: "Plan",
  STATUS: "Status",
  JOBS_POSTED: "Jobs Posted",
  CREATED_ON: "Created On",
  ACTION: "Action",
};

/**
 * Status color mapping
 */
export const STATUS_COLORS = {
  approved: "success",
  pending: "warning",
  blocked: "error",
};

/**
 * Subscription plan color mapping
 */
export const PLAN_COLORS = {
  free: "default",
  basic: "blue",
  premium: "green",
};

/**
 * Job status color mapping
 */
export const JOB_STATUS_COLORS = {
  active: "success",
  hold: "warning",
};
