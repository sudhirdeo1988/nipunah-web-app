import {
  APPLICATION_STATUS,
  getStatusLabel,
} from "@/module/Job/constants/applicationStatuses";
import { createStageEntry } from "@/module/Job/constants/mockApplicants";
import { PUBLIC_JOBS_MOCK } from "@/module/PublicJobs/constants/publicJobsMock";

/** Candidate response to their application (independent of company status). */
export const CANDIDATE_RESPONSE = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

export const getCandidateResponseLabel = (response) => {
  if (response === CANDIDATE_RESPONSE.ACCEPTED) return "Accepted";
  if (response === CANDIDATE_RESPONSE.REJECTED) return "Rejected";
  return "Pending";
};

const formatLocation = (location) => {
  if (!location) return "N/A";
  if (typeof location === "string") return location;
  return [location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ");
};

const formatSalary = (job) => {
  if (job.salaryNotDisclosed) return "Not Disclosed";
  const range = job.salaryRange;
  if (!range) return "N/A";
  if (typeof range === "string") return range;
  const min = range.min;
  const max = range.max;
  if (min && max) return `${min} - ${max}`;
  return min || max || "N/A";
};

/**
 * Demo application templates (status / interview / remarks) reused across jobs.
 */
const APPLICATION_TEMPLATES = [
  {
    status: APPLICATION_STATUS.APPLIED,
    appliedDate: "2026-07-22",
    remarks: "",
    interview: null,
    stageHistory: [
      createStageEntry({
        status: APPLICATION_STATUS.APPLIED,
        remarks: "You applied for this role.",
        date: "2026-07-22",
      }),
    ],
  },
  {
    status: APPLICATION_STATUS.UNDER_REVIEW,
    appliedDate: "2026-07-18",
    remarks: "Your profile is under review by the hiring team.",
    interview: null,
    stageHistory: [
      createStageEntry({
        status: APPLICATION_STATUS.APPLIED,
        remarks: "You applied for this role.",
        date: "2026-07-18",
      }),
      createStageEntry({
        status: APPLICATION_STATUS.UNDER_REVIEW,
        remarks: "Your profile is under review by the hiring team.",
        date: "2026-07-20",
      }),
    ],
  },
  {
    status: APPLICATION_STATUS.SHORTLISTED,
    appliedDate: "2026-07-15",
    remarks: "You have been shortlisted for the next round.",
    interview: null,
    stageHistory: [
      createStageEntry({
        status: APPLICATION_STATUS.APPLIED,
        remarks: "You applied for this role.",
        date: "2026-07-15",
      }),
      createStageEntry({
        status: APPLICATION_STATUS.UNDER_REVIEW,
        remarks: "Profile matched role requirements.",
        date: "2026-07-16",
      }),
      createStageEntry({
        status: APPLICATION_STATUS.SHORTLISTED,
        remarks: "You have been shortlisted for the next round.",
        date: "2026-07-18",
      }),
    ],
  },
  {
    status: APPLICATION_STATUS.INTERVIEW_SCHEDULED,
    appliedDate: "2026-07-10",
    remarks: "Interview scheduled — please confirm your availability.",
    interview: {
      date: "2026-08-05",
      time: "11:00",
      mode: "video",
      meetingLink: "https://meet.example.com/interview-demo",
      location: "",
    },
    stageHistory: [
      createStageEntry({
        status: APPLICATION_STATUS.APPLIED,
        remarks: "You applied for this role.",
        date: "2026-07-10",
      }),
      createStageEntry({
        status: APPLICATION_STATUS.SHORTLISTED,
        remarks: "Shortlisted after resume screening.",
        date: "2026-07-14",
      }),
      createStageEntry({
        status: APPLICATION_STATUS.INTERVIEW_SCHEDULED,
        remarks: "Interview scheduled — please confirm your availability.",
        date: "2026-07-16",
        interview: {
          date: "2026-08-05",
          time: "11:00",
          mode: "video",
          meetingLink: "https://meet.example.com/interview-demo",
        },
      }),
    ],
  },
  {
    status: APPLICATION_STATUS.SELECTED,
    appliedDate: "2026-07-05",
    remarks: "Congratulations — you have been selected. Please accept or reject the offer.",
    interview: {
      date: "2026-07-25",
      time: "15:00",
      mode: "in_person",
      location: "Pune Office",
      meetingLink: "",
    },
    stageHistory: [
      createStageEntry({
        status: APPLICATION_STATUS.APPLIED,
        remarks: "You applied for this role.",
        date: "2026-07-05",
      }),
      createStageEntry({
        status: APPLICATION_STATUS.INTERVIEW_SCHEDULED,
        remarks: "Interview completed.",
        date: "2026-07-20",
        interview: {
          date: "2026-07-25",
          time: "15:00",
          mode: "in_person",
          location: "Pune Office",
        },
      }),
      createStageEntry({
        status: APPLICATION_STATUS.SELECTED,
        remarks: "Congratulations — you have been selected.",
        date: "2026-07-28",
      }),
    ],
  },
  {
    status: APPLICATION_STATUS.REJECTED,
    appliedDate: "2026-07-01",
    remarks: "Thank you for applying. The company has moved forward with other candidates.",
    interview: null,
    stageHistory: [
      createStageEntry({
        status: APPLICATION_STATUS.APPLIED,
        remarks: "You applied for this role.",
        date: "2026-07-01",
      }),
      createStageEntry({
        status: APPLICATION_STATUS.UNDER_REVIEW,
        remarks: "Application reviewed.",
        date: "2026-07-05",
      }),
      createStageEntry({
        status: APPLICATION_STATUS.REJECTED,
        remarks: "The company has moved forward with other candidates.",
        date: "2026-07-08",
      }),
    ],
  },
];

const cloneTemplate = (template) => ({
  ...template,
  interview: template.interview ? { ...template.interview } : null,
  stageHistory: (template.stageHistory || []).map((s) => ({
    ...s,
    id: s.id || `stage-${Math.random().toString(36).slice(2, 8)}`,
    interview: s.interview ? { ...s.interview } : null,
  })),
});

/**
 * Build mock "my applications" list from public/seed jobs + application templates.
 * Also includes jobs the user applied to via public browse (localStorage ids).
 */
export const buildMockMyApplications = (appliedJobIds = []) => {
  const seedJobs = PUBLIC_JOBS_MOCK.filter((job) => {
    const hs = job.hiringStatus || job.hiring_status || "open";
    return hs !== "filled" && hs !== "closed";
  });

  const byId = new Map();

  seedJobs.slice(0, APPLICATION_TEMPLATES.length).forEach((job, index) => {
    const template = cloneTemplate(APPLICATION_TEMPLATES[index]);
    const id = String(job.id ?? job.jobId);
    byId.set(id, {
      id: `my-app-${id}`,
      applicationId: `my-app-${id}`,
      jobId: id,
      jobTitle: job.title,
      companyName: job.postedBy?.companyName || "Company",
      companyShortName: job.postedBy?.companyShortName || "",
      location: formatLocation(job.location),
      experienceRequired: job.experienceRequired || "N/A",
      employmentType: job.employmentType || "N/A",
      workMode: job.workMode || "N/A",
      salary: formatSalary(job),
      appliedDate: template.appliedDate,
      status: template.status,
      statusLabel: getStatusLabel(template.status),
      remarks: template.remarks,
      interview: template.interview,
      stageHistory: template.stageHistory,
      candidateResponse: CANDIDATE_RESPONSE.PENDING,
      candidateResponseAt: null,
      candidateRemarks: "",
    });
  });

  // Merge applications from public apply storage (default to Applied)
  (appliedJobIds || []).forEach((rawId) => {
    const id = String(rawId);
    if (byId.has(id)) return;
    const job =
      PUBLIC_JOBS_MOCK.find(
        (j) => String(j.id) === id || String(j.jobId) === id
      ) || null;
    if (!job) return;
    const appliedDate = new Date().toISOString().slice(0, 10);
    byId.set(id, {
      id: `my-app-${id}`,
      applicationId: `my-app-${id}`,
      jobId: id,
      jobTitle: job.title,
      companyName: job.postedBy?.companyName || "Company",
      companyShortName: job.postedBy?.companyShortName || "",
      location: formatLocation(job.location),
      experienceRequired: job.experienceRequired || "N/A",
      employmentType: job.employmentType || "N/A",
      workMode: job.workMode || "N/A",
      salary: formatSalary(job),
      appliedDate,
      status: APPLICATION_STATUS.APPLIED,
      statusLabel: getStatusLabel(APPLICATION_STATUS.APPLIED),
      remarks: "",
      interview: null,
      stageHistory: [
        createStageEntry({
          status: APPLICATION_STATUS.APPLIED,
          remarks: "You applied for this role.",
          date: appliedDate,
        }),
      ],
      candidateResponse: CANDIDATE_RESPONSE.PENDING,
      candidateResponseAt: null,
      candidateRemarks: "",
    });
  });

  return Array.from(byId.values()).sort((a, b) =>
    String(b.appliedDate || "").localeCompare(String(a.appliedDate || ""))
  );
};

export const canCandidateRespond = (application) => {
  if (!application) return false;
  // Hide Accept / Reject if company rejected the candidate
  if (application.status === APPLICATION_STATUS.REJECTED) return false;
  // Hide Accept / Reject if the user already rejected (or accepted)
  if (application.candidateResponse === CANDIDATE_RESPONSE.REJECTED) {
    return false;
  }
  if (application.candidateResponse === CANDIDATE_RESPONSE.ACCEPTED) {
    return false;
  }
  return true;
};
