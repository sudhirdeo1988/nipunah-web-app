"use client";

import { useAuth } from "@/utilities/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, lazy, Suspense } from "react";
import AppInitializer from "@/components/AppInitializer";
import { ROUTES } from "@/constants/routes";
import { Layout } from "antd";
import PrivateHeader from "module/PrivateHeader";
import { useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/userSlice";

const { Header, Footer, Sider, Content } = Layout;

const PrivateSidebar = lazy(() => import("module/PrivateSidebar"));

export default function AppLayout({ children }) {
  const { isLoggedIn, logout } = useAuth();
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
        <Layout className="c-appLayout">
          {/* Sidebar */}
          <Sider className="appLayout-sideBar">
            <Suspense fallback={<></>}>
              <PrivateSidebar />
            </Suspense>
          </Sider>
          {/* Main Container */}
          <Layout>
            <Header className="appLayout-header">
              <PrivateHeader />
            </Header>
            <Content className="appLayout-body">
              {/* e.g., NavBar, Sidebar here */}
              <div className="p-3 h-100">{children}</div>
            </Content>
            <Footer className="appLayout-footer">Footer</Footer>
          </Layout>
        </Layout>
      </div>
    </AppInitializer>
  );
}
