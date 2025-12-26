/**
 * useApi Hook - Reusable API state management hook
 *
 * This hook provides a consistent pattern for managing API call states:
 * - loading: Shows loader during API call
 * - error: Shows error message on failure
 * - success: Shows data on success
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi(apiFunction, options);
 *
 * @param {Function} apiFunction - The API function to execute
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoExecute - Whether to execute on mount (default: false)
 * @param {boolean} options.showSuccessMessage - Show success message (default: false)
 * @param {boolean} options.showErrorMessage - Show error message (default: true)
 * @param {string} options.successMessage - Custom success message
 * @param {string} options.errorMessage - Custom error message
 * @param {Function} options.onSuccess - Callback on success
 * @param {Function} options.onError - Callback on error
 * @returns {Object} API state and execute function
 */

import { useState, useCallback, useEffect } from "react";
import { message } from "antd";

export const useApi = (
  apiFunction,
  {
    autoExecute = false,
    showSuccessMessage = false,
    showErrorMessage = true,
    successMessage = "Operation completed successfully",
    errorMessage = "An error occurred",
    onSuccess = null,
    onError = null,
  } = {}
) => {
  // State management
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute the API function
   *
   * @param {...any} args - Arguments to pass to the API function
   * @returns {Promise<any>} API response
   */
  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await apiFunction(...args);

        // Set data on success
        setData(response);

        // Show success message if enabled
        if (showSuccessMessage) {
          message.success(successMessage);
        }

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === "function") {
          onSuccess(response);
        }

        return response;
      } catch (err) {
        // Set error state
        const errorMessageText =
          err.message || err.data?.message || errorMessage;
        setError(err);

        // Show error message if enabled
        if (showErrorMessage) {
          message.error(errorMessageText);
        }

        // Call error callback if provided
        if (onError && typeof onError === "function") {
          onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      apiFunction,
      showSuccessMessage,
      showErrorMessage,
      successMessage,
      errorMessage,
      onSuccess,
      onError,
    ]
  );

  /**
   * Reset all states
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Auto-execute on mount if enabled
  useEffect(() => {
    if (autoExecute) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoExecute]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    // Helper flags
    isSuccess: data !== null && error === null,
    isError: error !== null,
    isEmpty: data === null && !loading && !error,
  };
};













