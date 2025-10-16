"use client";

import { useAuth } from "@/utilities/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, lazy, Suspense } from "react";
import AppInitializer from "@/components/AppInitializer";
import { ROUTES } from "@/constants/routes";
import { Layout } from "antd";
import PrivateHeader from "module/PrivateHeader";

const { Header, Footer, Sider, Content } = Layout;

const PrivateSidebar = lazy(() => import("module/PrivateSidebar"));

export default function AppLayout({ children }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace(ROUTES?.PUBLIC?.LOGIN);
    }
  }, [isLoggedIn]);

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
