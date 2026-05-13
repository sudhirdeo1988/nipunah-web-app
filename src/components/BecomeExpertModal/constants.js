import dayjs from "dayjs";

/** Employment type options for work experience */
export const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
  { value: "self_employed", label: "Self-employed" },
];

/** Default form initial values */
export const INITIAL_VALUES = {
  workExperience: [
    {
      jobTitle: "",
      employmentType: undefined,
      company: "",
      isCurrentJob: false,
      // Internal-only: month pickers; submitted as `fromDate` / `toDate` strings ("MMM YYYY").
      companyWorkDurationFrom: undefined,
      companyWorkDurationTo: undefined,
    },
  ],
  skills: [""],
  education: [
    {
      title: "",
      schoolCollege: "",
      isCurrentlyServing: false,
      // Internal-only pickers → API `fromDate` / `toDate` on submit.
      timePeriodFrom: undefined,
      timePeriodTo: undefined,
      description: "",
    },
  ],
};

/** Wire-format month-year token, e.g. "Jan 2020". */
const MONTH_YEAR_TOKEN_FORMAT = "MMM YYYY";

/** Maps lower-cased month abbreviation/full-name -> 0..11 index. */
const MONTH_NAME_TO_INDEX = (() => {
  const map = {};
  const abbr = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec",
  ];
  const full = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];
  abbr.forEach((m, i) => {
    map[m] = i;
  });
  full.forEach((m, i) => {
    map[m] = i;
  });
  // "sept" is a common variant for September
  map.sept = 8;
  return map;
})();

/**
 * Parse a single month/year token from common formats:
 * - "MMM YYYY"  e.g. "Jan 2020", "January 2020", "Sept 2020"
 * - "MM/YYYY"   e.g. "01/2020"
 * - "YYYY-MM"   e.g. "2020-01"
 * - "YYYY"      e.g. "2020"  (legacy year-only; defaults to January)
 *
 * Returns a `dayjs` object at the start of that month, or `null` if unparseable.
 */
export const parseMonthYearToken = (token) => {
  if (!token || typeof token !== "string") return null;
  const t = token.trim();
  if (!t) return null;

  // "MMM YYYY" / "MMMM YYYY"
  let m = t.match(/^([a-z]+)\s+(\d{4})$/i);
  if (m) {
    const monthIdx = MONTH_NAME_TO_INDEX[m[1].toLowerCase()];
    const year = parseInt(m[2], 10);
    if (monthIdx !== undefined && Number.isFinite(year)) {
      return dayjs().year(year).month(monthIdx).startOf("month");
    }
  }

  // "MM/YYYY"
  m = t.match(/^(\d{1,2})\/(\d{4})$/);
  if (m) {
    const monthIdx = parseInt(m[1], 10) - 1;
    const year = parseInt(m[2], 10);
    if (monthIdx >= 0 && monthIdx < 12 && Number.isFinite(year)) {
      return dayjs().year(year).month(monthIdx).startOf("month");
    }
  }

  // "YYYY-MM"
  m = t.match(/^(\d{4})-(\d{1,2})$/);
  if (m) {
    const year = parseInt(m[1], 10);
    const monthIdx = parseInt(m[2], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12 && Number.isFinite(year)) {
      return dayjs().year(year).month(monthIdx).startOf("month");
    }
  }

  // Legacy year-only ("2020") — default to January so the picker has something
  // sensible to display, while still letting the user pick a real month.
  m = t.match(/^(\d{4})$/);
  if (m) {
    const year = parseInt(m[1], 10);
    if (Number.isFinite(year)) {
      return dayjs().year(year).month(0).startOf("month");
    }
  }

  return null;
};

/** Single month-year string for API fields `fromDate` / `toDate`, e.g. "Jan 2026". */
export const formatMonthYearToken = (dayjsValue) => {
  if (!dayjsValue || typeof dayjsValue?.format !== "function") return "";
  return dayjsValue.format(MONTH_YEAR_TOKEN_FORMAT);
};

/**
 * Build the wire-format month-year range string from dayjs From / To values.
 * - Both set: "MMM YYYY - MMM YYYY"
 * - Only one set: that single "MMM YYYY"
 * - Neither: ""
 */
export const formatMonthYearRange = (fromDayjs, toDayjs) => {
  const fromStr =
    fromDayjs && typeof fromDayjs?.format === "function"
      ? fromDayjs.format(MONTH_YEAR_TOKEN_FORMAT)
      : "";
  const toStr =
    toDayjs && typeof toDayjs?.format === "function"
      ? toDayjs.format(MONTH_YEAR_TOKEN_FORMAT)
      : "";
  if (fromStr && toStr) return `${fromStr} - ${toStr}`;
  if (fromStr) return fromStr;
  if (toStr) return toStr;
  return "";
};

/**
 * Parse an existing month-year range string back into dayjs From / To values.
 *
 * Accepts ranges separated by `-`, `–` or `—` (with optional whitespace) and
 * tolerates the legacy year-only format ("2020 - 2024") so previously-saved
 * data still pre-populates correctly.
 */
export const parseMonthYearRange = (value) => {
  if (!value || typeof value !== "string") {
    return { from: undefined, to: undefined };
  }
  const parts = value
    .split(/\s*[-–—]\s*/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) return { from: undefined, to: undefined };

  const from = parseMonthYearToken(parts[0]);
  const to = parts.length > 1 ? parseMonthYearToken(parts[1]) : null;

  return {
    from: from || undefined,
    to: to || undefined,
  };
};
