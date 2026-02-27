/**
 * Home page search configuration.
 * Maps search "type" values to public listing routes and API param names.
 * Used for redirect and URL query param consistency.
 */
import { ROUTES } from "./routes";

/** Minimum length for search keyword (home page validation) */
export const HOME_SEARCH_MIN_LENGTH = 4;

/**
 * Type option value -> route and label
 * Must match BannerSection searchFieldOptions select values
 */
export const HOME_SEARCH_TYPE_MAP = {
  Companies: {
    route: ROUTES.PUBLIC.COMPANIES,
    paramType: "type",
  },
  Equipments: {
    route: ROUTES.PUBLIC.EQUIPMENT,
    paramType: "type",
  },
  Experts: {
    route: ROUTES.PUBLIC.EXPERTS,
    paramType: "type",
  },
};

/**
 * URL query param names used on listing pages (must match listing page useSearchParams keys)
 */
export const HOME_SEARCH_PARAMS = {
  SEARCH: "search",
  TYPE: "type",
  LOCATION: "location",
};
