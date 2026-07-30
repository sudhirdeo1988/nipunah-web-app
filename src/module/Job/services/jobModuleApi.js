/**
 * Job module API client (mock-ready).
 *
 * Flip USE_MOCK → false (or replace method bodies) when backend endpoints are live.
 * Every method logs payload and returns a consistent { success, data, message } shape.
 */

import axiosInstance from "@/utilities/axiosInstance";

/** Set false when real job-module APIs are ready */
export const USE_MOCK_JOB_MODULE_API = true;

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

const ok = (data, message = "OK") => ({
  success: true,
  data,
  message,
});

const fail = (message, status = 400) => {
  const err = new Error(message);
  err.response = { status, data: { success: false, message } };
  throw err;
};

/**
 * Applicants (company / admin — job detail → Applied candidates)
 */
export const jobApplicantsApi = {
  /**
   * GET /api/jobs/:jobId/applicants
   * Query: { status?, page?, limit? }
   */
  list: async (jobId, params = {}) => {
    console.log("\n📦 [jobApplicantsApi.list] GET /jobs/" + jobId + "/applicants");
    console.log("Query:", params);
    if (USE_MOCK_JOB_MODULE_API) {
      await delay(300);
      const { buildMockGetApplicantsResponse } = await import(
        "@/module/Job/constants/mockApplicants"
      );
      const mock = buildMockGetApplicantsResponse(jobId, params);
      console.log("✅ Mock response:", mock);
      return mock;
    }
    return axiosInstance.get(`/jobs/${jobId}/applicants`, { params });
  },

  /**
   * PATCH /api/jobs/:jobId/applicants/:applicantId/status
   * Body: { status, remarks?, interview? }
   */
  updateStatus: async (jobId, applicantId, payload) => {
    console.log(
      "\n📦 [jobApplicantsApi.updateStatus] PATCH /jobs/" +
        jobId +
        "/applicants/" +
        applicantId +
        "/status"
    );
    console.log(JSON.stringify(payload, null, 2));
    if (USE_MOCK_JOB_MODULE_API) {
      await delay(400);
      const mock = ok(
        { jobId, applicantId, ...payload, updatedAt: new Date().toISOString() },
        "Applicant status updated (mock)"
      );
      console.log("✅ Mock response:", mock);
      return mock;
    }
    return axiosInstance.patch(
      `/jobs/${jobId}/applicants/${applicantId}/status`,
      payload
    );
  },

  /**
   * POST /api/jobs/:jobId/applicants/:applicantId/interview
   * Body: { date, time, mode, locationOrLink?, remarks? }
   */
  scheduleInterview: async (jobId, applicantId, payload) => {
    console.log(
      "\n📦 [jobApplicantsApi.scheduleInterview] POST /jobs/" +
        jobId +
        "/applicants/" +
        applicantId +
        "/interview"
    );
    console.log(JSON.stringify(payload, null, 2));
    if (USE_MOCK_JOB_MODULE_API) {
      await delay(400);
      const mock = ok(
        {
          jobId,
          applicantId,
          interview: payload,
          status: "interview_scheduled",
        },
        "Interview scheduled (mock)"
      );
      console.log("✅ Mock response:", mock);
      return mock;
    }
    return axiosInstance.post(
      `/jobs/${jobId}/applicants/${applicantId}/interview`,
      payload
    );
  },

  /**
   * POST /api/jobs/:jobId/applicants/:applicantId/reject
   * Body: { remarks? }
   */
  reject: async (jobId, applicantId, payload = {}) => {
    console.log(
      "\n📦 [jobApplicantsApi.reject] POST /jobs/" +
        jobId +
        "/applicants/" +
        applicantId +
        "/reject"
    );
    console.log(JSON.stringify(payload, null, 2));
    if (USE_MOCK_JOB_MODULE_API) {
      await delay(400);
      const mock = ok(
        { jobId, applicantId, status: "rejected", ...payload },
        "Applicant rejected (mock)"
      );
      console.log("✅ Mock response:", mock);
      return mock;
    }
    return axiosInstance.post(
      `/jobs/${jobId}/applicants/${applicantId}/reject`,
      payload
    );
  },
};

/**
 * My applications (expert / user — Job Applications)
 */
export const myApplicationsApi = {
  /**
   * GET /api/job-applications/me
   * Query: { status?, fromDate?, toDate?, page?, limit? }
   */
  list: async (params = {}) => {
    console.log("\n📦 [myApplicationsApi.list] GET /job-applications/me");
    console.log("Query:", params);
    if (USE_MOCK_JOB_MODULE_API) {
      await delay(250);
      const mock = ok([], "Mock list is assembled client-side from applied IDs");
      console.log("✅ Mock response:", mock);
      return mock;
    }
    return axiosInstance.get("/job-applications/me", { params });
  },

  /**
   * POST /api/job-applications/:applicationId/respond
   * Body: { response: "accepted"|"rejected", remarks? }
   */
  respond: async (applicationId, payload) => {
    console.log(
      "\n📦 [myApplicationsApi.respond] POST /job-applications/" +
        applicationId +
        "/respond"
    );
    console.log(JSON.stringify(payload, null, 2));
    if (USE_MOCK_JOB_MODULE_API) {
      await delay(400);
      const mock = ok(
        { applicationId, ...payload, respondedAt: new Date().toISOString() },
        "Application response saved (mock)"
      );
      console.log("✅ Mock response:", mock);
      return mock;
    }
    return axiosInstance.post(
      `/job-applications/${applicationId}/respond`,
      payload
    );
  },

  /**
   * DELETE /api/job-applications/:applicationId
   * Body (optional): { remarks? } — reject-then-delete
   */
  remove: async (applicationId, payload = {}) => {
    console.log(
      "\n📦 [myApplicationsApi.remove] DELETE /job-applications/" +
        applicationId
    );
    console.log(JSON.stringify(payload, null, 2));
    if (USE_MOCK_JOB_MODULE_API) {
      await delay(400);
      const mock = ok(
        { applicationId, deleted: true },
        "Application rejected and deleted (mock)"
      );
      console.log("✅ Mock response:", mock);
      return mock;
    }
    return axiosInstance.delete(`/job-applications/${applicationId}`, {
      data: payload,
    });
  },
};

/**
 * Public apply
 */
export const publicApplyApi = {
  /**
   * POST /api/jobs/:jobId/apply
   * multipart or JSON: { coverLetter?, resumeFile?, ... }
   */
  apply: async (jobId, payload, resumeFile) => {
    console.log("\n📦 [publicApplyApi.apply] POST /jobs/" + jobId + "/apply");
    console.log(JSON.stringify(payload, null, 2));
    console.log("📎 Resume:", resumeFile?.name || null);
    if (USE_MOCK_JOB_MODULE_API) {
      await delay(700);
      if (!jobId) fail("jobId is required");
      const mock = ok(
        {
          applicationId: `APP-${Date.now()}`,
          jobId,
          status: "applied",
          appliedAt: new Date().toISOString().slice(0, 10),
        },
        "Application submitted (mock)"
      );
      console.log("✅ Mock response:", mock);
      return mock;
    }
    const formData = new FormData();
    Object.entries(payload || {}).forEach(([k, v]) => {
      if (v != null) formData.append(k, v);
    });
    if (resumeFile) formData.append("resume", resumeFile);
    return axiosInstance.post(`/jobs/${jobId}/apply`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
