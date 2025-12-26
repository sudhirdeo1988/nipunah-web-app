/**
 * Equipment Constants
 *
 * This file contains constants for equipment operations including
 * action menu items, modal modes, and modal titles.
 */

// Action menu items for equipment operations
export const ACTION_MENU_ITEMS = [
  {
    key: "view",
    label: "View",
  },
  {
    key: "edit",
    label: "Edit",
  },
  {
    key: "delete",
    label: "Delete",
  },
];

// Modal modes for equipment operations
export const MODAL_MODES = {
  EQUIPMENT: "equipment",
};

// Modal titles for equipment operations
export const MODAL_TITLES = {
  ADD_EQUIPMENT: "Add New Equipment",
  EDIT_EQUIPMENT: "Edit Equipment",
};

// Equipment type options
export const EQUIPMENT_TYPES = [
  { label: "Ship Building", value: "Ship Building" },
  { label: "Shipping", value: "Shipping" },
  // Add more types as needed
];

// Available for options
export const AVAILABLE_FOR_OPTIONS = [
  { label: "Rent", value: "rent" },
  { label: "Purchase", value: "purchase" },
  { label: "Lease", value: "lease" },
];

// Rent type options
export const RENT_TYPE_OPTIONS = [
  { label: "Year", value: "year" },
  { label: "Month", value: "month" },
];

