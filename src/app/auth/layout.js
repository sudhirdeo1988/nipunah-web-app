"use client";

import { useEffect } from "react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/utilities/AuthContext";
import { useRouter } from "next/navigation";
import { getRoleFromStoredUser, loadUserSession } from "@/utilities/sessionUser";

export default function GuestLayout({ children }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      // If we're already logged in, send the user to the right landing page.
      const stored = loadUserSession();
      const role = getRoleFromStoredUser(stored || {}) || "";
      const route =
        role === "user" || role === "expert"
          ? ROUTES?.PUBLIC?.HOME || "/"
          : ROUTES?.PRIVATE?.DASHBOARD || "/app/dashboard";

      router.replace(route);
    }
  }, [isLoggedIn, router]);

  return <div className="guest-layout">{children}</div>;
}
