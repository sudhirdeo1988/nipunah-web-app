"use client";

import { useAuth } from "@/utilities/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, lazy, Suspense } from "react";
import AppInitializer from "@/components/AppInitializer";
import { ROUTES } from "@/constants/routes";
import { Layout } from "antd";
import HeaderBeta from "@/components/HeaderBeta";
import { useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/userSlice";

const { Sider, Content } = Layout;

const PrivateSidebar = lazy(() => import("module/PrivateSidebar"));

const HEADER_HEIGHT = 76;

export default function AppLayout({ children }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isLoggedIn) {
      dispatch(clearUser());
      router.replace(ROUTES?.PUBLIC?.LOGIN);
    }
  }, [isLoggedIn, router, dispatch]);

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
