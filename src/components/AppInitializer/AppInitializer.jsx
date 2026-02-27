"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/utilities/AuthContext";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setUser, clearUser } from "@/store/slices/userSlice";
import {
  setCategories,
  setCategoriesLoading,
  setCategoriesError,
  clearCategories,
} from "@/store/slices/categoriesSlice";
import api from "@/utilities/api";
import { ROUTES } from "@/constants/routes";

/** Parse categories from API response (same shape as SignUp Company / getAllCategories) */
function parseCategoriesFromResponse(response) {
  return (
    response?.data?.items ||
    response?.items ||
    response?.categories ||
    response?.data?.categories ||
    (Array.isArray(response?.data) ? response.data : []) ||
    (Array.isArray(response) ? response : [])
  );
}

const AppInitializer = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const { token, logout } = useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchCategories = async () => {
      dispatch(setCategoriesLoading(true));
      try {
        const res = await fetch(
          "/api/categories/getAllCategories?page=1&limit=500&sortBy=name&order=asc",
          { credentials: "include" }
        );
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(parseCategoriesFromResponse(data))
          ? parseCategoriesFromResponse(data)
          : [];
        dispatch(setCategories(list));
      } catch (err) {
        console.error("Failed to load categories", err);
        dispatch(setCategoriesError(err?.message || "Failed to load categories"));
        dispatch(setCategories([]));
      }
    };

    const fetchInitialData = async () => {
      try {
        // Fetch user profile, settings, notifications, etc.
        const data = await api.get("/me", {
          onAuthError: (response, errorData) => {
            console.warn("Authentication failed, logging out...", errorData);
            dispatch(clearUser());
            dispatch(clearCategories());
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

        // Load categories on app init (company search dropdown, etc.)
        await fetchCategories();

        setLoading(false);
      } catch (err) {
        console.error("Failed to load initial data", err);
        if (err.isAuthError) {
          dispatch(clearUser());
          dispatch(clearCategories());
          logout();
          router.push(ROUTES?.PUBLIC?.LOGIN || "/login");
        }
        setLoading(false);
      }
    };

    if (token) {
      fetchInitialData();
    } else {
      dispatch(clearUser());
      dispatch(clearCategories());
    }
  }, [token, logout, router, dispatch]);

  if (loading) {
    return <div>Loading app...</div>;
  }

  return children;
};

export default AppInitializer;
