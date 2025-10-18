"use client";

import React, { memo } from "react";
import { Modal, Descriptions, Tag, Space, Divider } from "antd";
import Icon from "@/components/Icon";
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
          <h3 className="C-heading size-4 semiBold mb-2">{job.title}</h3>
          <div className="d-flex align-items-center gap-3">
            <Tag color={getStatusColor(job.status)} className="mb-0">
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </Tag>
            <Tag color="blue" className="mb-0">
              {job.employmentType}
            </Tag>
            <span className="C-heading size-xs text-muted mb-0">
              Job ID: {job.jobId}
            </span>
          </div>
        </div>

        <Divider />

        {/* Job Information */}
        <Descriptions column={2} size="small" bordered className="mb-4">
          <Descriptions.Item label="Company" span={2}>
            <div>
              <div className="C-heading size-6 semiBold mb-1">
                {job.postedBy.companyName}
              </div>
              <div className="C-heading size-xs text-muted mb-0">
                {job.postedBy.companyShortName}
              </div>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Experience Required">
            <Tag color={getExperienceColor(job.experienceRequired)}>
              {job.experienceRequired}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Salary Range">
            <span
              className="C-heading size-6 semiBold"
              style={{ color: "#52c41a" }}
            >
              {job.salaryRange}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Location">
            <div className="d-flex align-items-center">
              <Icon name="location_on" size="small" className="me-1" />
              <span className="C-heading size-6 mb-0">{job.location}</span>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="People Applied">
            <span
              className="C-heading size-6 semiBold"
              style={{ color: "#1890ff" }}
            >
              {job.peopleApplied}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Posted On">
            <span className="C-heading size-6 mb-0">{job.postedOn}</span>
          </Descriptions.Item>

          <Descriptions.Item label="Updated On">
            <span className="C-heading size-6 mb-0">{job.updatedOn}</span>
          </Descriptions.Item>

          <Descriptions.Item label="Application Deadline">
            <span className="C-heading size-6 mb-0">
              {job.applicationDeadline}
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
          <p className="C-heading size-xs mb-0 text-muted">{job.description}</p>
        </div>

        {/* Skills Required */}
        <div className="mb-4">
          <h4 className="C-heading size-6 semiBold mb-2">Skills Required</h4>
          {renderSkills(job.skillsRequired)}
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
                  {job.employmentType}
                </span>
              </div>
            </div>
            <div className="col-6">
              <div className="info-item mb-2">
                <span className="C-heading size-xs text-muted">
                  Experience Level:
                </span>
                <span className="C-heading size-xs semiBold ms-2">
                  {job.experienceRequired}
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
