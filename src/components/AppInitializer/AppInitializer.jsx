"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/utilities/AuthContext";

const AppInitializer = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Example: Fetch user profile, settings, notifications, etc.
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        console.log("User Info:", data);

        // You can dispatch to Redux or store in context if needed
        // dispatch(setUser(data));

        setLoading(false);
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };

    if (token) {
      fetchInitialData();
    }
  }, [token]);

  if (loading) {
    return <div>Loading app...</div>;
  }

  return children;
};

export default AppInitializer;
