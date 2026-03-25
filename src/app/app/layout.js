"use client";

import { useAuth } from "@/utilities/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, lazy, Suspense, useMemo } from "react";
import AppInitializer from "@/components/AppInitializer";
import { ROUTES } from "@/constants/routes";
import { Layout } from "antd";
import HeaderBeta from "@/components/HeaderBeta";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearUser } from "@/store/slices/userSlice";

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
  const user = useAppSelector((state) => state.user.user);

  const firstAccessibleNavRoute = useMemo(() => {
    const first = NAV_ROUTE_PERMISSIONS.find(
      (item) => item?.route && user?.[item.key] !== false
    );
    return first?.route || ROUTES?.PUBLIC?.LOGIN;
  }, [user]);

  const blockedNavRoute = useMemo(() => {
    if (!pathname?.startsWith("/app/")) return null;
    const matched = NAV_ROUTE_PERMISSIONS.find(
      (item) =>
        item?.route &&
        (pathname === item.route || pathname.startsWith(`${item.route}/`))
    );
    if (!matched) return null; // Non-main-nav private pages are handled by their own rules
    return user?.[matched.key] === false ? matched.route : null;
  }, [pathname, user]);

  useEffect(() => {
    if (!isLoggedIn) {
      dispatch(clearUser());
      router.replace(ROUTES?.PUBLIC?.LOGIN);
    }
  }, [isLoggedIn, router, dispatch]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (!blockedNavRoute) return;
    router.replace(firstAccessibleNavRoute);
  }, [isLoggedIn, blockedNavRoute, firstAccessibleNavRoute, router]);

  if (!isLoggedIn) return null;

  return (
    <AppInitializer>
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
    </AppInitializer>
  );
}
