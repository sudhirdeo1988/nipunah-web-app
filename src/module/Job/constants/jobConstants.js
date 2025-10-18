"use client";

/**
 * Mock job data for development/testing purposes
 * TODO: Replace with actual API calls in production
 * @type {Array<Object>}
 */
export const MOCK_JOB_DATA = [
  {
    id: 1,
    jobId: "JOB-001",
    title: "Senior Software Engineer",
    postedBy: {
      companyId: 1,
      companyName: "TechCorp Solutions",
      companyShortName: "TechCorp",
    },
    experienceRequired: "5-8 years",
    salaryRange: "$120,000 - $150,000",
    location: "San Francisco, CA",
    peopleApplied: 25,
    postedOn: "2024-01-18",
    updatedOn: "2024-01-20",
    status: "approved", // approved, pending, blocked
    description: "Full-stack development role with React and Node.js",
    employmentType: "Full-time",
    skillsRequired: ["React", "Node.js", "AWS", "TypeScript"],
    applicationDeadline: "2024-02-18",
    isActive: true,
  },
  {
    id: 2,
    jobId: "JOB-002",
    title: "Frontend Developer",
    postedBy: {
      companyId: 1,
      companyName: "TechCorp Solutions",
      companyShortName: "TechCorp",
    },
    experienceRequired: "3-5 years",
    salaryRange: "$90,000 - $120,000",
    location: "San Francisco, CA",
    peopleApplied: 18,
    postedOn: "2024-01-20",
    updatedOn: "2024-01-22",
    status: "approved",
    description: "React and JavaScript development",
    employmentType: "Full-time",
    skillsRequired: ["React", "JavaScript", "CSS", "HTML"],
    applicationDeadline: "2024-02-20",
    isActive: true,
  },
  {
    id: 3,
    jobId: "JOB-003",
    title: "Logistics Coordinator",
    postedBy: {
      companyId: 2,
      companyName: "Global Logistics Inc",
      companyShortName: "GLI",
    },
    experienceRequired: "2-4 years",
    salaryRange: "$60,000 - $80,000",
    location: "Miami, FL",
    peopleApplied: 12,
    postedOn: "2024-01-16",
    updatedOn: "2024-01-18",
    status: "pending",
    description: "Coordinate shipping and logistics operations",
    employmentType: "Full-time",
    skillsRequired: ["Logistics", "Supply Chain", "Communication"],
    applicationDeadline: "2024-02-16",
    isActive: true,
  },
  {
    id: 4,
    jobId: "JOB-004",
    title: "Warehouse Manager",
    postedBy: {
      companyId: 2,
      companyName: "Global Logistics Inc",
      companyShortName: "GLI",
    },
    experienceRequired: "5-7 years",
    salaryRange: "$70,000 - $90,000",
    location: "Miami, FL",
    peopleApplied: 8,
    postedOn: "2024-01-10",
    updatedOn: "2024-01-12",
    status: "blocked",
    description: "Manage warehouse operations and inventory",
    employmentType: "Full-time",
    skillsRequired: ["Warehouse Management", "Inventory", "Leadership"],
    applicationDeadline: "2024-02-10",
    isActive: false,
  },
  {
    id: 5,
    jobId: "JOB-005",
    title: "AI Research Scientist",
    postedBy: {
      companyId: 3,
      companyName: "StartupXYZ",
      companyShortName: "XYZ",
    },
    experienceRequired: "3-6 years",
    salaryRange: "$100,000 - $130,000",
    location: "Austin, TX",
    peopleApplied: 15,
    postedOn: "2024-01-25",
    updatedOn: "2024-01-27",
    status: "approved",
    description: "AI-powered solutions research and development",
    employmentType: "Full-time",
    skillsRequired: ["Python", "Machine Learning", "TensorFlow", "Research"],
    applicationDeadline: "2024-02-25",
    isActive: true,
  },
  {
    id: 6,
    jobId: "JOB-006",
    title: "DevOps Engineer",
    postedBy: {
      companyId: 1,
      companyName: "TechCorp Solutions",
      companyShortName: "TechCorp",
    },
    experienceRequired: "4-6 years",
    salaryRange: "$110,000 - $140,000",
    location: "Remote",
    peopleApplied: 22,
    postedOn: "2024-01-28",
    updatedOn: "2024-01-30",
    status: "pending",
    description: "Cloud infrastructure and deployment automation",
    employmentType: "Full-time",
    skillsRequired: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    applicationDeadline: "2024-02-28",
    isActive: true,
  },
];

/**
 * Table column configuration constants
 */
export const TABLE_COLUMNS_CONFIG = {
  JOB_ID: "Job ID",
  TITLE: "Title",
  POSTED_BY: "Posted By",
  EXPERIENCE: "Experience Required",
  SALARY: "Salary Range",
  LOCATION: "Location",
  APPLIED: "People Applied",
  POSTED_ON: "Posted On",
  UPDATED_ON: "Updated On",
  ACTION: "Action",
};

/**
 * Status color mapping for job status
 */
export const JOB_STATUS_COLORS = {
  approved: "success",
  pending: "warning",
  blocked: "error",
};

/**
 * Employment type color mapping
 */
export const EMPLOYMENT_TYPE_COLORS = {
  "Full-time": "blue",
  "Part-time": "green",
  Contract: "orange",
  Internship: "purple",
};

/**
 * Experience level color mapping
 */
export const EXPERIENCE_COLORS = {
  "0-1 years": "green",
  "1-3 years": "blue",
  "3-5 years": "orange",
  "5-8 years": "red",
  "8+ years": "purple",
};
