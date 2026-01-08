"use client";

import Cookies from "js-cookie";

const TOKEN_KEY = "access_token";
const EXPIRY_KEY = "access_token_expiry";
const USER_TYPE_KEY = "user_type";

export const setToken = (token, expiresIn = 86400, userType = null) => {
  const expiry = Date.now() + expiresIn * 1000;
  Cookies.set(TOKEN_KEY, token, { expires: new Date(expiry) });
  Cookies.set(EXPIRY_KEY, expiry.toString(), { expires: new Date(expiry) });
  if (userType) {
    Cookies.set(USER_TYPE_KEY, userType, { expires: new Date(expiry) });
  }
};

export const clearToken = () => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(EXPIRY_KEY);
  Cookies.remove(USER_TYPE_KEY);
};

export const getUserType = () => {
  return Cookies.get(USER_TYPE_KEY);
};

/**
 * @deprecated Use useRole hook from Redux instead
 * These functions are kept for backward compatibility
 * but should be replaced with Redux-based role checking
 */
export const isAdmin = () => {
  const userType = getUserType();
  return userType === "admin" || userType === "Admin";
};

export const isCompany = () => {
  const userType = getUserType();
  return userType === "company" || userType === "Company";
};

export const isExpert = () => {
  const userType = getUserType();
  return userType === "expert" || userType === "Expert";
};

export const isUser = () => {
  const userType = getUserType();
  return userType === "user" || userType === "User";
};

export const getClientToken = () => {
  const token = Cookies.get(TOKEN_KEY);
  const expiry = parseInt(Cookies.get(EXPIRY_KEY), 10);
  if (!token || !expiry || Date.now() > expiry) {
    clearToken();
    return null;
  }
  return token;
};

export const userTypes = [
  {
    id: 1,
    label: "User",
    value: "user",
    icon: "",
  },
  {
    id: 2,
    label: "Expert",
    value: "expert",
    icon: "",
  },
  {
    id: 3,
    label: "Company",
    value: "company",
    icon: "",
  },
  {
    id: 4,
    label: "Admin",
    value: "admin",
    icon: "",
  },
];
