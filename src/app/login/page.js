"use client";

import { useEffect, memo, useCallback } from "react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/utilities/AuthContext";
import { setToken, userTypes } from "@/utilities/auth";
import { useRouter } from "next/navigation";
import PublicLayout from "@/layout/PublicLayout";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import { Form, Input, Select, Space } from "antd";

import { map as _map } from "lodash-es";

import Icon from "@/components/Icon";

const SignupPopoverContent = memo(({ onNavigate }) => {
  const signupOptions = [
    {
      icon: "bi bi-person-badge-fill",
      title: "Browse Listing",
      description: "Explore companies, experts, Jobs and much more.",
      route: `${ROUTES?.PUBLIC?.SIGNUP}?for=user`,
      buttonText: "Register",
    },
    {
      icon: "bi bi-person-lines-fill",
      title: "Create expert profile",
      description: "Showcase your expertise and get discovered.",
      route: `${ROUTES?.PUBLIC?.SIGNUP}?for=expert`,
      buttonText: "Create profile",
    },
    {
      icon: "bi bi-building-fill-check",
      title: "List my company",
      description: "Subscribe and get listed your company",
      route: `${ROUTES?.PUBLIC?.SIGNUP}?for=company`,
      buttonText: "List company",
    },
  ];

  return (
    <div className="signupPopover text-center">
      <h3 className="C-heading size-4 color-dark font-family-creative extraBold mb-2 text-center text-uppercase">
        Register
      </h3>
      <span className="C-heading size-6 text-center semiBold color-light mb-3">
        Sign up to access more features.
      </span>
      <div className="row g-2 mb-4">
        {signupOptions.map((option, index) => (
          <div className="col" key={index}>
            <div
              className="signupCard p-3 h-100 text-center rounded-3 shadow border"
              role="button"
            >
              <div className="profile rounded-circle mb-3">
                <i className={option.icon}></i>
              </div>
              <span className="C-heading size-6 extraBold mb-3 color-dark">
                {option.title}
              </span>
              <span className="C-heading size-6 color-light mb-3 color-light">
                {option.description}
              </span>
              <button
                className="C-button is-filled w-100"
                onClick={() => onNavigate(option.route)}
              >
                {option?.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

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

  // Memoized navigation handler to prevent unnecessary re-renders
  const handleNavigation = useCallback(
    (route) => {
      router.push(route);
    },
    [router]
  );

  useEffect(() => {
    if (isLoggedIn) {
      router.replace(ROUTES?.PRIVATE?.DASHBOARD);
    }
  }, [isLoggedIn]);

  return (
    <PublicLayout>
      <PageHeadingBanner
        heading="Login or Register"
        currentPageTitle="List of Equipments"
      />

      <div className="container my-5">
        <div className="row justify-content-center align-items-center">
          <div className="col-md-4 col-sm-12">
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
                      <Icon name="admin_panel_settings" isFilled color="#ccc" />
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
                  <button className="C-button is-link p-0 small" type="button">
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
            </div>
          </div>
          <div className="col-1 text-center d-none d-md-block">
            <span className="C-heading size-xs bold mb-0 color-dark">OR</span>
          </div>
          <div className="col-md-7 col-sm-12 text-center">
            <SignupPopoverContent onNavigate={handleNavigation} />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default LoginPage;
