/**
 * Job API mock config + GET response
 *
 * Uses the same seed data as the public Jobs browse module.
 * Flip USE_MOCK_JOBS_API to `false` when the real jobs API is ready.
 */

import { PUBLIC_JOBS_MOCK } from "@/module/PublicJobs/constants/publicJobsMock";

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

/** Seed list shared with public Jobs browse (+ peopleApplied for management table). */
const SEED_JOBS = PUBLIC_JOBS_MOCK.map((job, index) => ({
  ...job,
  hiringStatus: job.hiringStatus || "open",
  peopleApplied: job.peopleApplied ?? [42, 100, 18, 7, 12, 5][index] ?? 0,
  updatedOn: job.updatedOn || job.createdOn || Date.now(),
}));

// Demo history entries for Job History tab (mock only)
if (SEED_JOBS[4]) {
  SEED_JOBS[4] = {
    ...SEED_JOBS[4],
    hiringStatus: "filled",
    isActive: false,
  };
}
if (SEED_JOBS[5]) {
  SEED_JOBS[5] = {
    ...SEED_JOBS[5],
    hiringStatus: "closed",
    isActive: false,
  };
}

/**
 * Mock GET /jobs response shape (matches useJob transform expectations).
 */
export const MOCK_GET_JOBS_RESPONSE = {
  success: true,
  data: {
    total: SEED_JOBS.length,
    page: 1,
    limit: 10,
    totalPages: 1,
    items: SEED_JOBS,
  },
};

const getAllMockJobs = () => [...getMockCreatedJobs(), ...SEED_JOBS];

/**
 * Build a paginated mock GET response (supports search + pagination + companyId).
 */
export const buildMockGetJobsResponse = (params = {}) => {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = String(params.search || "")
    .trim()
    .toLowerCase();
  const companyId =
    params.companyId != null && params.companyId !== ""
      ? String(params.companyId)
      : null;

  const baseItems = getAllMockJobs();

  // Company dashboard: only jobs posted by that company. Admin: no companyId filter.
  let filtered = companyId
    ? baseItems.filter((job) => {
        const ownerId =
          job.postedBy?.companyId ??
          job.postedBy?.company_id ??
          job.posted_by?.companyId ??
          job.posted_by?.company_id;
        return ownerId != null && String(ownerId) === companyId;
      })
    : baseItems;

  if (search) {
    filtered = filtered.filter((job) => {
      const haystack = [
        job.title,
        job.postedBy?.companyName,
        job.location?.city,
        job.location?.country,
        job.employmentType,
        job.workMode,
        job.experienceRequired,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  const listView = String(params.listView || params.list_view || "active")
    .trim()
    .toLowerCase();
  if (listView === "history") {
    filtered = filtered.filter((job) => {
      const hs = job.hiringStatus || job.hiring_status || "open";
      return hs === "filled" || hs === "closed";
    });
  } else if (listView === "active") {
    filtered = filtered.filter((job) => {
      const hs = job.hiringStatus || job.hiring_status || "open";
      return hs !== "filled" && hs !== "closed";
    });
  }

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
    hiringStatus: "open",
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
  return (
    getAllMockJobs().find(
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
