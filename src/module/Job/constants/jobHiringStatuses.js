/**
 * Job hiring lifecycle (separate from moderation status pending/approved/blocked).
 * Filled / Closed jobs leave active listings and appear in job history.
 */
export const JOB_HIRING_STATUS = {
  OPEN: "open",
  FILLED: "filled",
  CLOSED: "closed",
};

export const JOB_HIRING_STATUS_META = {
  [JOB_HIRING_STATUS.OPEN]: {
    label: "Open",
    color: "success",
  },
  [JOB_HIRING_STATUS.FILLED]: {
    label: "Filled",
    color: "purple",
  },
  [JOB_HIRING_STATUS.CLOSED]: {
    label: "Closed",
    color: "default",
  },
};

/** Options for closing a job after hiring is complete */
export const JOB_CLOSURE_OPTIONS = [
  {
    value: JOB_HIRING_STATUS.FILLED,
    label: "Filled",
    description: "Position was filled. Job moves to history.",
  },
  {
    value: JOB_HIRING_STATUS.CLOSED,
    label: "Closed",
    description: "Hiring stopped without filling. Job moves to history.",
  },
];

export const JOB_LIST_VIEW = {
  ACTIVE: "active",
  HISTORY: "history",
};

export const getHiringStatus = (job) =>
  job?.hiringStatus ||
  job?.hiring_status ||
  JOB_HIRING_STATUS.OPEN;

export const getHiringStatusLabel = (status) =>
  JOB_HIRING_STATUS_META[status]?.label || status || "Open";

export const getHiringStatusColor = (status) =>
  JOB_HIRING_STATUS_META[status]?.color || "default";

export const isJobInHistory = (job) => {
  const status = getHiringStatus(job);
  return (
    status === JOB_HIRING_STATUS.FILLED ||
    status === JOB_HIRING_STATUS.CLOSED
  );
};

export const isJobActiveListing = (job) => !isJobInHistory(job);

/** Payload when company marks a job Filled or Closed */
export const buildJobClosurePayload = (hiringStatus) => ({
  hiringStatus,
  hiring_status: hiringStatus,
  isActive: false,
  is_active: false,
});
