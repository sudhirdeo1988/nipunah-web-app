"use client";

/**
 * Experts Utility Functions
 *
 * This file contains helper functions for working with experts data.
 * All utility functions are exported here and re-exported from expertConstants.js
 */

import { EXPERTS_DATA, EXPERT_CATEGORIES } from "./expertConstants";

/**
 * Helper function to get expert by ID
 * @param {number} id - Expert ID
 * @returns {Object|null} Expert object or null if not found
 */
export const getExpertById = (id) => {
  return EXPERTS_DATA.find((expert) => expert.id === id) || null;
};

/**
 * Helper function to get expert by name
 * @param {string} name - Expert name
 * @returns {Object|null} Expert object or null if not found
 */
export const getExpertByName = (name) => {
  return EXPERTS_DATA.find((expert) => expert.name === name) || null;
};

/**
 * Helper function to filter experts by category
 * @param {string|number} category - Category name or categoryId to filter by
 * @returns {Array<Object>} Filtered experts array
 */
export const getExpertsByCategory = (category) => {
  if (typeof category === "number") {
    return EXPERTS_DATA.filter((expert) => expert.categoryId === category);
  }
  return EXPERTS_DATA.filter((expert) => expert.category === category);
};

/**
 * Helper function to get all experts in a category by category ID
 * @param {number} categoryId - Category ID
 * @returns {Array<Object>} Filtered experts array
 */
export const getExpertsByCategoryId = (categoryId) => {
  return EXPERTS_DATA.filter((expert) => expert.categoryId === categoryId);
};

/**
 * Helper function to search experts by name
 * @param {string} searchTerm - Search term
 * @returns {Array<Object>} Filtered experts array
 */
export const searchExperts = (searchTerm) => {
  const term = searchTerm?.toLowerCase() || "";
  return EXPERTS_DATA.filter((expert) =>
    expert.name?.toLowerCase().includes(term)
  );
};

/**
 * Helper function to get category by ID
 * @param {number} categoryId - Category ID
 * @returns {Object|null} Category object or null if not found
 */
export const getCategoryById = (categoryId) => {
  return EXPERT_CATEGORIES.find((cat) => cat.id === categoryId) || null;
};

/**
 * Helper function to get category by value
 * @param {string} value - Category value
 * @returns {Object|null} Category object or null if not found
 */
export const getCategoryByValue = (value) => {
  return EXPERT_CATEGORIES.find((cat) => cat.value === value) || null;
};

/**
 * Get all expert names as an array
 * @returns {Array<string>} Array of expert names
 */
export const getAllExpertNames = () => {
  return EXPERTS_DATA.map((expert) => expert.name);
};

/**
 * Get total count of experts
 * @returns {number} Total number of experts
 */
export const getTotalExpertsCount = () => {
  return EXPERTS_DATA.length;
};

/**
 * Get experts count by category
 * @param {number} categoryId - Category ID
 * @returns {number} Count of experts in the category
 */
export const getExpertsCountByCategory = (categoryId) => {
  return EXPERTS_DATA.filter((expert) => expert.categoryId === categoryId)
    .length;
};
















