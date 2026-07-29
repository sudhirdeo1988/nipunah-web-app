import dayjs from "dayjs";
import { find as _find } from "lodash-es";
import CountryDetails from "@/utilities/CountryDetails.json";

/**
 * Normalize skills from API (array of tags or HTML string) for the RTE.
 */
export const normalizeSkillsForForm = (skills) => {
  if (!skills) return "";
  if (typeof skills === "string") return skills;
  if (Array.isArray(skills)) {
    const unique = [...new Set(skills.filter(Boolean))];
    if (unique.length === 0) return "";
    return `<ul>${unique.map((s) => `<li>${s}</li>`).join("")}</ul>`;
  }
  return "";
};

export const normalizeTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return [...new Set(tags.filter(Boolean))];
  if (typeof tags === "string" && tags.trim()) return [tags.trim()];
  return [];
};

/**
 * Map a job record (API or list transform) into CreateJobForm field values.
 */
export const mapJobToFormValues = (job) => {
  if (!job) return {};

  let salaryRangeValue = "";
  let salaryNotDisclosedValue = !!(
    job.salaryNotDisclosed || job.salary_not_disclosed
  );
  const salaryObj = job.salary_range || job.salaryRange;
  if (salaryObj && typeof salaryObj === "object") {
    const minRaw = String(salaryObj.min || "").trim();
    const maxRaw = String(salaryObj.max || "").trim();
    if (/not\s*disclosed/i.test(minRaw) || /not\s*disclosed/i.test(maxRaw)) {
      salaryNotDisclosedValue = true;
    } else if (minRaw && maxRaw && minRaw !== maxRaw) {
      salaryRangeValue = `${minRaw} - ${maxRaw}`;
    } else {
      salaryRangeValue = minRaw || maxRaw || "";
    }
  } else if (typeof job.salaryRange === "string" && job.salaryRange) {
    if (/not\s*disclosed/i.test(job.salaryRange)) {
      salaryNotDisclosedValue = true;
    } else {
      salaryRangeValue = job.salaryRange.trim();
    }
  }

  const locationObj =
    job.locationObj ||
    (typeof job.location === "object" ? job.location : {}) ||
    {};
  const city = locationObj.city || "";
  const state = locationObj.state || "";
  const pincode = locationObj.pinCode || locationObj.pincode || "";
  let countryCode = locationObj.countryCode || locationObj.country || "";

  if (countryCode && countryCode.length > 2) {
    const countryData = _find(
      CountryDetails,
      (c) => c.countryName === countryCode
    );
    if (countryData) {
      countryCode = countryData.countryCode;
    }
  }

  let deadlineValue = null;
  if (job.applicationDeadline) {
    deadlineValue = dayjs(job.applicationDeadline);
  } else if (job.application_deadline) {
    deadlineValue = dayjs(job.application_deadline);
  }

  let postedDateValue = null;
  if (job.jobPostedDate || job.job_posted_date) {
    postedDateValue = dayjs(job.jobPostedDate || job.job_posted_date);
  } else if (job.postedDate || job.posted_date) {
    postedDateValue = dayjs(job.postedDate || job.posted_date);
  }

  return {
    title: job.title || "",
    experience_required: job.experienceRequired || job.experience_required || "",
    employment_type: job.employmentType || job.employment_type || "",
    employment_nature:
      job.employmentNature || job.employment_nature || "Permanent",
    work_mode: job.workMode || job.work_mode || "Office",
    openings: job.openings != null ? Number(job.openings) : 1,
    qualifications: job.qualifications || "",
    salary_not_disclosed: salaryNotDisclosedValue,
    salary_range: salaryRangeValue,
    description: job.description || "",
    key_responsibilities:
      job.keyResponsibilities || job.key_responsibilities || "",
    required_skills: normalizeSkillsForForm(
      job.requiredSkills ||
        job.required_skills ||
        job.skillsRequired ||
        job.skills_required
    ),
    we_offer: job.weOffer || job.we_offer || "",
    job_posted_date: postedDateValue || dayjs(),
    application_deadline: deadlineValue,
    status: job.status || "pending",
    isActive:
      job.isActive !== undefined
        ? job.isActive
        : job.is_active !== undefined
        ? job.is_active
        : true,
    location: {
      city,
      state,
      pincode,
      country: countryCode,
    },
  };
};

export const JOB_EDIT_STORAGE_PREFIX = "nipunah_job_edit_";

export const stashJobForEdit = (job) => {
  if (!job) return;
  const id = job.id || job.jobId || job.job_id;
  if (!id) return;
  try {
    sessionStorage.setItem(
      `${JOB_EDIT_STORAGE_PREFIX}${id}`,
      JSON.stringify(job)
    );
  } catch (e) {
    console.warn("Could not stash job for edit:", e);
  }
};

export const readStashedJobForEdit = (jobId) => {
  if (!jobId) return null;
  try {
    const raw = sessionStorage.getItem(`${JOB_EDIT_STORAGE_PREFIX}${jobId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};
