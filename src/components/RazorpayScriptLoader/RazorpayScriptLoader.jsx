"use client";

import { useEffect, useState } from "react";
import { loadRazorpayScript } from "@/utilities/razorpay";

/**
 * Component to load Razorpay script
 */
const RazorpayScriptLoader = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRazorpayScript()
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load Razorpay script:", err);
        setError(err.message);
        setIsLoaded(false);
      });
  }, []);

  if (error) {
    console.warn("Razorpay script loading error:", error);
    // Still render children even if script fails (for dummy mode)
  }

  return <>{children}</>;
};

export default RazorpayScriptLoader;














