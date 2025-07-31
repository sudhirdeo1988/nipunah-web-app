"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getClientToken, clearToken } from "./auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getClientToken();
    setToken(token);
    setLoading(false);
  }, []);

  const logout = () => {
    clearToken();
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, isLoggedIn: !!token, logout, setToken }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
