export const APPLICATION_STATUS = {
  APPLIED: "applied",
  UNDER_REVIEW: "under_review",
  SHORTLISTED: "shortlisted",
  INTERVIEW_SCHEDULED: "interview_scheduled",
  SELECTED: "selected",
  REJECTED: "rejected",
};

export const APPLICATION_STATUS_META = {
  [APPLICATION_STATUS.APPLIED]: {
    label: "Applied",
    color: "blue",
  },
  [APPLICATION_STATUS.UNDER_REVIEW]: {
    label: "Under Review",
    color: "cyan",
  },
  [APPLICATION_STATUS.SHORTLISTED]: {
    label: "Shortlisted",
    color: "green",
  },
  [APPLICATION_STATUS.INTERVIEW_SCHEDULED]: {
    label: "Interview Scheduled",
    color: "orange",
  },
  [APPLICATION_STATUS.SELECTED]: {
    label: "Selected",
    color: "purple",
  },
  [APPLICATION_STATUS.REJECTED]: {
    label: "Rejected",
    color: "red",
  },
};

/** Filters shown on Applied candidates tab */
export const APPLICATION_STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: APPLICATION_STATUS.APPLIED, label: "Applied" },
  { key: APPLICATION_STATUS.UNDER_REVIEW, label: "Under Review" },
  { key: APPLICATION_STATUS.SHORTLISTED, label: "Shortlisted" },
  { key: APPLICATION_STATUS.INTERVIEW_SCHEDULED, label: "Interview Scheduled" },
  { key: APPLICATION_STATUS.SELECTED, label: "Selected" },
  { key: APPLICATION_STATUS.REJECTED, label: "Rejected" },
];

/** Statuses company can set after review / interview */
export const UPDATABLE_APPLICATION_STATUSES = [
  APPLICATION_STATUS.UNDER_REVIEW,
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.INTERVIEW_SCHEDULED,
  APPLICATION_STATUS.SELECTED,
  APPLICATION_STATUS.REJECTED,
];

export const INTERVIEW_MODES = [
  { value: "in_person", label: "In Person" },
  { value: "video", label: "Video Call" },
  { value: "phone", label: "Phone" },
];

export const getStatusLabel = (status) =>
  APPLICATION_STATUS_META[status]?.label || status || "N/A";

export const getStatusColor = (status) =>
  APPLICATION_STATUS_META[status]?.color || "default";
