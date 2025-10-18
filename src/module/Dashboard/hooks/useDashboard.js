import { useState, useEffect, useCallback } from "react";
import moment from "moment";
import { DASHBOARD_CONSTANTS } from "../constants/dashboardConstants";

export const useDashboard = () => {
  const [dateRange, setDateRange] = useState([
    moment().subtract(DASHBOARD_CONSTANTS.DEFAULT_DATE_RANGE_DAYS, "days"),
    moment(),
  ]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    companies: 0,
    users: 0,
    experts: 0,
    jobs: 0,
  });

  // Mock data - replace with actual API calls
  const fetchStats = useCallback(async (startDate, endDate) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data generation
      const mockStats = {
        companies: Math.floor(Math.random() * 100) + 50,
        users: Math.floor(Math.random() * 500) + 200,
        experts: Math.floor(Math.random() * 150) + 75,
        jobs: Math.floor(Math.random() * 300) + 100,
      };

      setStats(mockStats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDateRangeChange = useCallback((dates) => {
    setDateRange(dates);
  }, []);

  useEffect(() => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      fetchStats(dateRange[0], dateRange[1]);
    }
  }, [dateRange, fetchStats]);

  return {
    dateRange,
    loading,
    stats,
    handleDateRangeChange,
    fetchStats,
  };
};
