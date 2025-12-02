/**
 * Experts Constants Index
 * Central export point for all expert-related constants and utilities
 */

// Export experts data config (can be imported directly)
export { EXPERTS_DATA } from "./expertsConfig";

// Export constants (categories and re-exports)
export {
  EXPERT_CATEGORIES,
  default as expertConstants,
} from "./expertConstants";

// Export utility functions
export {
  getExpertById,
  getExpertByName,
  getExpertsByCategory,
  getExpertsByCategoryId,
  searchExperts,
  getCategoryById,
  getCategoryByValue,
  getAllExpertNames,
  getTotalExpertsCount,
  getExpertsCountByCategory,
} from "./experts_utility";
