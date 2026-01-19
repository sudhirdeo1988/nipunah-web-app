"use client";

import React, { memo } from "react";
import { Modal, Table, Tag } from "antd";

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
  return (
    <Modal
      title={
        <span className="C-heaidng size-5 mb-0 bold">Company Details</span>
      }
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      width={1000}
      centered
    >
      <div className="py-3">
        {company && (
          <div className="row">
            {/* Basic Information */}
            <div className="col-12 mb-4">
              <h5 className="C-heading size-5 mb-3 bold">Basic Information</h5>
              <div className="row">
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">
                    Company Name:
                  </p>
                  <p className="C-heading size-6 mb-0 bold">{company.name}</p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">
                    Short Name:
                  </p>
                  <p className="C-heading size-6 mb-0">{company.shortName}</p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">Industry:</p>
                  <p className="C-heading size-6 mb-0">{company.industry}</p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">
                    Founded Year:
                  </p>
                  <p className="C-heading size-6 mb-0">{company.foundYear}</p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">
                    Employee Count:
                  </p>
                  <p className="C-heading size-6 mb-0">
                    {company.employeeCount || company.employees_count || "N/A"}
                  </p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">Turnover:</p>
                  <p className="C-heading size-6 mb-0">
                    ${company.turnOver?.toLocaleString()}
                  </p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">Is MNC:</p>
                  <p className="C-heading size-6 mb-0">
                    <Tag color={company.isMnc ? "green" : "default"}>
                      {company.isMnc ? "Yes" : "No"}
                    </Tag>
                  </p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">
                    Subscription Plan:
                  </p>
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
                      {company.subscriptionPlan?.charAt(0).toUpperCase() +
                        company.subscriptionPlan?.slice(1)}
                    </Tag>
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="col-12 mb-4">
              <h5 className="C-heading size-5 mb-3 bold">
                Contact Information
              </h5>
              <div className="row">
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">Email:</p>
                  <p className="C-heading size-6 mb-0">
                    {company.contactEmail}
                  </p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">Phone:</p>
                  <p className="C-heading size-6 mb-0">
                    {company.contactNumber}
                  </p>
                </div>
                <div className="col-12 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">Website:</p>
                  <p className="C-heading size-6 mb-0">
                    <a
                      href={company.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {company.websiteUrl}
                    </a>
                  </p>
                </div>
                <div className="col-12 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">
                    Description:
                  </p>
                  <p className="C-heading size-6 mb-0">{company.description}</p>
                </div>
              </div>
            </div>

            {/* Locations */}
            <div className="col-12 mb-4">
              <h5 className="C-heading size-5 mb-3 bold">Locations</h5>
              {company.locations?.map((location, index) => (
                <div key={index} className="bg-light p-3 rounded mb-2">
                  <div className="row">
                    <div className="col-4">
                      <p className="C-heading size-xs mb-1 text-muted">City:</p>
                      <p className="C-heading size-6 mb-0">{location.city}</p>
                    </div>
                    <div className="col-4">
                      <p className="C-heading size-xs mb-1 text-muted">
                        Country:
                      </p>
                      <p className="C-heading size-6 mb-0">
                        {location.country}
                      </p>
                    </div>
                    <div className="col-4">
                      <p className="C-heading size-xs mb-1 text-muted">
                        Primary:
                      </p>
                      <p className="C-heading size-6 mb-0">
                        <Tag
                          color={
                            location.isPrimaryLocation ? "green" : "default"
                          }
                        >
                          {location.isPrimaryLocation ? "Yes" : "No"}
                        </Tag>
                      </p>
                    </div>
                    <div className="col-12 mt-2">
                      <p className="C-heading size-xs mb-1 text-muted">
                        Address:
                      </p>
                      <p className="C-heading size-6 mb-0">
                        {location.address}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Posted Jobs */}
            <div className="col-12 mb-4">
              <h5 className="C-heading size-5 mb-3 bold">
                Posted Jobs ({company.postedJobs?.length || 0})
              </h5>
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

            {/* Social Links */}
            <div className="col-12 mb-4">
              <h5 className="C-heading size-5 mb-3 bold">Social Links</h5>
              {company.socialLinks?.map((link, index) => (
                <div key={index} className="mb-2">
                  <span className="C-heading size-xs mb-1 text-muted">
                    {link.platform}:
                  </span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2"
                  >
                    {link.url}
                  </a>
                </div>
              ))}
            </div>

            {/* Categories */}
            <div className="col-12 mb-4">
              <h5 className="C-heading size-5 mb-3 bold">Categories</h5>
              {company.categories?.map((category, index) => (
                <div key={index} className="bg-light p-3 rounded mb-2">
                  <div className="row">
                    <div className="col-6">
                      <p className="C-heading size-xs mb-1 text-muted">
                        Category:
                      </p>
                      <p className="C-heading size-6 mb-0 bold">
                        {category.name}
                      </p>
                    </div>
                    <div className="col-6">
                      <p className="C-heading size-xs mb-1 text-muted">
                        Description:
                      </p>
                      <p className="C-heading size-6 mb-0">
                        {category.description}
                      </p>
                    </div>
                    {category.subCategories?.length > 0 && (
                      <div className="col-12 mt-2">
                        <p className="C-heading size-xs mb-1 text-muted">
                          Sub-categories:
                        </p>
                        {category.subCategories.map((subCat, subIndex) => (
                          <div key={subIndex} className="ml-3">
                            <p className="C-heading size-6 mb-0">
                              • {subCat.name} - {subCat.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Timestamps */}
            <div className="col-12">
              <h5 className="C-heading size-5 mb-3 bold">Timestamps</h5>
              <div className="row">
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">
                    Created At:
                  </p>
                  <p className="C-heading size-6 mb-0">{company.createdAt}</p>
                </div>
                <div className="col-6 mb-3">
                  <p className="C-heading size-xs mb-1 text-muted">
                    Updated At:
                  </p>
                  <p className="C-heading size-6 mb-0">{company.updatedAt}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
});

CompanyDetailsModal.displayName = "CompanyDetailsModal";

export default CompanyDetailsModal;
