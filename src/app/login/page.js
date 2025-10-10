"use client";

import { useEffect } from "react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/utilities/AuthContext";
import { setToken, userTypes } from "@/utilities/auth";
import { useRouter } from "next/navigation";
import PublicLayout from "@/layout/PublicLayout";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import { Dropdown, Form, Input, Select, Space } from "antd";
import { map as _map } from "lodash-es";
import Link from "next/link";

import Icon from "@/components/Icon";

const items = [
  {
    key: "1",
    type: "group",
    label: (
      <span className="C-heading size-xss bold color-light uppercase mb-0 ">
        Register
      </span>
    ),

    children: _map(userTypes, (user) => ({
      label: (
        <Link
          href={`${ROUTES.PUBLIC.SIGNUP}?for=${user?.value}`}
          className="text-decoration-none"
        >
          <span className="C-heading size-xs mb-1 semiBold text-black-50 p-1">
            For {user?.label}
          </span>
        </Link>
      ),
      key: user?.value,
    })),
  },
];

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
              <div className="p-4 shadow border rounded-2 bg-white">
                <h3 className="C-heading size-4 color-dark font-family-creative extraBold mb-2 text-center text-uppercase">
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
                      <span className="C-heading size-xs semiBold mb-0">
                        Login As
                      </span>
                    }
                    name="type"
                    rules={[
                      {
                        required: true,
                        message: "Please select user type!",
                      },
                    ]}
                    className="mb-3"
                  >
                    <Select
                      placeholder="Select user type"
                      size="large"
                      options={userTypes}
                      prefix={
                        <Icon
                          name="admin_panel_settings"
                          isFilled
                          color="#ccc"
                        />
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    label={
                      <span className="C-heading size-xs semiBold mb-0">
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
                    className="mb-3"
                  >
                    <Input
                      placeholder="Enter username"
                      size="large"
                      prefix={<Icon name="person" isFilled color="#ccc" />}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="C-heading size-xs semiBold mb-0">
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
                    className="mb-3"
                  >
                    <Input.Password
                      placeholder="Enter password"
                      size="large"
                      prefix={<Icon name="passkey" isFilled color="#ccc" />}
                    />
                  </Form.Item>

                  <div className="text-right mb-3">
                    <button
                      className="C-button is-link p-0 small"
                      type="button"
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
                </Form>

                <div className="text-center mb-0">
                  <span className="C-heading size-xs semiBold mb-1">
                    Not registered yet.? &nbsp;
                    <Dropdown menu={{ items }} overlayClassName="authOverlay">
                      <button
                        className="C-button is-link p-0 underline small"
                        type="button"
                      >
                        <Space size={0}>
                          <span className="underline bold">Register here</span>
                          <Icon
                            name="arrow_drop_down"
                            className="color-primary"
                          />
                        </Space>
                      </button>
                    </Dropdown>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default LoginPage;
