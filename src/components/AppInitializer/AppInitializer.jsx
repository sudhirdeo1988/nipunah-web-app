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
import { ROUTES } from "@/constants/routes";
import {
  loadUserSession,
  saveUserSession,
  clearUserSession,
  fetchUserDetailsByRole,
  fetchCurrentUserMe,
  getIdFromStoredUser,
  getRoleFromStoredUser,
  applyRolePermissionsToUser,
  applyUserIdFromCookieIfMissing,
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
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      try {
        // Load any cached user session first (fast UI)
        let cached = loadUserSession();
        if (cached) {
          const withIdFromCookie = applyUserIdFromCookieIfMissing(cached);
          if (withIdFromCookie !== cached) {
            cached = withIdFromCookie;
            saveUserSession(cached);
          }
          dispatch(setUser(applyRolePermissionsToUser(cached)));
        }

        // If session lacks id/role but we have a token (e.g. login shape used user_id only), bootstrap from GET /api/me
        let role = getRoleFromStoredUser(cached);
        let id = getIdFromStoredUser(cached);
        if (token && (!role || !id)) {
          try {
            const me = await fetchCurrentUserMe();
            if (me && typeof me === "object") {
              let mergedSession = applyRolePermissionsToUser({
                ...(cached || {}),
                ...me,
              });
              mergedSession = applyUserIdFromCookieIfMissing(mergedSession);
              saveUserSession(mergedSession);
              dispatch(setUser(mergedSession));
              cached = mergedSession;
              role = getRoleFromStoredUser(cached);
              id = getIdFromStoredUser(cached);
            }
          } catch (meErr) {
            console.warn("Could not bootstrap /api/me on refresh:", meErr);
          }
        }

        // Refresh profile: GET by id (users / companies / experts) based on role
        if (role && id) {
          console.log("🔷 Hydrating user details:", { role, id });
          const details = await fetchUserDetailsByRole({ role, id });
          let merged = applyRolePermissionsToUser({
            ...(cached || {}),
            ...(details || {}),
          });
          merged = applyUserIdFromCookieIfMissing(merged);
          saveUserSession(merged);
          dispatch(setUser(merged));
        } else if (cached) {
          console.warn(
            "No role/id found after session + /me; skipping GET-by-id hydration."
          );
        }

        // Load categories on app init (company search dropdown, etc.)
        await fetchCategories();

        setLoading(false);
      } catch (err) {
        console.error("Failed to load initial data", err);
        if (err.isAuthError || err.status === 401) {
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
      setLoading(false);
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
