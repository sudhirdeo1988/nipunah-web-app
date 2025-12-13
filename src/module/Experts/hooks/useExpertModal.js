import { useState, useCallback } from "react";
import { MODAL_MODES } from "../constants/expertConstants";

export const useExpertModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [modalMode, setModalMode] = useState(MODAL_MODES.EXPERT);

  const openModal = useCallback(
    (mode = MODAL_MODES.EXPERT, expert = null) => {
      setModalMode(mode);
      setSelectedExpert(expert);
      setIsModalOpen(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedExpert(null);
    setModalMode(MODAL_MODES.EXPERT);
  }, []);

  const isEditMode = Boolean(selectedExpert);

  return {
    isModalOpen,
    selectedExpert,
    modalMode,
    isEditMode,
    openModal,
    closeModal,
  };
};




