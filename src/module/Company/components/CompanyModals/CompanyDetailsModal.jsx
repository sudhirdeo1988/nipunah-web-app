"use client";

import React, { memo } from "react";
import { Modal, Table, Tag } from "antd";

function valueOrDash(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

/**
 * CompanyDetailsModal Component
 *
 * Displays comprehensive company information in a modal
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Object} props.company - Company data
 * @param {Function} props.onCancel - Handler for modal cancel
 * @returns {JSX.Element} The CompanyDetailsModal component
 */
const CompanyDetailsModal = memo(({ isOpen, company, onCancel }) => {
  const turnoverValue = company?.turnOver ?? company?.turnover;
  const normalizedLocations = Array.isArray(company?.locations)
    ? company.locations
    : Array.isArray(company?.addresses)
      ? company.addresses
      : [];
  const normalizedCategories = Array.isArray(company?.categories)
    ? company.categories
    : company?.category
      ? [company.category]
      : [];
  const sectionCardStyle = {
    border: "1px solid #f0f0f0",
    borderRadius: "10px",
  };

  return (
    <Modal
      title={
        <span className="C-heading size-5 mb-0 bold">Company Details</span>
      }
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      width={1000}
      centered
    >
      <div className="py-2">
        {company && (
          <>
            <div className="mb-3 p-3" style={sectionCardStyle}>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <p className="C-heading size-xs mb-1 text-muted">Company Name</p>
                  <p className="C-heading size-5 mb-0 bold">
                    {valueOrDash(company.name)}
                  </p>
                </div>
                <div className="text-end">
                  <p className="C-heading size-xs mb-1 text-muted">Status</p>
                  <p className="C-heading size-6 mb-0">
                    <Tag color={company.status === "active" ? "green" : "red"}>
                      {company.status === "active" ? "Active" : "Inactive"}
                    </Tag>
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-3 p-3" style={sectionCardStyle}>
              <p className="C-heading size-xs mb-2 text-muted bold">Basic Information</p>
              <div className="row">
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">Short Name</p>
                  <p className="C-heading size-6 mb-0">
                    {valueOrDash(company.shortName)}
                  </p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">Industry</p>
                  <p className="C-heading size-6 mb-0">
                    {valueOrDash(company.industry)}
                  </p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">Founded Year</p>
                  <p className="C-heading size-6 mb-0">
                    {valueOrDash(company.foundYear)}
                  </p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">Employee Count</p>
                  <p className="C-heading size-6 mb-0">
                    {valueOrDash(
                      company.employeeCount ||
                        company.employees_count ||
                        company.employeesCount
                    )}
                  </p>
                </div>
                <div className="col-6 mb-0">
                  <p className="C-heading size-xs mb-1 text-muted">Turnover</p>
                  <p className="C-heading size-6 mb-0">{valueOrDash(turnoverValue)}</p>
                </div>
                <div className="col-6 mb-0">
                  <p className="C-heading size-xs mb-1 text-muted">Is MNC</p>
                  <p className="C-heading size-6 mb-0">
                    <Tag color={company.isMnc ? "green" : "default"}>
                      {company.isMnc ? "Yes" : "No"}
                    </Tag>
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-3 p-3" style={sectionCardStyle}>
              <p className="C-heading size-xs mb-2 text-muted bold">
                Contact Information
              </p>
              <div className="row">
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">Email</p>
                  <p className="C-heading size-6 mb-0">
                    {valueOrDash(company.contactEmail || company.email)}
                  </p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">Phone</p>
                  <p className="C-heading size-6 mb-0">
                    {valueOrDash(company.contactNumber || company.contact_number)}
                  </p>
                </div>
                <div className="col-6 mb-0">
                  <p className="C-heading size-xs mb-1 text-muted">Subscription Plan</p>
                  <p className="C-heading size-6 mb-0">
                    <Tag
                      color={
                        company.subscriptionPlan === "premium"
                          ? "gold"
                          : company.subscriptionPlan === "basic"
                          ? "blue"
                          : "default"
                      }
                    >
                      {valueOrDash(company.subscriptionPlan).charAt(0).toUpperCase() +
                        valueOrDash(company.subscriptionPlan).slice(1)}
                    </Tag>
                  </p>
                </div>
                <div className="col-6 mb-0">
                  <p className="C-heading size-xs mb-1 text-muted">Website</p>
                  <p className="C-heading size-6 mb-0">
                    {company.websiteUrl || company.website ? (
                      <a
                        href={company.websiteUrl || company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {company.websiteUrl || company.website}
                      </a>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div className="col-12 mt-3">
                  <p className="C-heading size-xs mb-1 text-muted">Description</p>
                  <p className="C-heading size-6 mb-0">
                    {valueOrDash(company.description || company.aboutCompany)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-3 p-3" style={sectionCardStyle}>
              <p className="C-heading size-xs mb-2 text-muted bold">Locations</p>
              {normalizedLocations.length > 0 ? (
                normalizedLocations.map((location, index) => (
                  <div
                    key={index}
                    className={index === normalizedLocations.length - 1 ? "" : "mb-3 pb-3"}
                    style={
                      index === normalizedLocations.length - 1
                        ? {}
                        : { borderBottom: "1px solid #f0f0f0" }
                    }
                  >
                    <div className="row">
                      <div className="col-4 mb-2">
                        <p className="C-heading size-xs mb-1 text-muted">City</p>
                        <p className="C-heading size-6 mb-0">{valueOrDash(location.city)}</p>
                      </div>
                      <div className="col-4 mb-2">
                        <p className="C-heading size-xs mb-1 text-muted">Country</p>
                        <p className="C-heading size-6 mb-0">{valueOrDash(location.country)}</p>
                      </div>
                      <div className="col-4 mb-2">
                        <p className="C-heading size-xs mb-1 text-muted">Primary</p>
                        <p className="C-heading size-6 mb-0">
                          <Tag
                            color={
                              location.isPrimaryLocation || location.isPrimary
                                ? "green"
                                : "default"
                            }
                          >
                            {location.isPrimaryLocation || location.isPrimary ? "Yes" : "No"}
                          </Tag>
                        </p>
                      </div>
                      <div className="col-12">
                        <p className="C-heading size-xs mb-1 text-muted">Address</p>
                        <p className="C-heading size-6 mb-0">
                          {valueOrDash(location.address)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="C-heading size-6 mb-0 text-muted">No locations available</p>
              )}
            </div>

            <div className="mb-3 p-3" style={sectionCardStyle}>
              <p className="C-heading size-xs mb-2 text-muted bold">
                Posted Jobs ({company.postedJobs?.length || 0})
              </p>
              {company.postedJobs?.length > 0 ? (
                <Table
                  columns={[
                    {
                      title: "Job Title",
                      dataIndex: "title",
                      key: "title",
                      render: (text) => (
                        <span className="C-heading size-6 mb-0 semiBold">
                          {text}
                        </span>
                      ),
                    },
                    {
                      title: "Location",
                      dataIndex: "location",
                      key: "location",
                      render: (text) => (
                        <span className="C-heading size-6 mb-0">{text}</span>
                      ),
                    },
                    {
                      title: "Type",
                      dataIndex: "employmentType",
                      key: "employmentType",
                      render: (text) => (
                        <span className="C-heading size-6 mb-0">{text}</span>
                      ),
                    },
                    {
                      title: "Experience",
                      dataIndex: "experienceLevel",
                      key: "experienceLevel",
                      render: (text) => (
                        <span className="C-heading size-6 mb-0">{text}</span>
                      ),
                    },
                    {
                      title: "Salary",
                      dataIndex: "salaryRange",
                      key: "salaryRange",
                      render: (text) => (
                        <span className="C-heading size-6 mb-0">{text}</span>
                      ),
                    },
                    {
                      title: "Status",
                      dataIndex: "isActive",
                      key: "isActive",
                      render: (isActive) => (
                        <Tag color={isActive ? "green" : "red"}>
                          {isActive ? "Active" : "Inactive"}
                        </Tag>
                      ),
                    },
                  ]}
                  dataSource={company.postedJobs}
                  rowKey="jobId"
                  pagination={false}
                  size="small"
                />
              ) : (
                <p className="C-heading size-6 mb-0 text-muted">
                  No jobs posted yet
                </p>
              )}
            </div>

            <div className="mb-3 p-3" style={sectionCardStyle}>
              <p className="C-heading size-xs mb-2 text-muted bold">Social Links</p>
              <div className="row">
                <div className="col-6 mb-2">
                  <p className="C-heading size-xs mb-1 text-muted">Facebook</p>
                  <p className="C-heading size-6 mb-0">
                    {company.socialLinks?.find(
                      (link) => String(link?.platform || "").toLowerCase() === "facebook"
                    )?.url ? (
                      <a
                        href={
                          company.socialLinks.find(
                            (link) =>
                              String(link?.platform || "").toLowerCase() === "facebook"
                          )?.url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {
                          company.socialLinks.find(
                            (link) =>
                              String(link?.platform || "").toLowerCase() === "facebook"
                          )?.url
                        }
                      </a>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div className="col-6 mb-2">
                  <p className="C-heading size-xs mb-1 text-muted">Instagram</p>
                  <p className="C-heading size-6 mb-0">
                    {company.socialLinks?.find(
                      (link) => String(link?.platform || "").toLowerCase() === "instagram"
                    )?.url ? (
                      <a
                        href={
                          company.socialLinks.find(
                            (link) =>
                              String(link?.platform || "").toLowerCase() === "instagram"
                          )?.url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {
                          company.socialLinks.find(
                            (link) =>
                              String(link?.platform || "").toLowerCase() === "instagram"
                          )?.url
                        }
                      </a>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-3 p-3" style={sectionCardStyle}>
              <p className="C-heading size-xs mb-2 text-muted bold">Categories</p>
              {normalizedCategories.length > 0 ? (
                normalizedCategories.map((category, index) => (
                  <div
                    key={index}
                    className={index === normalizedCategories.length - 1 ? "" : "mb-3 pb-3"}
                    style={
                      index === normalizedCategories.length - 1
                        ? {}
                        : { borderBottom: "1px solid #f0f0f0" }
                    }
                  >
                    <p className="C-heading size-6 mb-1 semiBold">{valueOrDash(category.name)}</p>
                    <p className="C-heading size-6 mb-1">
                      {valueOrDash(category.description)}
                    </p>
                    {category.subCategories?.length > 0 ? (
                      <p className="C-heading size-6 mb-0 text-muted">
                        {category.subCategories
                          .map((subCat) => subCat?.name)
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="C-heading size-6 mb-0 text-muted">No categories available</p>
              )}
            </div>

            <div className="p-3" style={sectionCardStyle}>
              <p className="C-heading size-xs mb-2 text-muted bold">Timestamps</p>
              <div className="row">
                <div className="col-6 mb-0">
                  <p className="C-heading size-xs mb-1 text-muted">Created At</p>
                  <p className="C-heading size-6 mb-0">{valueOrDash(company.createdAt)}</p>
                </div>
                <div className="col-6 mb-0">
                  <p className="C-heading size-xs mb-1 text-muted">Updated At</p>
                  <p className="C-heading size-6 mb-0">{valueOrDash(company.updatedAt)}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
});

CompanyDetailsModal.displayName = "CompanyDetailsModal";

export default CompanyDetailsModal;
