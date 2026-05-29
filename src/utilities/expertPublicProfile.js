import { parseMonthYearToken } from "@/components/BecomeExpertModal/constants";
import { normalizeExpertUser } from "@/utilities/expertProfileNormalize";

const EMPLOYMENT_LABELS = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  freelance: "Freelance",
  self_employed: "Self-employed",
};

export function employmentTypeLabel(value) {
  if (!value) return "";
  return EMPLOYMENT_LABELS[value] || String(value);
}

export function formatExpertDuration(entry, { currentKey = "isCurrentJob" } = {}) {
  const from =
    typeof entry?.fromDate === "string" ? entry.fromDate.trim() : "";
  const to = typeof entry?.toDate === "string" ? entry.toDate.trim() : "";
  const isCurrent = Boolean(entry?.[currentKey]);

  if (from && (isCurrent || !to)) {
    return `${from} – Present`;
  }
  if (from && to) return `${from} – ${to}`;
  if (from) return from;
  if (to) return to;
  return "";
}

function parseAddress(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw;
}

function parseSocialMedia(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw;
}

/** Map GET /experts/:id payload to a stable public-profile shape. */
export function normalizeExpertPublicProfile(raw) {
  if (!raw || typeof raw !== "object") return null;

  const career = normalizeExpertUser(raw);
  const address = parseAddress(raw.address);
  const socialMedia = parseSocialMedia(raw.social_media ?? raw.socialMedia);

  const firstName = raw.first_name ?? raw.firstName ?? "";
  const lastName = raw.last_name ?? raw.lastName ?? "";
  const expertise = raw.expertise ?? "";
  const about =
    typeof raw.about === "string" && raw.about.trim()
      ? raw.about.trim()
      : "";

  return {
    ...career,
    id: raw.id,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim() || "Expert",
    email: raw.email ?? "",
    expertise,
    about,
    contactCountryCode: raw.contact_country_code ?? raw.contactCountryCode ?? "",
    contactNumber: raw.contact_number ?? raw.contactNumber ?? "",
    isExpertApproved: Boolean(raw.is_expert_approved ?? raw.isExpertApproved),
    subscriptionPlan: raw.subscription_plan ?? raw.subscriptionPlan ?? "",
    createdOn: raw.created_on ?? raw.createdAt ?? raw.created_at,
    profileImageUrl:
      raw.profile_image_url ??
      raw.profileImageUrl ??
      raw.profile_image ??
      raw.avatar ??
      raw.photo ??
      null,
    address,
    socialMedia,
    workExperience: career.workExperience ?? [],
    education: career.education ?? [],
    skills: career.skills ?? [],
  };
}

function compareFromDateDesc(a, b) {
  const aDate = parseMonthYearToken(
    typeof a?.fromDate === "string" ? a.fromDate : ""
  );
  const bDate = parseMonthYearToken(
    typeof b?.fromDate === "string" ? b.fromDate : ""
  );
  if (!aDate?.isValid() && !bDate?.isValid()) return 0;
  if (!aDate?.isValid()) return 1;
  if (!bDate?.isValid()) return -1;
  return bDate.valueOf() - aDate.valueOf();
}

export function sortEntriesByFromDateDesc(entries) {
  if (!Array.isArray(entries)) return [];
  return [...entries].sort(compareFromDateDesc);
}

/** Current job first, then newest `fromDate` first within each group. */
export function sortWorkExperienceByFromDateDesc(entries) {
  if (!Array.isArray(entries)) return [];
  return [...entries].sort((a, b) => {
    const aCurrent = Boolean(a?.isCurrentJob ?? a?.is_current_job);
    const bCurrent = Boolean(b?.isCurrentJob ?? b?.is_current_job);
    if (aCurrent !== bCurrent) return aCurrent ? -1 : 1;
    return compareFromDateDesc(a, b);
  });
}

export function formatExpertLocation(address) {
  if (!address || typeof address !== "object") return "";
  return [address.city, address.state, address.country]
    .filter((part) => part && String(part).trim())
    .join(", ");
}

export function buildAboutFallback(expert) {
  if (expert?.about) return expert.about;
  const name = expert?.fullName || "This expert";
  if (expert?.expertise) {
    return `${name} specializes in ${expert.expertise}.`;
  }
  return "";
}

export function formatExpertContact(expert) {
  if (!expert?.contactNumber) return "";
  const code = expert.contactCountryCode || "";
  return [code, expert.contactNumber].filter(Boolean).join(" ").trim();
}

export function formatMemberSince(timestamp) {
  if (!timestamp) return "";
  const asNumber = Number(timestamp);
  const date = Number.isNaN(asNumber)
    ? new Date(timestamp)
    : new Date(
        String(Math.trunc(asNumber)).length === 10 ? asNumber * 1000 : asNumber
      );
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
