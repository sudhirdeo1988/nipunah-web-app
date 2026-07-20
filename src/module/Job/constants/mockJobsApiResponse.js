/**
 * Job API mock config + GET response
 *
 * Flip USE_MOCK_JOBS_API to `false` when the real jobs API is ready.
 * Replace the proxy target in `src/utilities/apiServices.js` / `src/app/api/jobs/route.js`
 * when the backend endpoint changes.
 */

/** Set to false to hit the real GET/POST /api/jobs proxy */
export const USE_MOCK_JOBS_API = true;

/**
 * In-memory store for jobs created while mock mode is on (session-only).
 * Cleared on full page refresh unless you persist elsewhere.
 */
let mockCreatedJobs = [];

export const getMockCreatedJobs = () => mockCreatedJobs;

export const addMockCreatedJob = (job) => {
  mockCreatedJobs = [job, ...mockCreatedJobs];
  return job;
};

export const clearMockCreatedJobs = () => {
  mockCreatedJobs = [];
};

/**
 * Mock GET /jobs response shape (matches useJob transform expectations).
 */
export const MOCK_GET_JOBS_RESPONSE = {
  success: true,
  data: {
    total: 3,
    page: 1,
    limit: 10,
    totalPages: 1,
    items: [
      {
        id: 1,
        jobId: "JOB-001",
        title: "Hiring: ServiceNow Professionals Multiple Modules",
        postedBy: {
          companyId: 1,
          companyName: "eLabs Infotech",
          companyShortName: "eLabs",
        },
        experienceRequired: "6-11 years",
        salaryNotDisclosed: true,
        salaryRange: {
          min: "Not Disclosed",
          max: "Not Disclosed",
        },
        location: {
          city: "Bengaluru",
          state: "Karnataka",
          pinCode: "560066",
          countryCode: "IN",
          country: "India",
        },
        peopleApplied: 100,
        createdOn: Date.now() - 6 * 24 * 60 * 60 * 1000,
        updatedOn: Date.now() - 2 * 24 * 60 * 60 * 1000,
        status: "approved",
        description:
          "<p>We are looking for ServiceNow professionals with strong implementation and integration experience across multiple modules.</p>",
        keyResponsibilities:
          "<ul><li>Design and implement ServiceNow solutions</li><li>Build workflows, business rules, and integrations</li><li>Collaborate with stakeholders for requirements</li></ul>",
        requiredSkills:
          "<ul><li>JavaScript and ServiceNow scripting</li><li>Flow Designer and Integration Hub</li><li>REST/SOAP APIs</li></ul>",
        preferredSkills:
          "<ul><li>ServiceNow CSA / CIS / CAD certifications</li><li>Agile/Scrum and ITIL knowledge</li></ul>",
        skillsRequired:
          "<ul><li>JavaScript and ServiceNow scripting</li><li>Flow Designer and Integration Hub</li></ul>",
        keySkills: [
          "ServiceNow",
          "ITSM",
          "Project Manager",
          "CSM",
          "ITAM",
        ],
        preferredKeySkills: ["CSA", "CIS", "CAD"],
        qualifications:
          "Bachelor's or Master's degree in Computer Science, Information Technology, Engineering, or a related field.",
        employmentType: "Full-time",
        employmentNature: "Permanent",
        workMode: "Hybrid",
        openings: 5,
        role: "ServiceNow Professionals | Multiple Modules",
        roleCategory: "Software Development",
        department: "Engineering - Software & QA",
        industry: "IT Services & Consulting",
        education: "B.Tech / B.E.",
        educationSpecialization: "Any Specialization",
        applicationDeadline: "2026-08-30",
        isActive: true,
      },
      {
        id: 2,
        jobId: "JOB-002",
        title: "Senior Software Engineer",
        postedBy: {
          companyId: 1,
          companyName: "TechCorp Solutions",
          companyShortName: "TechCorp",
        },
        experienceRequired: "5-8 years",
        salaryNotDisclosed: false,
        salaryRange: {
          min: "$120,000",
          max: "$150,000",
        },
        location: {
          city: "San Francisco",
          state: "California",
          pinCode: "94102",
          countryCode: "US",
          country: "United States",
        },
        peopleApplied: 25,
        createdOn: Date.now() - 10 * 24 * 60 * 60 * 1000,
        updatedOn: Date.now() - 8 * 24 * 60 * 60 * 1000,
        status: "approved",
        description:
          "<p>Full-stack development role with React and Node.js.</p>",
        keyResponsibilities:
          "<ul><li>Build and maintain web applications</li><li>Collaborate with product and design</li></ul>",
        requiredSkills:
          "<ul><li>React</li><li>Node.js</li><li>TypeScript</li></ul>",
        preferredSkills: "<ul><li>AWS</li><li>GraphQL</li></ul>",
        skillsRequired:
          "<ul><li>React</li><li>Node.js</li><li>TypeScript</li></ul>",
        keySkills: ["React", "Node.js", "AWS", "TypeScript"],
        preferredKeySkills: ["GraphQL"],
        qualifications:
          "Bachelor's degree in Computer Science or equivalent experience.",
        employmentType: "Full-time",
        employmentNature: "Permanent",
        workMode: "Office",
        openings: 2,
        role: "Senior Software Engineer",
        roleCategory: "Software Development",
        department: "Engineering - Software & QA",
        industry: "Software Product",
        education: "B.Tech / B.E.",
        educationSpecialization: "Computer Science",
        applicationDeadline: "2026-09-15",
        isActive: true,
      },
      {
        id: 3,
        jobId: "JOB-003",
        title: "Frontend Developer",
        postedBy: {
          companyId: 2,
          companyName: "Global Logistics Inc",
          companyShortName: "GLI",
        },
        experienceRequired: "3-5 years",
        salaryNotDisclosed: false,
        salaryRange: {
          min: "$90,000",
          max: "$120,000",
        },
        location: {
          city: "Miami",
          state: "Florida",
          pinCode: "33101",
          countryCode: "US",
          country: "United States",
        },
        peopleApplied: 18,
        createdOn: Date.now() - 4 * 24 * 60 * 60 * 1000,
        updatedOn: Date.now() - 1 * 24 * 60 * 60 * 1000,
        status: "pending",
        description: "<p>React and JavaScript development for logistics platforms.</p>",
        keyResponsibilities:
          "<ul><li>Implement UI features</li><li>Ensure responsive design</li></ul>",
        requiredSkills:
          "<ul><li>React</li><li>JavaScript</li><li>CSS</li></ul>",
        preferredSkills: "<ul><li>Redux</li></ul>",
        skillsRequired: "<ul><li>React</li><li>JavaScript</li><li>CSS</li></ul>",
        keySkills: ["React", "JavaScript", "CSS", "HTML"],
        preferredKeySkills: ["Redux"],
        qualifications: "Any Graduate in IT or related field.",
        employmentType: "Full-time",
        employmentNature: "Permanent",
        workMode: "Remote",
        openings: 1,
        role: "Frontend Developer",
        roleCategory: "Software Development",
        department: "Engineering - Software & QA",
        industry: "Logistics / Supply Chain",
        education: "Any Graduate",
        educationSpecialization: "Any Specialization",
        applicationDeadline: "2026-08-20",
        isActive: true,
      },
    ],
  },
};

