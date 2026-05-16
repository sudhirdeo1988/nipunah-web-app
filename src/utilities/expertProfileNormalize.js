import { resolveProfileUsername } from "./profileUtils";

/**
 * Maps expert API wire format (workExperienceDTO, educationDTO, skillDTO)
 * to the app shape used by BecomeExpertModal and profile UI.
 */

function coerceSkillList(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object" && item.skill != null) {
        return String(item.skill).trim();
      }
      return "";
    })
    .filter(Boolean);
}

function coerceExperienceList(raw) {
  return Array.isArray(raw) ? raw : [];
}

/** True when API DTO keys are absent or canonical app arrays are already present. */
export function isExpertProfileNormalized(raw) {
  if (!raw || typeof raw !== "object") return true;

  const hasDto =
    raw.workExperienceDTO != null ||
    raw.educationDTO != null ||
    raw.skillDTO != null;

  if (!hasDto) return true;

  return (
    Array.isArray(raw.workExperience) &&
    Array.isArray(raw.education) &&
    Array.isArray(raw.skills)
  );
}

/**
 * Normalize expert profile from GET /experts/:id (or merged session user).
 * Returns the same reference when already normalized (avoids extra re-renders).
 */
export function normalizeExpertUser(raw) {
  if (!raw || typeof raw !== "object") return {};
  if (isExpertProfileNormalized(raw)) return raw;

  const workExperience = coerceExperienceList(
    raw.workExperience ?? raw.workExperienceDTO
  );
  const education = coerceExperienceList(raw.education ?? raw.educationDTO);
  const skills = coerceSkillList(raw.skills ?? raw.skillDTO);

  return {
    ...raw,
    workExperience,
    education,
    skills,
  };
}

/**
 * Build PUT body for expert profile update (API expects *DTO field names).
 * Only maps fields present on the payload so partial updates cannot wipe career data.
 */
export function expertProfileToApiPayload(profile) {
  if (!profile || typeof profile !== "object") return profile;

  const {
    workExperience,
    education,
    skills,
    workExperienceDTO,
    educationDTO,
    skillDTO,
    ...rest
  } = profile;

  const result = { ...rest };

  if (workExperience !== undefined || workExperienceDTO !== undefined) {
    result.workExperienceDTO = coerceExperienceList(
      workExperience !== undefined ? workExperience : workExperienceDTO
    );
  }

  if (education !== undefined || educationDTO !== undefined) {
    result.educationDTO = coerceExperienceList(
      education !== undefined ? education : educationDTO
    );
  }

  if (skills !== undefined || skillDTO !== undefined) {
    const skillRows = coerceSkillList(
      skills !== undefined ? skills : skillDTO
    );
    result.skillDTO = skillRows.map((skill) =>
      typeof skill === "string" ? { skill } : skill
    );
  }

  return result;
}

/** Basic-info form initial values from stored expert user. */
export function expertBasicInfoFormValues(user) {
  const u = user && typeof user === "object" ? user : {};
  const address =
    u.address && typeof u.address === "object" && !Array.isArray(u.address)
      ? u.address
      : {};

  const email = u.email ?? "";
  return {
    first_name: u.first_name ?? "",
    last_name: u.last_name ?? "",
    email,
    username: resolveProfileUsername(u),
    contact_country_code: u.contact_country_code ?? undefined,
    contact_number: u.contact_number ?? "",
    address: {
      country: address.country ?? undefined,
      state: address.state ?? "",
      city: address.city ?? "",
      location: address.location ?? "",
      postal_code: address.postal_code ?? "",
    },
  };
}
