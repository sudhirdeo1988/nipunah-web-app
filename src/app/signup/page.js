"use client";

import { useEffect } from "react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/utilities/AuthContext";

import { useRouter } from "next/navigation";
import PublicLayout from "@/layout/PublicLayout";
import { Tabs } from "antd";

import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import User from "@/components/SignUp/User";
import Company from "@/components/SignUp/Company";

const SignUpPage = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace(ROUTES?.PRIVATE?.DASHBOARD);
    }
  }, [isLoggedIn]);

  return (
    <PublicLayout>
      <PageHeadingBanner heading="Registeration" currentPageTitle="" />

      <section className="section-padding small">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-md-12 col-sm-12">
              <Tabs
                items={[
                  {
                    label: `User Registration`,
                    key: 1,
                    children: (
                      <div className="bg-white p-3">
                        <User />
                      </div>
                    ),
                  },
                  {
                    label: `Company Registration`,
                    key: 2,
                    children: (
                      <div className="bg-white p-3">
                        <Company />
                      </div>
                    ),
                  },
                ]}
                className="registrationTabs"
                type="card"
              />
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default SignUpPage;
