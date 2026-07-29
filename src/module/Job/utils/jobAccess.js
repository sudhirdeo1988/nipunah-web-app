/**
 * Job ownership helpers — company users only see/manage their own jobs;
 * admin (and other non-company roles) are unrestricted for listing.
 */

export function getViewerCompanyId(user) {
  if (!user || typeof user !== "object") return null;
  return user.company_id ?? user.companyId ?? user.id ?? null;
}

export function getJobPostedCompanyId(job) {
  if (!job || typeof job !== "object") return null;
  return (
    job.postedBy?.companyId ??
    job.postedBy?.company_id ??
    job.posted_by?.companyId ??
    job.posted_by?.company_id ??
    null
  );
}

/**
 * @returns {boolean} true if viewer may see/manage this job
 */
export function canViewerAccessJob(job, user, role) {
  const normalizedRole = String(
    role || user?.role || user?.type || ""
  ).toLowerCase();

  // Admin and non-company roles: no company restriction
  if (normalizedRole !== "company") return true;

  const ownerId = getJobPostedCompanyId(job);
  const viewerId = getViewerCompanyId(user);
  if (ownerId == null || viewerId == null) return false;
  return String(ownerId) === String(viewerId);
}
