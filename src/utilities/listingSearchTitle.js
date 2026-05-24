/**
 * Build listing page section titles from active search filters.
 *
 * Patterns (experts example):
 * - No filters → "Experts"
 * - Type only → "Experts of {type}"
 * - Type + location → "Experts of {type} from {location}"
 * - Location only → "Experts from {location}"
 * - Search only → "Expert in {search}"
 * - Search + type / location / both → "Expert in {search} …" variants
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
