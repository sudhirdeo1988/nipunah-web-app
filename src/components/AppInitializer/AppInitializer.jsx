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
import {
  loadUserSession,
  saveUserSession,
  clearUserSession,
  fetchUserDetailsByRole,
  getIdFromStoredUser,
  getRoleFromStoredUser,
  applyRolePermissionsToUser,
} from "@/utilities/sessionUser";

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
        // Load any cached user session first (fast UI)
        const cached = loadUserSession();
        if (cached) {
          dispatch(setUser(applyRolePermissionsToUser(cached)));
        }

        // Always refresh profile from backend on page refresh / app init
        // Decide which endpoint to call based on role + id stored in session
        const role = getRoleFromStoredUser(cached);
        const id = getIdFromStoredUser(cached);
        if (role && id) {
          console.log("🔷 Hydrating user details:", { role, id });
          const details = await fetchUserDetailsByRole({ role, id });
          const merged = applyRolePermissionsToUser({
            ...(cached || {}),
            ...(details || {}),
          });
          saveUserSession(merged);
          dispatch(setUser(merged));
        } else {
          // If we can't determine role/id, keep cached data only (if any)
          console.warn("No role/id found in stored user session; skipping hydration.");
        }

        // Load categories on app init (company search dropdown, etc.)
        await fetchCategories();

        setLoading(false);
      } catch (err) {
        console.error("Failed to load initial data", err);
        if (err.isAuthError) {
          dispatch(clearUser());
          dispatch(clearCategories());
          clearUserSession();
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
      clearUserSession();
    }
  }, [token, logout, router, dispatch]);

  if (loading) {
    return <div>Loading app...</div>;
  }

  return children;
};

export default AppInitializer;
