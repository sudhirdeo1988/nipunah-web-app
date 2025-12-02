"use client";

/**
 * Experts Constants
 *
 * This file contains expert categories and re-exports experts data and utilities.
 */

// Import experts data from separate config file
export { EXPERTS_DATA } from "./expertsConfig";

/**
 * Expert categories/segments
 * @type {Array<Object>}
 */
export const EXPERT_CATEGORIES = [
  {
    id: 1,
    label: "Engineering & Technical",
    value: "engineering_technical",
    expertIds: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ],
  },
  {
    id: 2,
    label: "Operations & Marine Crew",
    value: "operations_marine_crew",
    expertIds: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
  },
  {
    id: 3,
    label: "Survey, Inspection & Compliance",
    value: "survey_inspection_compliance",
    expertIds: [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
  },
  {
    id: 4,
    label: "Design, Research & Software",
    value: "design_research_software",
    expertIds: [49, 50, 51, 52, 53, 54, 55, 56],
  },
  {
    id: 5,
    label: "Project, Management & Consultancy",
    value: "project_management_consultancy",
    expertIds: [57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
  },
  {
    id: 6,
    label: "Training & Education",
    value: "training_education",
    expertIds: [71, 72, 73, 74, 75],
  },
  {
    id: 7,
    label: "Commercial & Support",
    value: "commercial_support",
    expertIds: [76, 77, 78, 79, 80, 81, 82, 83, 84, 85],
  },
  {
    id: 8,
    label: "Others",
    value: "others",
    expertIds: [86],
  },
];

// Re-export utility functions from experts_utility.js
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

/**
 * Default export for easy importing
 */
export default {
  EXPERTS_DATA,
  EXPERT_CATEGORIES,
};
