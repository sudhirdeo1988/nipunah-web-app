"use client";

import { useEffect } from "react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/utilities/AuthContext";
import { setToken } from "@/utilities/auth";
import { useRouter } from "next/navigation";
import PublicLayout from "@/layout/PublicLayout";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import { Form, Input, Space } from "antd";
import Icon from "@/components/Icon";

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
              <div className="p-3 shadow border rounded-2 bg-white">
                <h3 className="C-heading size-4 color-dark font-family-creative extraBold mb-4 text-center text-uppercase">
                  Login
                </h3>
                <Form
                  name="basic"
                  layout="vertical"
                  autoComplete="off"
                  onFinish={handleLogin}
                >
                  <Form.Item
                    label={
                      <span className="C-heading size-xs semiBold mb-1">
                        User Name
                      </span>
                    }
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your username!",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter username"
                      size="large"
                      prefix={<Icon name="person" isFilled color="#ccc" />}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="C-heading size-xs semiBold mb-1">
                        Password
                      </span>
                    }
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please enter password!",
                      },
                    ]}
                    required
                  >
                    <Input.Password
                      placeholder="Enter password"
                      size="large"
                      prefix={<Icon name="passkey" isFilled color="#ccc" />}
                    />
                  </Form.Item>

                  <div className="text-right mb-4">
                    <button
                      className="C-button is-link p-0 small"
                      type="button"
                      onClick={() => router.push(ROUTES?.PUBLIC.SIGNUP)}
                    >
                      <Space size={4}>
                        <Icon name="lock" size="small" />
                        Forgot Password?
                      </Space>
                    </button>
                  </div>

                  <div className="text-center mb-3">
                    <button className="C-button is-filled w-100" type="submit">
                      Login
                    </button>
                  </div>

                  <div className="text-center mb-0">
                    <span className="C-heading size-xs semiBold mb-1">
                      Not registered yet.? &nbsp;
                      <button
                        className="C-button is-link p-0 underline"
                        type="button"
                        onClick={() => router.push(ROUTES?.PUBLIC.SIGNUP)}
                      >
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
