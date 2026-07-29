"use client";

import { useCallback, useMemo, useState } from "react";
import { PUBLIC_JOBS_MOCK } from "../constants/publicJobsMock";

const DEFAULT_FILTERS = {
  search: "",
  experienceRequired: [],
  employmentType: [],
  workMode: [],
  location: "",
};

const matchesAny = (selected, value) => {
  if (!Array.isArray(selected) || selected.length === 0) return true;
  return selected.includes(value);
};

/**
 * Client-side public jobs browse (mock data).
 */
export const usePublicJobs = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const filteredJobs = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const location = filters.location.trim().toLowerCase();

    return PUBLIC_JOBS_MOCK.filter((job) => {
      if (!matchesAny(filters.experienceRequired, job.experienceRequired)) {
        return false;
      }
      if (!matchesAny(filters.employmentType, job.employmentType)) {
        return false;
      }
      if (!matchesAny(filters.workMode, job.workMode)) {
        return false;
      }
      if (location) {
        const locHaystack = [
          job.location?.city,
          job.location?.state,
          job.location?.country,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!locHaystack.includes(location)) return false;
      }
      if (search) {
        const haystack = [
          job.title,
          job.postedBy?.companyName,
          job.employmentType,
          job.workMode,
          job.experienceRequired,
          ...(job.skillTags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return job.isActive !== false;
    });
  }, [filters]);

  const updateFilters = useCallback((next) => {
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const removeFilterValue = useCallback((key, value) => {
    setFilters((prev) => {
      const current = prev[key];
      if (Array.isArray(current)) {
        return {
          ...prev,
          [key]: current.filter((item) => item !== value),
        };
      }
      return { ...prev, [key]: "" };
    });
  }, []);

  return {
    filters,
    jobs: filteredJobs,
    total: filteredJobs.length,
    updateFilters,
    resetFilters,
    removeFilterValue,
    defaultFilters: DEFAULT_FILTERS,
  };
};
