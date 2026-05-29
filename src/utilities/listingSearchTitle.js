/** Title-case each word (e.g. "tax advisory" → "Tax Advisory"). */
export function toTitleCaseWords(value) {
  if (!value || typeof value !== "string") return "";
  return value
    .trim()
    .split(/\s+/)
    .map((word) =>
      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""
    )
    .join(" ");
}

/**
 * Experts listing heading from expertise + location filters only.
 * - No filters → "Experts"
 * - Type only → "{Type}"
 * - Location only → "From {Location}"
 * - Both → "{Type} from {Location}"
 */
export function buildExpertsListingTitle({ typeLabel = "", location = "" } = {}) {
  const type = toTitleCaseWords(typeLabel);
  const loc = toTitleCaseWords(location);
  const hasType = Boolean(type);
  const hasLocation = Boolean(loc);

  if (!hasType && !hasLocation) return "Experts";
  if (hasType && hasLocation) return `${type} from ${loc}`;
  if (hasType) return type;
  return `From ${loc}`;
}

/**
 * Build listing page section titles from active search filters.
 *
 * Used by company / equipment listings (search + type + location variants).
 */

/**
 * @param {object} options
 * @param {string} options.entityPlural e.g. "Experts", "Companies", "Equipment"
 * @param {string} options.entitySingular e.g. "Expert", "Company", "Equipment"
 * @param {string} [options.search]
 * @param {number} [options.minSearchLength]
 * @param {string} [options.typeLabel]
 * @param {string} [options.location]
 */
export function buildListingSearchTitle({
  entityPlural,
  entitySingular,
  search = "",
  minSearchLength = 4,
  typeLabel = "",
  location = "",
}) {
  const hasSearch =
    typeof search === "string" && search.trim().length >= minSearchLength;
  const searchText = hasSearch ? search.trim() : "";
  const type = typeof typeLabel === "string" ? typeLabel.trim() : "";
  const loc = typeof location === "string" ? location.trim() : "";
  const hasType = Boolean(type);
  const hasLocation = Boolean(loc);

  if (hasSearch && hasType && hasLocation) {
    return `${entitySingular} in ${searchText} of ${type} from ${loc}`;
  }
  if (hasSearch && hasType) {
    return `${entitySingular} in ${searchText} of ${type}`;
  }
  if (hasSearch && hasLocation) {
    return `${entitySingular} in ${searchText} from ${loc}`;
  }
  if (hasSearch) {
    return `${entitySingular} in ${searchText}`;
  }
  if (hasType && hasLocation) {
    return `${entityPlural} of ${type} from ${loc}`;
  }
  if (hasType) {
    return `${entityPlural} of ${type}`;
  }
  if (hasLocation) {
    return `${entityPlural} from ${loc}`;
  }
  return entityPlural;
}
