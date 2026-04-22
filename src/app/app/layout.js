"use client";

import { useAuth } from "@/utilities/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, lazy, Suspense, useMemo } from "react";
import { ROUTES } from "@/constants/routes";
import { Layout } from "antd";
import HeaderBeta from "@/components/HeaderBeta";
import { useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/userSlice";
import { useRolePermissions } from "@/hooks/useRolePermissions";

const { Sider, Content } = Layout;

const PrivateSidebar = lazy(() => import("module/PrivateSidebar"));

const HEADER_HEIGHT = 76;
const NAV_ROUTE_PERMISSIONS = [
  { route: ROUTES?.PRIVATE?.DASHBOARD, key: "nav_dashboard" },
  { route: ROUTES?.PRIVATE?.CATEGORY, key: "nav_categories" },
  { route: ROUTES?.PRIVATE?.EXPERTS, key: "nav_experts" },
  { route: ROUTES?.PRIVATE?.USERS, key: "nav_users" },
  { route: ROUTES?.PRIVATE?.COMPANY, key: "nav_companies" },
  { route: ROUTES?.PRIVATE?.SERVICES, key: "nav_services" },
  { route: ROUTES?.PRIVATE?.JOB, key: "nav_jobs" },
  { route: ROUTES?.PRIVATE?.ENQUIRIES, key: "nav_enquiries" },
  { route: ROUTES?.PRIVATE?.EQUIPMENT, key: "nav_equipments" },
  { route: ROUTES?.PRIVATE?.ROLES, key: "nav_role_management" },
  { route: ROUTES?.PRIVATE?.PRICING, key: "nav_pricing" },
];

export default function AppLayout({ children }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { flatPermissions, permissionsReady } = useRolePermissions();

  const firstAccessibleNavRoute = useMemo(() => {
    const first = NAV_ROUTE_PERMISSIONS.find(
      (item) => item?.route && flatPermissions?.[item.key] !== false
    );
    return first?.route || ROUTES?.PUBLIC?.LOGIN;
  }, [flatPermissions]);

  const blockedNavRoute = useMemo(() => {
    if (!permissionsReady) return null;
    if (!pathname?.startsWith("/app/")) return null;
    const matched = NAV_ROUTE_PERMISSIONS.find(
      (item) =>
        item?.route &&
        (pathname === item.route || pathname.startsWith(`${item.route}/`))
    );
    if (!matched) return null; // Non-main-nav private pages are handled by their own rules
    return flatPermissions?.[matched.key] === false ? matched.route : null;
  }, [pathname, flatPermissions, permissionsReady]);

  useEffect(() => {
    if (!isLoggedIn) {
      dispatch(clearUser());
      router.replace(ROUTES?.PUBLIC?.LOGIN);
    }
  }, [isLoggedIn, router, dispatch]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (!permissionsReady) return;
    if (!blockedNavRoute) return;
    router.replace(firstAccessibleNavRoute);
  }, [isLoggedIn, blockedNavRoute, firstAccessibleNavRoute, permissionsReady, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="private-layout">
      {/* Same header as public (before login) */}
      <HeaderBeta />
      {/* Sidebar + main content below header */}
      <div className="private-layout-body" style={{ paddingTop: HEADER_HEIGHT }}>
        <Sider className="appLayout-sideBar" width={230}>
          <Suspense fallback={<></>}>
            <PrivateSidebar />
          </Suspense>
        </Sider>
        <Layout className="appLayout-main">
          <Content className="appLayout-body">
            <div className="appLayout-content p-3 h-100">{children}</div>
          </Content>
        </Layout>
      </div>
    </div>
  );
}
