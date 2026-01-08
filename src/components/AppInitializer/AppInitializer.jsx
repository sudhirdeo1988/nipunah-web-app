"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/utilities/AuthContext";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setUser, clearUser } from "@/store/slices/userSlice";
import api from "@/utilities/api";
import { ROUTES } from "@/constants/routes";

const AppInitializer = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const { token, logout } = useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch user profile, settings, notifications, etc.
        const data = await api.get("/me", {
          onAuthError: (response, errorData) => {
            // Handle 401 error - token expired or invalid
            console.warn("Authentication failed, logging out...", errorData);
            dispatch(clearUser());
            logout();
            router.push(ROUTES?.PUBLIC?.LOGIN || "/login");
          },
        });
        console.log("User Info:", data);

        // Store user data in Redux
        if (data) {
          const userData = {
            id: data?.id || data?.user?.id,
            username: data?.username || data?.user?.username,
            email: data?.email || data?.user?.email,
            name: data?.name || data?.user?.name,
            type: data?.type || data?.userType || data?.user?.type,
            role: data?.role || data?.user?.role,
            ...(data?.user || data || {}),
          };
          dispatch(setUser(userData));
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to load initial data", err);
        // If it's an auth error, logout and redirect
        if (err.isAuthError) {
          dispatch(clearUser());
          logout();
          router.push(ROUTES?.PUBLIC?.LOGIN || "/login");
        }
      }
    };

    if (token) {
      fetchInitialData();
    } else {
      // Clear user data if no token
      dispatch(clearUser());
    }
  }, [token, logout, router, dispatch]);

  if (loading) {
    return <div>Loading app...</div>;
  }

  return children;
};

export default AppInitializer;