/**
 * Build a paginated mock GET response (supports search + pagination).
 */
export const buildMockGetJobsResponse = (params = {}) => {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = String(params.search || "")
    .trim()
    .toLowerCase();

  const baseItems = [
    ...getMockCreatedJobs(),
    ...MOCK_GET_JOBS_RESPONSE.data.items,
  ];

  const filtered = search
    ? baseItems.filter((job) => {
        const haystack = [
          job.title,
          job.role,
          job.postedBy?.companyName,
          job.location?.city,
          job.employmentType,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(search);
      })
    : baseItems;

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return {
    success: true,
    data: {
      total,
      page,
      limit,
      totalPages,
      items,
    },
  };
};

/**
 * Simulate a successful POST create response in mock mode.
 */
export const buildMockCreateJobResponse = (jobData) => {
  const id = Date.now();
  const created = {
    id,
    jobId: `JOB-${id}`,
    ...jobData,
    peopleApplied: 0,
    createdOn: Date.now(),
    updatedOn: Date.now(),
  };
  addMockCreatedJob(created);
  return {
    success: true,
    data: created,
    id,
    job_id: created.jobId,
    message: "Job created successfully (mock)",
  };
};

/**
 * Find a mock job by id / jobId (created + seed list).
 */
export const findMockJobById = (jobId) => {
  const idStr = String(jobId);
  const all = [...getMockCreatedJobs(), ...MOCK_GET_JOBS_RESPONSE.data.items];
  return (
    all.find(
      (j) =>
        String(j.id) === idStr ||
        String(j.jobId) === idStr ||
        String(j.job_id) === idStr
    ) || null
  );
};

export const buildMockGetJobByIdResponse = (jobId) => {
  const job = findMockJobById(jobId);
  if (!job) {
    return {
      success: false,
      message: "Job not found",
      error: "Not Found",
    };
  }
  return { success: true, data: job };
};

export const buildMockUpdateJobResponse = (jobId, jobData) => {
  const existing = findMockJobById(jobId);
  const id = existing?.id || jobId;
  const updated = {
    ...(existing || {}),
    ...jobData,
    id,
    jobId: existing?.jobId || `JOB-${id}`,
    updatedOn: Date.now(),
  };

  // Replace in created list if present
  const idx = mockCreatedJobs.findIndex(
    (j) => String(j.id) === String(id) || String(j.jobId) === String(jobId)
  );
  if (idx >= 0) {
    mockCreatedJobs[idx] = updated;
  } else {
    addMockCreatedJob(updated);
  }

  return {
    success: true,
    data: updated,
    id,
    job_id: updated.jobId,
    message: "Job updated successfully (mock)",
  };
};
