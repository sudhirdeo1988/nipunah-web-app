"use client";

import { useState, useCallback } from "react";

/**
 * useJobModal Hook
 *
 * Custom hook for managing job modal state (create/edit)
 * Similar to useEquipmentModal pattern
 *
 * @returns {Object} Modal state and handlers
 */
export const useJobModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  /**
   * Open modal for create or edit
   * @param {Object|null} job - Job object for edit mode, null for create mode
   */
  const openModal = useCallback((job = null) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  }, []);

  /**
   * Close modal and reset state
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedJob(null);
  }, []);

  /**
   * Check if in edit mode
   */
  const isEditMode = Boolean(selectedJob);

  return {
    isModalOpen,
    selectedJob,
    isEditMode,
    openModal,
    closeModal,
  };
};
