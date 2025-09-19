"use client";

import { useEffect } from "react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/utilities/AuthContext";
import { setToken } from "@/utilities/auth";
import { useRouter } from "next/navigation";

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
    <div>
      <h2>Login</h2>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginPage;
