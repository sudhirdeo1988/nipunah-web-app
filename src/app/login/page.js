"use client";

import { useEffect } from "react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/utilities/AuthContext";
import { setToken } from "@/utilities/auth";
import { useRouter } from "next/navigation";
import PublicLayout from "@/layout/PublicLayout";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import { Form, Input } from "antd";

const LoginPage = () => {
  const { setToken: updateContextToken } = useAuth();
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const handleLogin = () => {
    const fakeToken = "abc123";
    setToken(fakeToken, 3600); // 1 hour expiry
    updateContextToken(fakeToken);
    router.push("/app/dashboard");
  };

  useEffect(() => {
    if (isLoggedIn) {
      router.replace(ROUTES?.PRIVATE?.DASHBOARD);
    }
  }, [isLoggedIn]);

  return (
    <PublicLayout>
      <PageHeadingBanner
        heading="Login"
        currentPageTitle="List of Equipments"
      />
      <section className="section-padding small">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-md-6 col-sm-12">
              <div className="p-3 shadow border border-light rounded-2">
                <Form
                  name="basic"
                  layout="vertical"
                  autoComplete="off"
                  onFinish={handleLogin}
                >
                  <span className="C-heading size-xs semiBold mb-1">
                    User Name
                  </span>
                  <Form.Item
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your username!",
                      },
                    ]}
                  >
                    <Input placeholder="Enter username" size="large" />
                  </Form.Item>
                  <span className="C-heading size-xs semiBold mb-1">
                    Password
                  </span>
                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please enter password!",
                      },
                    ]}
                  >
                    <Input.Password placeholder="Enter password" size="large" />
                  </Form.Item>

                  <div className="text-center mb-3">
                    <button className="C-button is-filled w-100" type="submit">
                      Login
                    </button>
                  </div>

                  <div className="text-center mb-0">
                    <span className="C-heading size-xs semiBold mb-1">
                      Not registered yet &nbsp;
                      <button className="C-button is-link p-0" type="button">
                        Register here
                      </button>
                    </span>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default LoginPage;
