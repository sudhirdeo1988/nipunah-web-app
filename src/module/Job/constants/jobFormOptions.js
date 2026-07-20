/**
 * Shared option lists for Post / Edit Job forms (Naukri-aligned).
 */

export const EMPLOYMENT_TYPES = [
  { label: "Full-time", value: "Full-time" },
  { label: "Part-time", value: "Part-time" },
  { label: "Contract", value: "Contract" },
  { label: "Internship", value: "Internship" },
];

/** Naukri-style employment nature (e.g. Full Time, Permanent) */
export const EMPLOYMENT_NATURES = [
  { label: "Permanent", value: "Permanent" },
  { label: "Temporary", value: "Temporary" },
  { label: "Contractual", value: "Contractual" },
];

export const EXPERIENCE_RANGES = [
  { label: "0-1 years", value: "0-1 years" },
  { label: "1-3 years", value: "1-3 years" },
  { label: "3-5 years", value: "3-5 years" },
  { label: "5-8 years", value: "5-8 years" },
  { label: "5-15+ years", value: "5-15+ years" },
  { label: "6-11 years", value: "6-11 years" },
  { label: "8-10 years", value: "8-10 years" },
  { label: "8-12 years", value: "8-12 years" },
  { label: "10-15 years", value: "10-15 years" },
  { label: "10+ years", value: "10+ years" },
  { label: "15+ years", value: "15+ years" },
];

export const EDUCATION_SPECIALIZATIONS = [
  { label: "Any Specialization", value: "Any Specialization" },
  { label: "Computer Science", value: "Computer Science" },
  { label: "Information Technology", value: "Information Technology" },
  { label: "Electronics / Communication", value: "Electronics / Communication" },
  { label: "Mechanical", value: "Mechanical" },
  { label: "Other", value: "Other" },
];

export const WORK_MODES = [
  { label: "Office", value: "Office" },
  { label: "Hybrid", value: "Hybrid" },
  { label: "Remote", value: "Remote" },
];

export const ROLE_CATEGORIES = [
  { label: "Software Development", value: "Software Development" },
  { label: "Quality Assurance and Testing", value: "Quality Assurance and Testing" },
  { label: "IT Consulting", value: "IT Consulting" },
  { label: "DBA / Data warehousing", value: "DBA / Data warehousing" },
  { label: "System Programming", value: "System Programming" },
  { label: "DevOps / SRE", value: "DevOps / SRE" },
  { label: "Product Management", value: "Product Management" },
  { label: "Project Management", value: "Project Management" },
  { label: "Sales & Business Development", value: "Sales & Business Development" },
  { label: "Human Resources", value: "Human Resources" },
  { label: "Finance & Accounting", value: "Finance & Accounting" },
  { label: "Marketing", value: "Marketing" },
  { label: "Customer Success / Support", value: "Customer Success / Support" },
  { label: "Operations", value: "Operations" },
  { label: "Other", value: "Other" },
];

export const DEPARTMENTS = [
  { label: "Engineering - Software & QA", value: "Engineering - Software & QA" },
  { label: "Engineering - Hardware & Networks", value: "Engineering - Hardware & Networks" },
  { label: "IT Infrastructure & Operations", value: "IT Infrastructure & Operations" },
  { label: "Data Science & Analytics", value: "Data Science & Analytics" },
  { label: "Product Management", value: "Product Management" },
  { label: "Sales & Business Development", value: "Sales & Business Development" },
  { label: "Customer Success, Service & Operations", value: "Customer Success, Service & Operations" },
  { label: "Human Resources", value: "Human Resources" },
  { label: "Finance & Accounting", value: "Finance & Accounting" },
  { label: "Marketing & Communication", value: "Marketing & Communication" },
  { label: "Consulting", value: "Consulting" },
  { label: "Other", value: "Other" },
];

export const INDUSTRIES = [
  { label: "IT Services & Consulting", value: "IT Services & Consulting" },
  { label: "Software Product", value: "Software Product" },
  { label: "Internet / E-commerce", value: "Internet / E-commerce" },
  { label: "BFSI", value: "BFSI" },
  { label: "Healthcare / Pharma", value: "Healthcare / Pharma" },
  { label: "Manufacturing", value: "Manufacturing" },
  { label: "Telecom / ISP", value: "Telecom / ISP" },
  { label: "Education / EdTech", value: "Education / EdTech" },
  { label: "Logistics / Supply Chain", value: "Logistics / Supply Chain" },
  { label: "Media / Entertainment", value: "Media / Entertainment" },
  { label: "Real Estate", value: "Real Estate" },
  { label: "Other", value: "Other" },
];

export const EDUCATION_OPTIONS = [
  { label: "Any Graduate", value: "Any Graduate" },
  { label: "B.Tech / B.E.", value: "B.Tech / B.E." },
  { label: "B.Sc", value: "B.Sc" },
  { label: "BCA", value: "BCA" },
  { label: "B.Com", value: "B.Com" },
  { label: "MBA / PGDM", value: "MBA / PGDM" },
  { label: "M.Tech / M.E.", value: "M.Tech / M.E." },
  { label: "MCA", value: "MCA" },
  { label: "M.Sc", value: "M.Sc" },
  { label: "Diploma", value: "Diploma" },
  { label: "Any Postgraduate", value: "Any Postgraduate" },
  { label: "Not Required", value: "Not Required" },
];

/**
 * Ant Design validator: require min plain-text length from HTML rich text.
 */
export const richTextMinLength =
  (min, message) =>
  (_, value) => {
    const text = (value || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) {
      return Promise.reject(new Error(message || "This field is required"));
    }
    if (text.length < min) {
      return Promise.reject(
        new Error(message || `Must be at least ${min} characters`)
      );
    }
    return Promise.resolve();
  };
