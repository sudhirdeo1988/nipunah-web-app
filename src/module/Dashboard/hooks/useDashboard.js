import { useState, useEffect, useCallback } from "react";

export const useDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    companies: 0,
    users: 0,
    experts: 0,
    jobs: 0,
  });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    loading,
    stats,
    fetchStats,
  };
};
