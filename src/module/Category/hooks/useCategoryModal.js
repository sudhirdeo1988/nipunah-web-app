import { useState, useCallback } from "react";
import { MODAL_MODES } from "../constants/categoryConstants";

export const useCategoryModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalMode, setModalMode] = useState(MODAL_MODES.CATEGORY);

  const openModal = useCallback(
    (mode = MODAL_MODES.CATEGORY, category = null) => {
      setModalMode(mode);
      setSelectedCategory(category);
      setIsModalOpen(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setModalMode(MODAL_MODES.CATEGORY);
  }, []);

  const isEditMode = Boolean(selectedCategory);

  return {
    isModalOpen,
    selectedCategory,
    modalMode,
    isEditMode,
    openModal,
    closeModal,
  };
};
