"use client";

import Cookies from "js-cookie";

const TOKEN_KEY = "token";
const EXPIRY_KEY = "token_expiry";

export const setToken = (token, expiresIn = 3600) => {
  const expiry = Date.now() + expiresIn * 1000;
  Cookies.set(TOKEN_KEY, token, { expires: new Date(expiry) });
  Cookies.set(EXPIRY_KEY, expiry.toString(), { expires: new Date(expiry) });
};

export const clearToken = () => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(EXPIRY_KEY);
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
];
