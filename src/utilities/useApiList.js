/**
 * useApiList Hook - Reusable API state management hook for list operations
 *
 * This hook provides a consistent pattern for managing API list operations:
 * - loading: Shows loader during API call
 * - error: Shows error message on failure
 * - success: Shows data on success
 * - Includes pagination support
 *
 * Usage:
 *   const { data, loading, error, pagination, execute, refresh } = useApiList(apiFunction, options);
 *
 * @param {Function} apiFunction - The API function to execute (should return { success, data: { items, total, page, limit } })
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoExecute - Whether to execute on mount (default: false)
 * @param {boolean} options.showSuccessMessage - Show success message (default: false)
 * @param {boolean} options.showErrorMessage - Show error message (default: true)
 * @param {string} options.successMessage - Custom success message
 * @param {string} options.errorMessage - Custom error message
 * @param {Function} options.onSuccess - Callback on success
 * @param {Function} options.onError - Callback on error
 * @param {Function} options.transformData - Function to transform response data
 * @returns {Object} API state and execute function
 */

import { useState, useCallback, useEffect } from "react";
import { message } from "antd";

export const useApiList = (
  apiFunction,
  {
    autoExecute = false,
    showSuccessMessage = false,
    showErrorMessage = true,
    successMessage = "Data loaded successfully",
    errorMessage = "Failed to load data",
    onSuccess = null,
    onError = null,
    transformData = null,
  } = {}
) => {
  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

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

      try {
        const response = await apiFunction(...args);

        // Process response
        if (response && response.success && response.data) {
          // Transform data if transform function provided
          const items = transformData
            ? transformData(response.data.items || response.data)
            : response.data.items || response.data;

          setData(Array.isArray(items) ? items : []);

          // Update pagination if available
          if (response.data.total !== undefined) {
            setPagination({
              current: response.data.page || 1,
              pageSize: response.data.limit || 10,
              total: response.data.total || 0,
            });
          }
        } else {
          // Handle non-standard response format
          const items = transformData
            ? transformData(response)
            : Array.isArray(response) ? response : [];
          setData(items);
        }

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
        setData([]); // Clear data on error

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
      transformData,
      showSuccessMessage,
      showErrorMessage,
      successMessage,
      errorMessage,
      onSuccess,
      onError,
    ]
  );

  /**
   * Refresh the list (re-execute with same parameters)
   */
  const refresh = useCallback(
    async (...args) => {
      return execute(...args);
    },
    [execute]
  );

  /**
   * Reset all states
   */
  const reset = useCallback(() => {
    setData([]);
    setError(null);
    setLoading(false);
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
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
    pagination,
    execute,
    refresh,
    reset,
    // Helper flags
    isSuccess: data.length > 0 && error === null,
    isError: error !== null,
    isEmpty: data.length === 0 && !loading && !error,
  };
};





