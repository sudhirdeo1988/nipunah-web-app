"use client";

/**
 * useJob Hook
 *
 * Custom hook for managing job operations with API integration.
 * Provides loading, error, and success state management.
 *
 * Features:
 * - Fetch jobs with pagination, sorting, and search
 * - Delete jobs with confirmation
 * - Loading, error, and success state handling
 * - Automatic error messages
 */

import { useState, useCallback, useEffect } from "react";
import { message } from "antd";
import { find as _find } from "lodash-es";
import CountryDetails from "@/utilities/CountryDetails.json";
import { jobService } from "@/utilities/apiServices";
import dayjs from "dayjs";

export const useJob = () => {
  // ==================== STATE MANAGEMENT ====================

  /** @type {[Object[], Function]} List of jobs */
  const [jobs, setJobs] = useState([]);

  /** @type {[boolean, Function]} Loading state */
  const [loading, setLoading] = useState(false);

  /** @type {[Error|null, Function]} Error state */
  const [error, setError] = useState(null);

  /** @type {[Object, Function]} Pagination state */
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  /** @type {[string, Function]} Search query */
  const [searchQuery, setSearchQuery] = useState("");

  /** @type {[string, Function]} Sort field */
  const [sortBy, setSortBy] = useState("");

  /** @type {[string, Function]} Sort order */
  const [order, setOrder] = useState("asc");

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Format date from timestamp or date string
   * @param {string|number} dateValue - Date value (timestamp or date string)
   * @returns {string} Formatted date string (YYYY-MM-DD) or empty string
   */
  const formatDate = useCallback((dateValue) => {
    if (!dateValue) return "";
    
    try {
      // If it's a timestamp (number)
      if (typeof dateValue === "number") {
        return dayjs(dateValue).format("YYYY-MM-DD");
      }
      
      // If it's a date string
      if (typeof dateValue === "string") {
        // Try parsing as ISO string or timestamp string
        const parsed = dayjs(dateValue);
        if (parsed.isValid()) {
          return parsed.format("YYYY-MM-DD");
        }
      }
      
      return "";
    } catch (error) {
      console.error("Error formatting date:", error, dateValue);
      return "";
    }
  }, []);

  // ==================== FETCH JOBS ====================

  /**
   * Fetch jobs from API
   * Handles pagination, search, and sorting
   *
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search query
   * @param {string} params.sortBy - Field to sort by
   * @param {string} params.order - Sort order (asc/desc)
   */
  const fetchJobs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      console.log("🟢 API CALL: GET /jobs/getAllJobs", { params });

      // Merge with current pagination and search state
      const queryParams = {
        page: params.page || pagination.current,
        limit: params.limit || pagination.pageSize,
        search: params.search !== undefined ? params.search : searchQuery,
        sortBy: params.sortBy || sortBy,
        order: params.order || order,
        ...params,
      };

      const response = await jobService.getJobs(queryParams);

      console.log("📦 Response structure:", {
        success: response?.success,
        hasData: !!response?.data,
        dataType: typeof response?.data,
        items: response?.data?.items || response?.items,
        itemsLength: (response?.data?.items || response?.items)?.length,
      });

      // Handle different response structures
      let responseData = null;
      if (response?.success && response?.data) {
        // Check if data has items directly or nested
        if (response.data.items) {
          responseData = response.data;
        } else if (response.data.data && response.data.data.items) {
          // Nested data structure
          responseData = response.data.data;
        } else if (Array.isArray(response.data)) {
          // If data is directly an array
          responseData = {
            items: response.data,
            total: response.data.length,
            page: 1,
            limit: response.data.length,
            totalPages: 1,
          };
        }
      } else if (Array.isArray(response)) {
        // Direct array response
        responseData = {
          items: response,
          total: response.length,
          page: 1,
          limit: response.length,
          totalPages: 1,
        };
      } else if (response?.items) {
        // Items at root level
        responseData = response;
      }

      if (responseData && responseData.items) {
        console.log(
          "🔄 Transforming data, items count:",
          responseData.items.length
        );

        // Transform API response to match component expectations
        const transformedJobs = responseData.items.map((job) => {
          // Preserve location as object for edit form, but also create display string
          const locationObj = job.location || {};
          
          // Get country code and country name
          let countryCode = locationObj.countryCode || locationObj.country || "";
          let countryName = locationObj.country || "";
          
          // If countryCode is a country name (length > 2), convert to code
          if (countryCode && countryCode.length > 2) {
            const countryData = _find(
              CountryDetails,
              (c) => c.countryName === countryCode
            );
            if (countryData) {
              countryCode = countryData.countryCode;
              countryName = countryData.countryName;
            } else {
              // If not found, keep as is
              countryName = countryCode;
            }
          } else if (countryCode && !countryName) {
            // If we have code but no name, find the name
            const countryData = _find(
              CountryDetails,
              (c) => c.countryCode === countryCode
            );
            countryName = countryData ? countryData.countryName : "";
          }
          
          // Preserve all location fields including address, countryCode, and country name
          const preservedLocationObj = {
            city: locationObj.city || "",
            state: locationObj.state || "",
            pinCode: locationObj.pinCode || locationObj.pincode || "",
            address: locationObj.address || "",
            countryCode: countryCode, // Always store country code
            country: countryName, // Always store country name
          };
          
          // Build location display string with country name from preservedLocationObj
          const locationParts = [];
          if (preservedLocationObj.city) locationParts.push(preservedLocationObj.city);
          if (preservedLocationObj.state) locationParts.push(preservedLocationObj.state);
          if (preservedLocationObj.pinCode) locationParts.push(preservedLocationObj.pinCode);
          if (preservedLocationObj.country) locationParts.push(preservedLocationObj.country);
          
          const locationDisplay = locationParts.length > 0
            ? locationParts.join(", ")
            : "";
          
          return {
            id: job.id || job.jobId,
            jobId: job.jobId || `JOB-${job.id}`,
            title: job.title || "",
            postedBy: job.postedBy || {
              companyId: job.posted_by?.companyId || job.posted_by?.company_id,
              companyName: job.posted_by?.companyName || job.posted_by?.company_name || "",
              companyShortName: job.posted_by?.companyShortName || job.posted_by?.company_short_name || "",
            },
            experienceRequired: job.experienceRequired || job.experience_required || "",
            salaryRange: job.salaryRange
              ? `${job.salaryRange.min || ""} - ${job.salaryRange.max || ""}`
              : job.salary_range
              ? `${job.salary_range.min || ""} - ${job.salary_range.max || ""}`
              : "",
            salary_range: job.salaryRange || job.salary_range || { min: "", max: "" }, // Preserve object for edit
            location: locationDisplay, // Display string for table
            locationObj: preservedLocationObj, // Preserve complete object structure for edit form
            description: job.description || "",
            employmentType: job.employmentType || job.employment_type || "",
            skillsRequired: job.skillsRequired || job.skills_required || [],
            applicationDeadline: job.applicationDeadline || job.application_deadline || "",
            application_deadline: job.applicationDeadline || job.application_deadline || "", // Preserve for edit
            status: job.status || "pending",
            isActive: job.isActive !== undefined ? job.isActive : job.is_active !== undefined ? job.is_active : true,
            peopleApplied: job.peopleApplied || job.people_applied || 0,
            postedOn: formatDate(job.createdOn || job.created_on || job.postedOn || job.posted_on || ""),
            updatedOn: formatDate(job.updatedOn || job.updated_on || ""),
          };
        });

        setJobs(transformedJobs);
        setPagination({
          current: responseData.page || 1,
          pageSize: responseData.limit || 10,
          total: responseData.total || transformedJobs.length,
        });

        // Update search query state
        if (params.search !== undefined) {
          setSearchQuery(params.search);
        }

        if (params.sortBy) setSortBy(params.sortBy);
        if (params.order) setOrder(params.order);
      } else {
        console.warn("⚠️ Unexpected response structure:", response);
        setJobs([]);
        setPagination({
          current: 1,
          pageSize: 10,
          total: 0,
        });
      }
    } catch (err) {
      console.error("❌ Error fetching jobs:", err);
      setError(err);
      setJobs([]);
      const errorMessage =
        err?.message || "Failed to fetch jobs. Please try again.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchQuery, sortBy, order]);

  // ==================== CREATE JOB ====================

  /**
   * Create a new job
   * Shows success/error messages and refreshes the list
   *
   * @param {Object} jobData - Job data to create
   */
  const createJob = useCallback(
    async (jobData) => {
      setLoading(true);
      setError(null);

      try {
        console.log("🟢 API CALL: POST /jobs");
        const response = await jobService.createJob(jobData);
        console.log("✅ API Response:", response);

        message.success("Job created successfully");
        
        // Refresh the list (fetchJobs uses current pagination and filters from state)
        await fetchJobs();
        
        return response;
      } catch (err) {
        console.error("❌ Error creating job:", err);
        setError(err);
        const errorMessage =
          err?.message || "Failed to create job. Please try again.";
        message.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchJobs]
  );

  // ==================== UPDATE JOB ====================

  /**
   * Update a job
   * Shows success/error messages and refreshes the list
   *
   * @param {number|string} jobId - ID of the job to update
   * @param {Object} jobData - Updated job data
   */
  const updateJob = useCallback(
    async (jobId, jobData) => {
      setLoading(true);
      setError(null);

      try {
        console.log("🟢 API CALL: PUT /jobs/" + jobId);
        const response = await jobService.updateJob(jobId, jobData);
        console.log("✅ API Response:", response);

        message.success("Job updated successfully");
        
        // Refresh the list (fetchJobs uses current pagination and filters from state)
        console.log("🔄 Refreshing job list after update...");
        console.log("📊 Current state:", {
          currentPage: pagination.current,
          pageSize: pagination.pageSize,
          searchQuery,
          sortBy,
          order,
        });
        
        // Small delay to ensure API has propagated the update
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await fetchJobs({
          page: pagination.current,
          limit: pagination.pageSize,
          search: searchQuery,
          sortBy: sortBy,
          order: order,
        });
        
        console.log("✅ Job list refreshed after update");
        
        return response;
      } catch (err) {
        console.error("❌ Error updating job:", err);
        setError(err);
        const errorMessage =
          err?.message || "Failed to update job. Please try again.";
        message.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchJobs, pagination.current, pagination.pageSize, searchQuery, sortBy, order]
  );

  // ==================== DELETE JOB ====================

  /**
   * Delete a job
   * Shows success/error messages and refreshes the list
   *
   * @param {number|string} jobId - ID of the job to delete
   */
  const deleteJob = useCallback(
    async (jobId) => {
      setLoading(true);
      setError(null);

      try {
        console.log("🟢 API CALL: DELETE /jobs/" + jobId);
        const response = await jobService.deleteJob(jobId);
        console.log("✅ API Response:", response);

        message.success("Job deleted successfully");
        await fetchJobs(); // Refresh the list
        return response;
      } catch (err) {
        console.error("❌ Error deleting job:", err);
        setError(err);
        const errorMessage =
          err?.message || "Failed to delete job. Please try again.";
        message.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchJobs]
  );

  // ==================== HANDLE SORT ====================

  /**
   * Handle table sorting
   *
   * @param {string} field - Field to sort by
   */
  const handleSort = useCallback(
    (field) => {
      const newOrder = sortBy === field && order === "asc" ? "desc" : "asc";
      setSortBy(field);
      setOrder(newOrder);
      fetchJobs({
        sortBy: field,
        order: newOrder,
        page: 1, // Reset to first page when sorting
      });
    },
    [sortBy, order, fetchJobs]
  );

  // ==================== INITIAL FETCH ====================

  /**
   * Fetch jobs on mount
   */
  useEffect(() => {
    fetchJobs();
  }, []); // Only run on mount

  return {
    // State
    jobs,
    loading,
    error,
    pagination,
    searchQuery,
    sortBy,
    order,

    // Actions
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
    handleSort,

    // Setters
    setSearchQuery,
    setPagination,
  };
};
