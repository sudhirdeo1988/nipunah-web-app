"use client";

import { useAuth } from "@/utilities/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, lazy, Suspense } from "react";
import AppInitializer from "@/components/AppInitializer";
import { ROUTES } from "@/constants/routes";
import { Layout } from "antd";

const { Header, Footer, Sider, Content } = Layout;

const PrivateSidebar = lazy(() => import("module/PrivateSidebar"));

const headerStyle = {
  textAlign: "center",
  color: "red",
  height: 64,
  paddingInline: 48,
  lineHeight: "64px",
};
const contentStyle = {
  textAlign: "center",
  minHeight: 120,
  lineHeight: "120px",
};

const footerStyle = {
  textAlign: "center",
};

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
        <Layout className="c-appLayout">
          {/* Sidebar */}
          <Sider className="appLayout-sideBar">
            <Suspense fallback={<></>}>
              <PrivateSidebar />
            </Suspense>
          </Sider>
          {/* Main Container */}
          <Layout>
            <Header style={headerStyle}>Header</Header>
            <Content style={contentStyle}>
              {/* e.g., NavBar, Sidebar here */}
              {children}
            </Content>
            <Footer style={footerStyle}>Footer</Footer>
          </Layout>
        </Layout>
      </div>
    </AppInitializer>
  );
}
