"use client";

import { useEffect, memo, useCallback, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/utilities/AuthContext";
import { setToken } from "@/utilities/auth";
import { useRouter } from "next/navigation";
import PublicLayout from "@/layout/PublicLayout";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import { Form, Input, Select, Space, message, Modal, Result } from "antd";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/userSlice";
import {
  saveUserSession,
  loadUserSession,
  fetchUserDetailsByRole,
  getIdFromStoredUser,
  getRoleFromStoredUser,
  applyRolePermissionsToUser,
  applyUserIdFromCookieIfMissing,
} from "@/utilities/sessionUser";

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
          <div className="col-md-6 col-12" key={index}>
            <div
              className="signupCard p-3 h-100 text-center rounded-3 shadow border d-flex flex-column"
              role="button"
            >
              <div className="profile rounded-circle mb-3">
                <i className={option.icon}></i>
              </div>
              <span className="C-heading size-6 extraBold mb-3 color-dark">
                {option.title}
              </span>
              <span
                className="C-heading size-6 color-light mb-3 color-light flex-grow-1"
                style={{ minHeight: "4.5rem" }}
              >
                {option.description}
              </span>
              <button
                className="C-button is-filled w-100 mt-auto"
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

SignupPopoverContent.displayName = "SignupPopoverContent";

const LoginPage = () => {
  const { setToken: updateContextToken } = useAuth();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotForm] = Form.useForm();

  const openForgotModal = useCallback(() => {
    setForgotSuccess(false);
    forgotForm.resetFields();
    setForgotOpen(true);
  }, [forgotForm]);

  const closeForgotModal = useCallback(() => {
    setForgotOpen(false);
  }, []);

  const handleForgotSubmit = useCallback(
    async (values) => {
      try {
        setForgotSubmitting(true);
        const payload = {
          email: values.email,
          username: values.email, // email and username are same by requirement
        };
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        let data = {};
        try {
          data = await res.json();
        } catch (_) {}

        if (!res.ok) {
          const msg =
            data?.message ||
            data?.error ||
            "Failed to process forgot password request.";
          message.error(msg);
          return;
        }

        setForgotSuccess(true);
        message.success(
          data?.message ||
            "Temporary password sent on registered email id."
        );
        setTimeout(() => {
          setForgotOpen(false);
        }, 5000);
      } catch (err) {
        message.error(
          err?.message || "Failed to process forgot password request."
        );
      } finally {
        setForgotSubmitting(false);
      }
    },
    []
  );

  const handleLogin = async (values) => {
    try {
      setLoading(true);

      // Call Next.js API route (which proxies to external API to avoid CORS)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      // Parse response
      const data = await response.json();

      // Check if request was successful
      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Login failed. Please check your credentials and try again."
        );
      }

      // Extract token from response
      // Assuming the API returns { token: "..." } or { access_token: "..." } or { data: { token: "..." } }
      const token =
        data?.token ||
        data?.access_token ||
        data?.data?.token ||
        data?.data?.access_token;

      if (!token) {
        throw new Error("Token not found in response");
      }

      // Extract the actual user payload from common API shapes
      // (some backends return: { token, user }, or { access_token, data: { ...user } }, etc.)
      const userDetailsRaw =
        (data?.user && typeof data.user === "object" && data.user) ||
        (data?.data?.user &&
          typeof data.data.user === "object" &&
          data.data.user) ||
        (data?.data && typeof data.data === "object" && data.data) ||
        (data && typeof data === "object" && data) ||
        {};

      // Remove token-like fields so storage/Redux only keeps user details
      // (avoid nested token/data/user wrappers).
      const {
        token: _t,
        access_token: _at,
        status: _status,
        ...userWithoutTokensBase
      } = userDetailsRaw || {};

      const userWithoutTokens = {
        ...userWithoutTokensBase,
        id:
          userWithoutTokensBase?.id ||
          data?.id ||
          data?.data?.id ||
          data?.user?.id,
        username:
          userWithoutTokensBase?.username ||
          data?.username ||
          data?.data?.username ||
          data?.user?.username ||
          values.username,
        email:
          userWithoutTokensBase?.email ||
          data?.email ||
          data?.data?.email ||
          data?.user?.email,
        name:
          userWithoutTokensBase?.name ||
          data?.name ||
          data?.data?.name ||
          data?.user?.name,
        role:
          userWithoutTokensBase?.role ||
          data?.role ||
          data?.data?.role ||
          data?.user?.role,
        type:
          userWithoutTokensBase?.type ||
          data?.type ||
          data?.data?.type ||
          data?.user?.type,
      };

      // Store token + user id in cookies (24 hours expiry; id from login success)
      const resolvedUserType =
        userWithoutTokens.type || userWithoutTokens.role || null;
      const resolvedUserId =
        userWithoutTokens.id ??
        data?.id ??
        data?.data?.id ??
        data?.user?.id ??
        null;

      setToken(token, 86400, resolvedUserType, resolvedUserId);
      updateContextToken(token);

      let userWithPermissions = applyRolePermissionsToUser(userWithoutTokens);
      userWithPermissions = applyUserIdFromCookieIfMissing(userWithPermissions);
      saveUserSession(userWithPermissions);
      dispatch(setUser(userWithPermissions));

      // If details are missing in login response, hydrate via role-based GET calls
      const role = getRoleFromStoredUser(userWithPermissions);
      const id = getIdFromStoredUser(userWithPermissions);
      if (role && id) {
        try {
          const details = await fetchUserDetailsByRole({ role, id });
          let merged = applyRolePermissionsToUser({
            ...userWithPermissions,
            ...details,
          });
          merged = applyUserIdFromCookieIfMissing(merged);
          saveUserSession(merged);
          dispatch(setUser(merged));
        } catch (e) {
          // Ignore hydration errors; user is still logged in with token
          console.warn("Failed to hydrate user details after login:", e);
        }
      }

      // Show success message
      message.success("Login successful!");

      // Redirect based on role:
      // - user/expert -> public home page
      // - company/admin -> private dashboard
      const stored = loadUserSession() || userWithPermissions;
      const roleAfterLogin = getRoleFromStoredUser(stored || {}) || "";
      const postLoginRoute =
        roleAfterLogin === "user" || roleAfterLogin === "expert"
          ? ROUTES?.PUBLIC?.HOME || "/"
          : ROUTES?.PRIVATE?.DASHBOARD || "/app/dashboard";

      router.push(postLoginRoute);
    } catch (error) {
      // Handle error
      const errorMessage =
        error?.message ||
        "Login failed. Please check your credentials and try again.";

      message.error(errorMessage);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
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
      // If we're already logged in, redirect using role from local session.
      // Fallback to dashboard if role is missing.
      const stored = loadUserSession();
      const role = getRoleFromStoredUser(stored || {}) || "";
      const route =
        role === "user" || role === "expert"
          ? ROUTES?.PUBLIC?.HOME || "/"
          : ROUTES?.PRIVATE?.DASHBOARD || "/app/dashboard";

      router.replace(route);
    }
  }, [isLoggedIn, router]);

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
                form={form}
                name="basic"
                layout="vertical"
                autoComplete="off"
                onFinish={handleLogin}
              >
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
                    onClick={openForgotModal}
                  >
                    <Space size={4}>
                      <Icon name="lock" size="small" />
                      Forgot Password?
                    </Space>
                  </button>
                </div>

                <div className="text-center mb-3">
                  <button
                    className="C-button is-filled w-100"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
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

        <Modal
          open={forgotOpen}
          onCancel={closeForgotModal}
          footer={null}
          title="Forgot password"
          destroyOnClose
        >
          {forgotSuccess ? (
            <Result
              status="success"
              title="Temporary password sent on registered email id"
            />
          ) : (
            <Form
              form={forgotForm}
              layout="vertical"
              onFinish={handleForgotSubmit}
              autoComplete="off"
            >
              <Form.Item
                label="Email ID"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please enter your email id.",
                  },
                  {
                    type: "email",
                    message: "Please enter a valid email address.",
                  },
                ]}
              >
                <Input placeholder="Enter your registered email id" size="large" />
              </Form.Item>
              <Form.Item className="mb-0">
                <button
                  className="C-button is-filled w-100"
                  type="submit"
                  disabled={forgotSubmitting}
                >
                  {forgotSubmitting ? "Submitting..." : "Submit"}
                </button>
              </Form.Item>
            </Form>
          )}
        </Modal>
      </div>
    </PublicLayout>
  );
};

export default LoginPage;
