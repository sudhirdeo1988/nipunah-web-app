"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import PublicLayout from "@/layout/PublicLayout";
import PublicJobs from "@/module/PublicJobs";
import { useAuth } from "@/utilities/AuthContext";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { ROUTES } from "@/constants/routes";

/**
 * Public Jobs browse — gated by nav_public_jobs (Expert only by default).
 */
const JobsPage = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { flatPermissions, permissionsReady } = useRolePermissions();

  const allowed =
    Boolean(isLoggedIn) && Boolean(flatPermissions?.nav_public_jobs);

  useEffect(() => {
    if (!permissionsReady) return;
    if (!isLoggedIn) {
      router.replace(
        `${ROUTES.PUBLIC.LOGIN}?redirect=${encodeURIComponent(ROUTES.PUBLIC.JOBS)}`
      );
      return;
    }
    if (!flatPermissions?.nav_public_jobs) {
      router.replace(ROUTES.PRIVATE.DASHBOARD);
    }
  }, [permissionsReady, isLoggedIn, flatPermissions?.nav_public_jobs, router]);

  if (!permissionsReady || !allowed) {
    return (
      <PublicLayout>
        <div className="d-flex justify-content-center py-5">
          <Spin size="large" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <PublicJobs />
    </PublicLayout>
  );
};

export default JobsPage;
