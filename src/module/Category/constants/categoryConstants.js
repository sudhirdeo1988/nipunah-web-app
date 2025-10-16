// Category related constants
export const ADD_MENU_ITEMS = [
  {
    key: "category",
    label: "New Category",
  },
  {
    key: "sub_category",
    label: "Sub Category",
  },
];

export const ACTION_MENU_ITEMS = [
  {
    key: "edit",
    label: "Edit",
  },
  {
    key: "delete",
    label: "Delete",
  },
];

export const MODAL_MODES = {
  CATEGORY: "category",
  SUB_CATEGORY: "sub_category",
};

export const MODAL_TITLES = {
  ADD_CATEGORY: "Add New Category",
  EDIT_CATEGORY: "Edit Category",
  ADD_SUB_CATEGORY: "Add Sub Category",
  EDIT_SUB_CATEGORY: "Edit Sub Category",
};

// Mock data - replace with API calls
export const MOCK_CATEGORY_DATA = [
  {
    id: 1,
    c_name: "Technology",
    createdBy: "Admin",
    sub_categories: 3,
    createDate: "2024-01-15",
    action: { id: 1, c_name: "Technology" },
  },
  {
    id: 2,
    c_name: "Business",
    createdBy: "Admin",
    sub_categories: 2,
    createDate: "2024-01-18",
    action: { id: 2, c_name: "Business" },
  },
  {
    id: 3,
    c_name: "Education",
    createdBy: "Admin",
    sub_categories: 0,
    createDate: "2024-01-20",
    action: { id: 3, c_name: "Education" },
  },
];

export const MOCK_SUB_CATEGORY_DATA = [
  {
    id: 11,
    c_name: "Web Development",
    createDate: "2024-01-16",
    createdBy: "John Doe",
    parentId: 1,
    action: { id: 11, c_name: "Web Development", parentId: 1 },
  },
  {
    id: 12,
    c_name: "Mobile Development",
    createDate: "2024-01-17",
    createdBy: "Jane Smith",
    parentId: 1,
    action: { id: 12, c_name: "Mobile Development", parentId: 1 },
  },
  {
    id: 13,
    c_name: "Data Science",
    createDate: "2024-01-18",
    createdBy: "Bob Johnson",
    parentId: 1,
    action: { id: 13, c_name: "Data Science", parentId: 1 },
  },
  {
    id: 21,
    c_name: "Digital Marketing",
    createDate: "2024-01-19",
    createdBy: "Alice Brown",
    parentId: 2,
    action: { id: 21, c_name: "Digital Marketing", parentId: 2 },
  },
  {
    id: 22,
    c_name: "Sales Strategy",
    createDate: "2024-01-20",
    createdBy: "Charlie Wilson",
    parentId: 2,
    action: { id: 22, c_name: "Sales Strategy", parentId: 2 },
  },
];
