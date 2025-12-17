"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getClientToken, clearToken } from "./auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to validate and update token
  const validateToken = useCallback(() => {
    const currentToken = getClientToken();

    // getClientToken() automatically clears expired tokens and returns null
    // So if currentToken is null, the token is either missing or expired
    setToken(currentToken);

    return currentToken;
  }, []);

  // Check token on mount
  useEffect(() => {
    const initialToken = validateToken();
    setLoading(false);
  }, [validateToken]);

  // Set up periodic token validation (check every 60 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      validateToken();
    }, 60000); // Check every 60 seconds

    // Also check when window gains focus (user comes back to tab)
    const handleFocus = () => {
      validateToken();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [validateToken]);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
  }, []);

  // Update token function
  const updateToken = useCallback((newToken) => {
    setToken(newToken);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, isLoggedIn: !!token, logout, setToken: updateToken }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const companyRegister = {
  id: 123, // Unique ID
  name: "", // String - name of company
  shortName: "", // string - short name
  foundYear: "", // date time - yeat
  websiteUrl: "", // string - website URL
  logoUrl: "", // string - logo URL
  description: "", // string - description
  industry: "", // string - industry type
  employeeCount: "", // number - number of employees
  contactEmail: "", // string - contact email
  contactNumber: "", // number - contact number
  turnOver: "", // number - turnover
  isMnc: true / false, // boolean - is MNC
  subscriptionPlan: "free / basic / premium", // string - subscription plan
  paymentDetails: {
    isPaidCompany: true / false, // boolean - is paid company
  }, // object - payment details
  createdAt: "date time", // date time - created at
  updatedAt: "date time", // date time - updated at
  postedJobs: [
    {
      jobId: 1,
      title: "Job Title",
      description: "Job Description",
      location: "Job Location",
      employmentType: "Full-time / Part-time / Contract",
      experienceLevel: "Entry / Mid / Senior",
      salaryRange: "Salary Range",
      skillsRequired: ["Skill1", "Skill2"],
      postedDate: "date time",
      applicationDeadline: "date time",
      isActive: true / false,
    },
  ], // array of posted jobs
  categories: [
    {
      id: 1,
      name: "Category Name",
      description: "Category Description",
      createdAt: "date time",
      updatedAt: "date time",
      logoUrl: "",
      subCategories: [
        {
          id: 1,
          name: "Sub-category Name",
          description: "Sub-category Description",
          createdAt: "date time",
          updatedAt: "date time",
          logoUrl: "",
        },
      ],
    },
  ], // array of categories
  socialLinks: [
    {
      platform: "LinkedIn / Twitter / Facebook",
      url: "Profile URL",
    },
  ], // array of social links
  locations: [
    {
      city: "",
      country: "",
      address: "",
      isPrimaryLocation: true / false,
    },
    {
      city: "",
      country: "",
      address: "",
      isPrimaryLocation: true / false,
    },
  ], // array of locations
};
