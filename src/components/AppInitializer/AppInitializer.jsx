"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/utilities/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/utilities/api";
import { ROUTES } from "@/constants/routes";

const AppInitializer = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const { token, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Example: Fetch user profile, settings, notifications, etc.
        const data = await api.get("/me", {
          onAuthError: (response, errorData) => {
            // Handle 401 error - token expired or invalid
            console.warn("Authentication failed, logging out...", errorData);
            logout();
            router.push(ROUTES?.PUBLIC?.LOGIN || "/login");
          },
        });
        console.log("User Info:", data);

        // You can dispatch to Redux or store in context if needed
        // dispatch(setUser(data));

        setLoading(false);
      } catch (err) {
        console.error("Failed to load initial data", err);
        // If it's an auth error, logout and redirect
        if (err.isAuthError) {
          logout();
          router.push(ROUTES?.PUBLIC?.LOGIN || "/login");
        }
      }
    };

    if (token) {
      fetchInitialData();
    }
  }, [token, logout, router]);

  if (loading) {
    return <div>Loading app...</div>;
  }

  return children;
};

export default AppInitializer;
