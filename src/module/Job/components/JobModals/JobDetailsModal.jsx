"use client";

import React, { memo, useMemo } from "react";
import { Modal, Descriptions, Tag, Space, Divider } from "antd";
import Icon from "@/components/Icon";
import { find as _find } from "lodash-es";
import CountryDetails from "@/utilities/CountryDetails.json";
import dayjs from "dayjs";
import {
  JOB_STATUS_COLORS,
  EXPERIENCE_COLORS,
} from "../../constants/jobConstants";

/**
 * JobDetailsModal Component
 *
 * Displays comprehensive job information in a modal dialog
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Object} props.job - Job object to display
 * @param {Function} props.onCancel - Handler for modal close
 * @returns {JSX.Element} The JobDetailsModal component
 */
const JobDetailsModal = memo(({ isOpen, job, onCancel }) => {
  if (!job) return null;

  /**
   * Get country name from country code
   */
  const getCountryName = useMemo(() => {
    const locationObj = job.locationObj || (typeof job.location === "object" ? job.location : {}) || {};
    const countryCode = locationObj.countryCode || locationObj.country || "";
    
    if (!countryCode) return null;
    
    // If it's already a country name (length > 2), return as is
    if (countryCode.length > 2) {
      return countryCode;
    }
    
    // Find country by code
    const countryData = _find(
      CountryDetails,
      (c) => c.countryCode === countryCode
    );
    
    return countryData ? countryData.countryName : countryCode;
  }, [job]);

  /**
   * Format location string with country name
   */
  const formatLocation = useMemo(() => {
    const locationObj = job.locationObj || (typeof job.location === "object" ? job.location : {}) || {};
    const city = locationObj.city || "";
    const state = locationObj.state || "";
    const pincode = locationObj.pinCode || locationObj.pincode || "";
    const countryName = getCountryName;
    
    const parts = [];
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (pincode) parts.push(pincode);
    if (countryName) parts.push(countryName);
    
    return parts.length > 0 ? parts.join(", ") : job.location || "N/A";
  }, [job, getCountryName]);

  /**
   * Format date from createdOn or postedOn
   */
  const formatPostedOnDate = useMemo(() => {
    const dateValue = job.createdOn || job.created_on || job.postedOn || job.posted_on || "";
    if (!dateValue) return "N/A";
    
    try {
      // If it's a timestamp (number)
      if (typeof dateValue === "number") {
        return dayjs(dateValue).format("YYYY-MM-DD");
      }
      
      // If it's a date string
      if (typeof dateValue === "string") {
        const parsed = dayjs(dateValue);
        if (parsed.isValid()) {
          return parsed.format("YYYY-MM-DD");
        }
        // If already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return dateValue;
        }
      }
      
      return "N/A";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  }, [job]);

  /**
   * Renders skills as tags
   */
  const renderSkills = (skills) => {
    return (
      <Space wrap>
        {skills.map((skill, index) => (
          <Tag key={index} color="blue">
            {skill}
          </Tag>
        ))}
      </Space>
    );
  };

  /**
   * Gets status color based on job status
   */
  const getStatusColor = (status) => {
    return JOB_STATUS_COLORS[status] || "default";
  };

  /**
   * Gets experience color based on experience level
   */
  const getExperienceColor = (experience) => {
    const years = experience.match(/\d+/)?.[0];
    const colorKey = years
      ? parseInt(years) <= 1
        ? "0-1 years"
        : parseInt(years) <= 3
        ? "1-3 years"
        : parseInt(years) <= 5
        ? "3-5 years"
        : parseInt(years) <= 8
        ? "5-8 years"
        : "8+ years"
      : "default";
    return EXPERIENCE_COLORS[colorKey] || "default";
  };

  return (
    <Modal
      title={
        <div className="d-flex align-items-center">
          <Icon name="work" className="me-2" />
          <span className="C-heading size-5 semiBold mb-0">Job Details</span>
        </div>
      }
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      width={800}
      className="job-details-modal"
    >
      <div className="job-details-content">
        {/* Job Header */}
        <div className="mb-4">
          <h3 className="C-heading size-4 semiBold mb-2">{job.title || "N/A"}</h3>
          <div className="d-flex align-items-center gap-3">
            <Tag color={getStatusColor(job.status)} className="mb-0">
              {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : "N/A"}
            </Tag>
            <Tag color="blue" className="mb-0">
              {job.employmentType || "N/A"}
            </Tag>
            <span className="C-heading size-xs text-muted mb-0">
              Job ID: {job.jobId || job.id || "N/A"}
            </span>
          </div>
        </div>

        <Divider />

        {/* Job Information */}
        <Descriptions column={2} size="small" bordered className="mb-4">
          <Descriptions.Item label="Company" span={2}>
            <div>
              <div className="C-heading size-6 semiBold mb-1">
                {job.postedBy?.companyName || "N/A"}
              </div>
              <div className="C-heading size-xs text-muted mb-0">
                {job.postedBy?.companyShortName || ""}
              </div>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Experience Required">
            {job.experienceRequired ? (
              <Tag color={getExperienceColor(job.experienceRequired)}>
                {job.experienceRequired}
              </Tag>
            ) : (
              <span className="C-heading size-6 mb-0">N/A</span>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Salary Range">
            <span
              className="C-heading size-6 semiBold"
              style={{ color: "#52c41a" }}
            >
              {job.salaryRange || "N/A"}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Location">
            <div className="d-flex align-items-center">
              <Icon name="location_on" size="small" className="me-1" />
              <span className="C-heading size-6 mb-0">{formatLocation}</span>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="People Applied">
            <span
              className="C-heading size-6 semiBold"
              style={{ color: "#1890ff" }}
            >
              {job.peopleApplied || 0}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Posted On">
            <span className="C-heading size-6 mb-0">{formatPostedOnDate}</span>
          </Descriptions.Item>

          <Descriptions.Item label="Updated On">
            <span className="C-heading size-6 mb-0">
              {(() => {
                const dateValue = job.updatedOn || job.updated_on || "";
                if (!dateValue) return "N/A";
                try {
                  if (typeof dateValue === "number") {
                    return dayjs(dateValue).format("YYYY-MM-DD");
                  }
                  if (typeof dateValue === "string") {
                    const parsed = dayjs(dateValue);
                    if (parsed.isValid()) {
                      return parsed.format("YYYY-MM-DD");
                    }
                    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                      return dateValue;
                    }
                  }
                  return "N/A";
                } catch (error) {
                  return "N/A";
                }
              })()}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Application Deadline">
            <span className="C-heading size-6 mb-0">
              {job.applicationDeadline || "N/A"}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Status">
            <Tag color={job.isActive ? "success" : "default"}>
              {job.isActive ? "Active" : "Inactive"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        {/* Job Description */}
        <div className="mb-4">
          <h4 className="C-heading size-6 semiBold mb-2">Description</h4>
          <p className="C-heading size-xs mb-0 text-muted">{job.description || "No description available"}</p>
        </div>

        {/* Skills Required */}
        <div className="mb-4">
          <h4 className="C-heading size-6 semiBold mb-2">Skills Required</h4>
          {job.skillsRequired && job.skillsRequired.length > 0 ? (
            renderSkills(job.skillsRequired)
          ) : (
            <span className="C-heading size-xs text-muted">No skills specified</span>
          )}
        </div>

        {/* Additional Information */}
        <div className="additional-info">
          <h4 className="C-heading size-6 semiBold mb-2">
            Additional Information
          </h4>
          <div className="row">
            <div className="col-6">
              <div className="info-item mb-2">
                <span className="C-heading size-xs text-muted">
                  Employment Type:
                </span>
                <span className="C-heading size-xs semiBold ms-2">
                  {job.employmentType || "N/A"}
                </span>
              </div>
            </div>
            <div className="col-6">
              <div className="info-item mb-2">
                <span className="C-heading size-xs text-muted">
                  Experience Level:
                </span>
                <span className="C-heading size-xs semiBold ms-2">
                  {job.experienceRequired || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
});

JobDetailsModal.displayName = "JobDetailsModal";

export default JobDetailsModal;
