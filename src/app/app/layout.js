"use client";

import { useAuth } from "@/utilities/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppInitializer from "@/components/AppInitializer";
import { ROUTES } from "@/constants/routes";

export default function AppLayout({ children }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace(ROUTES?.AUTH?.LOGIN);
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  return (
    <AppInitializer>
      <div className="private-layout">
        {/* e.g., NavBar, Sidebar here */}
        {children}
      </div>
    </AppInitializer>
  );
}
