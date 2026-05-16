"use client";

import { useEffect } from "react";
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
import {
  isExpertProfileNormalized,
  normalizeExpertUser,
} from "@/utilities/expertProfileNormalize";

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
        let cached = loadUserSession();
        if (cached) {
          const withIdFromCookie = applyUserIdFromCookieIfMissing(cached);
          if (withIdFromCookie !== cached) {
            cached = withIdFromCookie;
            saveUserSession(cached);
          }
          const cachedRole = getRoleFromStoredUser(cached);
          if (cachedRole === "expert" && !isExpertProfileNormalized(cached)) {
            cached = normalizeExpertUser(cached);
          }
          dispatch(setUser(applyRolePermissionsToUser(cached)));
        }

        // If session lacks id/role, bootstrap from GET /api/me
        let role = getRoleFromStoredUser(cached);
        let id = getIdFromStoredUser(cached);
        if (!role || !id) {
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

        // Fallback when role is still unknown but id exists (e.g. incomplete session payload).
        // Try known profile endpoints to infer role and hydrate user.
        if (!role && id) {
          const candidateRoles = ["user", "expert", "company"];
          for (const candidate of candidateRoles) {
            try {
              const details = await fetchUserDetailsByRole({ role: candidate, id });
              if (details && typeof details === "object") {
                role = candidate;
                let merged = applyRolePermissionsToUser({
                  ...(cached || {}),
                  ...(details || {}),
                  role: candidate,
                  type: candidate,
                });
                merged = applyUserIdFromCookieIfMissing(merged);
                saveUserSession(merged);
                dispatch(setUser(merged));
                cached = merged;
                break;
              }
            } catch {
              // try next role
            }
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

      } catch (err) {
        console.error("Failed to load initial data", err);
        if (err.isAuthError || err.status === 401) {
          dispatch(clearUser());
          dispatch(clearCategories());
          clearUserSession();
          logout();
          router.push(ROUTES?.PUBLIC?.LOGIN || "/login");
        }
      }
    };

    const hasAnySessionHint = Boolean(token || loadUserSession() || getIdFromStoredUser({}));
    if (hasAnySessionHint) {
      fetchInitialData();
    } else {
      dispatch(clearUser());
      dispatch(clearCategories());
      clearUserSession();
    }
  }, [token, logout, router, dispatch]);

  return children;
};

export default AppInitializer;
