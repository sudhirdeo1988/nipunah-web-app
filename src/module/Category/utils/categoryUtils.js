import { MODAL_MODES, MODAL_TITLES } from "../constants/categoryConstants";

export const getModalTitle = (modalMode, isEditMode) => {
  if (modalMode === MODAL_MODES.SUB_CATEGORY) {
    return isEditMode
      ? MODAL_TITLES.EDIT_SUB_CATEGORY
      : MODAL_TITLES.ADD_SUB_CATEGORY;
  }
  return isEditMode ? MODAL_TITLES.EDIT_CATEGORY : MODAL_TITLES.ADD_CATEGORY;
};

export const isSubCategory = (record) => {
  return Boolean(record?.parentId || record?.categoryId);
};
