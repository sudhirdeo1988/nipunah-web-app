import { useState, useCallback } from "react";
import { MODAL_MODES } from "../constants/equipmentConstants";

export const useEquipmentModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [modalMode, setModalMode] = useState(MODAL_MODES.EQUIPMENT);

  const openModal = useCallback(
    (mode = MODAL_MODES.EQUIPMENT, equipment = null) => {
      setModalMode(mode);
      setSelectedEquipment(equipment);
      setIsModalOpen(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEquipment(null);
    setModalMode(MODAL_MODES.EQUIPMENT);
  }, []);

  const isEditMode = Boolean(selectedEquipment);

  return {
    isModalOpen,
    selectedEquipment,
    modalMode,
    isEditMode,
    openModal,
    closeModal,
  };
};

