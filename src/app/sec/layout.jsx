"use client";

import { useAuth } from "@/utilities/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, lazy, Suspense } from "react";
import AppInitializer from "@/components/AppInitializer";
import { ROUTES } from "@/constants/routes";
import PublicLayout from "@/layout/PublicLayout";

export default function SecAppLayout({ children }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  //   useEffect(() => {
  //     if (!isLoggedIn) {
  //       router.replace(ROUTES?.PUBLIC?.LOGIN);
  //     }
  //   }, [isLoggedIn]);

  //   if (!isLoggedIn) return null;

  return (
    <>
      <PublicLayout>{children}</PublicLayout>
    </>
  );
}
