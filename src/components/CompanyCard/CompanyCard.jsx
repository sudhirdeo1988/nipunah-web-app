"use client";

import React from "react";
import { Space, Tag } from "antd";
import Icon from "../Icon";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";

function formatDisplayDate(value) {
  if (!value) return "N/A";

  const normalized = String(value).trim();
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const slashMatch = normalized.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+\d{1,2}:\d{2}:\d{2})?$/
  );
  if (slashMatch) {
    const mm = Number(slashMatch[1]);
    const dd = Number(slashMatch[2]);
    const yyyy = Number(slashMatch[3]);
    const fallback = new Date(yyyy, mm - 1, dd);
    if (!Number.isNaN(fallback.getTime())) {
      return fallback.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  return normalized;
}

const CompanyCard = ({ data }) => {
  const router = useRouter();
  const companyId = data?.id;
  const companyName = data?.name || data?.title || "Company";
  const aboutText =
    data?.aboutCompany ||
    data?.about ||
    data?.description ||
    "No description available.";
  const address = Array.isArray(data?.addresses)
    ? data.addresses.find((a) => a?.isPrimary) || data.addresses[0]
    : null;
  const location = [address?.city, address?.country].filter(Boolean).join(", ") || "N/A";
  const employeeCount = data?.employeesCount || data?.employeeCount || "N/A";
  const createdAtRaw = data?.createdAt || data?.created_at;
  const createdAt = formatDisplayDate(createdAtRaw);
  const industry =
    data?.categories?.[0]?.name ||
    data?.industry ||
    data?.title ||
    "General";

  return (
    <div className="bg-white p-3 shadow-sm rounded">
      <div className="row g-3 align-items-center">
        <div className="col-md-3 d-none d-md-block">
          <div className="border p-3 rounded bg-light">
            <Image
              src="/assets/images/logo.png"
              alt="My Logo"
              width={70}
              height={50}
              className="img-fluid"
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <div className="col-md-9 col-sm-12">
          <h3 className="C-heading size-5 mb-1 bold font-family-creative color-primary text-truncate">
            {companyName}
          </h3>
          <h3 className="C-heading size-6 color-light mb-3 font-family-creative  text-truncate">
            {aboutText}
          </h3>

          <div className="d-flex flex-row gap-3 align-items-center mb-3">
            <div>
              <Space size={4}>
                <Icon name="location_on" />
                <span className="C-heading size-xs color-light mb-0">
                  {location}
                </span>
              </Space>
            </div>
            <div>
              <Space size={4}>
                <Icon name="bookmark_check" />
                <span className="C-heading size-xs color-light mb-0">
                  {employeeCount}
                </span>
              </Space>
            </div>
            <div>
              <Space size={4}>
                <Icon name="nest_clock_farsight_analog" />
                <span className="C-heading size-xs color-light mb-0">
                  {createdAt}
                </span>
              </Space>
            </div>
          </div>

          <div className="row align-items-center">
            <div className="col-8">
              <Space wrap size={4}>
                <Tag color="gold" className="rounded">
                  {industry}
                </Tag>
              </Space>
            </div>
            <div className="col-4 text-right">
              <button
                className="C-button is-link p-0 small bold"
                onClick={() =>
                  router.push(`${ROUTES?.PUBLIC?.COMPANIES}/${companyId}`)
                }
                disabled={!companyId}
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
