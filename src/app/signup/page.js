"use client";

import { useEffect } from "react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/utilities/AuthContext";

import { useRouter, useSearchParams } from "next/navigation";
import PublicLayout from "@/layout/PublicLayout";

import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import User from "@/components/SignUp/User";
import Company from "@/components/SignUp/Company";

const SignUpPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuth();

  // Get the 'for' parameter from URL
  const registrationType = searchParams.get("for");

  useEffect(() => {
    if (isLoggedIn) {
      router.replace(ROUTES?.PRIVATE?.DASHBOARD);
    }
  }, [isLoggedIn]);

  // Determine which component to render based on URL parameter
  const renderRegistrationComponent = () => {
    switch (registrationType) {
      case "user":
        return <User />;
      case "company":
        return <Company />;
      default:
        // Default to User registration if no parameter or invalid parameter
        return <User />;
    }
  };

  // Determine the page title based on registration type
  const getPageTitle = () => {
    switch (registrationType) {
      case "user":
        return "User Registration";
      case "company":
        return "Company Registration";
      default:
        return "User Registration";
    }
  };

  return (
    <PublicLayout>
      <PageHeadingBanner heading={getPageTitle()} currentPageTitle="" />

      <section className="section-padding small">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-md-12 col-sm-12">
              <div className="bg-white p-3 shadow rounded-2">
                {renderRegistrationComponent()}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default SignUpPage;
