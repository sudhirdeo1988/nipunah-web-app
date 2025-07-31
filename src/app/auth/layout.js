"use client";

import { useEffect } from "react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/utilities/AuthContext";
import { useRouter } from "next/navigation";

export default function GuestLayout({ children }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace(ROUTES?.PRIVATE?.DASHBOARD);
    }
  }, [isLoggedIn]);

  return <div className="guest-layout">{children}</div>;
}
