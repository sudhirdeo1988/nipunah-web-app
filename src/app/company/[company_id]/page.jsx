"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Empty, Spin } from "antd";
import { useParams, useRouter } from "next/navigation";
import CompanyPublicProfile from "@/components/CompanyPublicProfile";
import PublicLayout from "@/layout/PublicLayout";
import { ROUTES } from "@/constants/routes";

function pickFirst(...values) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return null;
}

function normalizeCompanyForProfile(raw) {
  if (!raw || typeof raw !== "object") return null;
  const addressObj =
    raw.address && typeof raw.address === "object" && !Array.isArray(raw.address)
      ? raw.address
      : {};
  const locations = Array.isArray(raw.locations)
    ? raw.locations
    : Array.isArray(raw.addresses)
    ? raw.addresses
    : [];
  const firstLocation = locations[0] || {};
  const locationObj =
    firstLocation && typeof firstLocation === "object" ? firstLocation : {};
  const categoryName = Array.isArray(raw.categories)
    ? raw.categories.find((item) => item && typeof item === "object")?.name
    : null;

  return {
    ...raw,
    name: pickFirst(raw.name, raw.company_name, raw.title),
    description: pickFirst(raw.description, raw.about, raw.aboutCompany),
    location: pickFirst(
      raw.location,
      raw.city,
      addressObj.city,
      locationObj.city,
      addressObj.country,
      locationObj.country,
      raw.country
    ),
    industry: pickFirst(raw.industry, raw.category?.name, categoryName, raw.category_name),
    contact_email: pickFirst(
      raw.contact_email,
      raw.contactEmail,
      raw.email,
      raw.company_email
    ),
    employee_count: pickFirst(
      raw.employee_count,
      raw.employeeCount,
      raw.employees_count,
      raw.employeesCount,
      raw.employees
    ),
    founded_in: pickFirst(
      raw.founded_in,
      raw.foundedIn,
      raw.foundYear,
      raw.founded_year,
      raw.established_year
    ),
    turn_over: pickFirst(raw.turn_over, raw.turnOver, raw.turnover, raw.annual_turnover),
    posted_jobs: Array.isArray(raw.posted_jobs)
      ? raw.posted_jobs
      : Array.isArray(raw.postedJobs)
      ? raw.postedJobs
      : [],
  };
}

const CompanyDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const companyId = params?.company_id;
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanyDetails = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Failed to load company details");
      }
      const payload =
        data?.data?.company ||
        data?.company ||
        (data?.data && typeof data.data === "object" ? data.data : data);
      setCompany(normalizeCompanyForProfile(payload));
    } catch (err) {
      setError(err?.message || "Failed to load company details");
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  const backLink = useMemo(
    () => ({
      label: "Back to Companies",
      onClick: () => router.push(ROUTES.PUBLIC.COMPANIES),
    }),
    [router]
  );

  return (
    <PublicLayout>
      {loading ? (
        <div className="container text-center py-5">
          <Spin size="large" />
        </div>
      ) : error ? (
        <div className="container py-5">
          <Empty description={error} />
        </div>
      ) : company ? (
        <CompanyPublicProfile
          company={company}
          companyId={companyId}
          backLink={backLink}
        />
      ) : (
        <div className="container py-5">
          <Empty description="Company not found." />
        </div>
      )}
    </PublicLayout>
  );
};

export default CompanyDetailsPage;
