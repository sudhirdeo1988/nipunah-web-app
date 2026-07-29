const STORAGE_PREFIX = "nipunah_applied_jobs_";

const getUserKey = (user) => {
  if (!user) return null;
  const id = user.id ?? user.user_id ?? user.userId ?? user.email;
  if (id == null || id === "") return null;
  return String(id);
};

const storageKey = (user) => {
  const userKey = getUserKey(user);
  if (!userKey) return null;
  return `${STORAGE_PREFIX}${userKey}`;
};

/**
 * Read applied job ids for the given user (mock persistence until API exists).
 * @returns {string[]}
 */
export const getAppliedJobIds = (user) => {
  if (typeof window === "undefined") return [];
  const key = storageKey(user);
  if (!key) return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

/**
 * Persist that the user applied to a job.
 */
export const markJobApplied = (user, jobId) => {
  if (typeof window === "undefined" || jobId == null) return getAppliedJobIds(user);
  const key = storageKey(user);
  if (!key) return [];
  const id = String(jobId);
  const existing = getAppliedJobIds(user);
  if (existing.includes(id)) return existing;
  const next = [...existing, id];
  try {
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch (e) {
    console.warn("Could not persist applied job:", e);
  }
  return next;
};

export const hasUserAppliedToJob = (user, job) => {
  if (!job) return false;
  const ids = getAppliedJobIds(user);
  const jobId = job.id ?? job.jobId ?? job.job_id;
  if (jobId == null) return false;
  return ids.includes(String(jobId));
};
