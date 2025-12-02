"use client";

import { useAuth } from "@/utilities/AuthContext";
import { setToken } from "@/utilities/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { setToken: updateContextToken } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    const fakeToken = "abc123";
    setToken(fakeToken, 86400); // 24 hours expiry
    updateContextToken(fakeToken);
    router.push("/app/dashboard");
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
