"use client";

import { useCallback } from "react";
import { useAuth } from "@/utilities/AuthContext";
import { useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/userSlice";
import { clearCategories } from "@/store/slices/categoriesSlice";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { clearAllClientStorage } from "@/utilities/sessionUser";

/**
 * Custom hook for handling logout with Redux state clearing
 */
export const useLogout = () => {
  const { logout: authLogout } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const logout = useCallback(() => {
    // Clear Redux user state
    dispatch(clearUser());
    // Clear Redux categories state
    dispatch(clearCategories());
    // Clear all client-side storage and cookies
    clearAllClientStorage();
    // Clear auth token
    authLogout();
    // Redirect to login
    router.push(ROUTES?.PUBLIC?.LOGIN || "/login");
  }, [dispatch, authLogout, router]);

  return { logout };
};

