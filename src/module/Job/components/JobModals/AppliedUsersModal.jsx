"use client";

import React, { memo } from "react";
import { Modal, List, Avatar, Space, Tag, Divider } from "antd";
import Icon from "@/components/Icon";

/**
 * AppliedUsersModal Component
 *
 * Displays a list of users who have applied for a specific job
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Object} props.job - Job object containing applied users
 * @param {Function} props.onCancel - Handler for modal close
 * @returns {JSX.Element} The AppliedUsersModal component
 */
const AppliedUsersModal = memo(({ isOpen, job, onCancel }) => {
  if (!job) return null;

  // Mock applied users data - In real app, this would come from API
  const appliedUsers = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1-555-0123",
      appliedDate: "2024-01-20",
      status: "pending", // pending, shortlisted, rejected, hired
      experience: "5 years",
      skills: ["React", "Node.js", "TypeScript"],
      resumeUrl: "/resumes/john-smith.pdf",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1-555-0456",
      appliedDate: "2024-01-19",
      status: "shortlisted",
      experience: "4 years",
      skills: ["React", "JavaScript", "CSS"],
      resumeUrl: "/resumes/sarah-johnson.pdf",
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "mike.wilson@email.com",
      phone: "+1-555-0789",
      appliedDate: "2024-01-18",
      status: "pending",
      experience: "6 years",
      skills: ["React", "Node.js", "AWS", "Docker"],
      resumeUrl: "/resumes/mike-wilson.pdf",
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "+1-555-0321",
      appliedDate: "2024-01-17",
      status: "rejected",
      experience: "2 years",
      skills: ["React", "JavaScript"],
      resumeUrl: "/resumes/emily-davis.pdf",
    },
    {
      id: 5,
      name: "David Brown",
      email: "david.brown@email.com",
      phone: "+1-555-0654",
      appliedDate: "2024-01-16",
      status: "shortlisted",
      experience: "7 years",
      skills: ["React", "Node.js", "TypeScript", "GraphQL"],
      resumeUrl: "/resumes/david-brown.pdf",
    },
  ];

  /**
   * Gets status color based on application status
   */
  const getStatusColor = (status) => {
    const statusColors = {
      pending: "blue",
      shortlisted: "green",
      rejected: "red",
      hired: "purple",
    };
    return statusColors[status] || "default";
  };

  /**
   * Renders skills as tags
   */
  const renderSkills = (skills) => {
    return (
      <Space wrap size="small">
        {skills.map((skill, index) => (
          <Tag key={index} size="small" color="blue">
            {skill}
          </Tag>
        ))}
      </Space>
    );
  };

  /**
   * Renders individual user item
   */
  const renderUserItem = (user) => (
    <List.Item
      key={user.id}
      actions={[
        <button
          key="view-resume"
          className="C-button is-clean small"
          onClick={() => {
            // TODO: Implement resume viewing functionality
            console.log("View resume:", user.resumeUrl);
          }}
        >
          <Space size="small">
            <Icon name="description" size="small" />
            <span className="C-heading size-xs mb-0">Resume</span>
          </Space>
        </button>,
        <button
          key="contact"
          className="C-button is-clean small"
          onClick={() => {
            // TODO: Implement contact functionality
            console.log("Contact user:", user.email);
          }}
        >
          <Space size="small">
            <Icon name="email" size="small" />
            <span className="C-heading size-xs mb-0">Contact</span>
          </Space>
        </button>,
      ]}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            size="large"
            style={{
              backgroundColor: "#1890ff",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
        }
        title={
          <div className="d-flex align-items-center justify-content-between">
            <span className="C-heading size-xs semiBold mb-0">{user.name}</span>
            <Tag color={getStatusColor(user.status)} size="small">
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </Tag>
          </div>
        }
        description={
          <div>
            <div className="mb-2">
              <div className="C-heading size-xss text-muted mb-1">
                <Icon name="email" size="small" className="me-1" />
                {user.email}
              </div>
              <div className="C-heading size-xss text-muted mb-1">
                <Icon name="phone" size="small" className="me-1" />
                {user.phone}
              </div>
              <div className="C-heading size-xss text-muted mb-1">
                <Icon name="work" size="small" className="me-1" />
                {user.experience} experience
              </div>
              <div className="C-heading size-xss text-muted mb-0">
                <Icon name="schedule" size="small" className="me-1" />
                Applied on {user.appliedDate}
              </div>
            </div>
            <div>
              <div className="C-heading size-xss text-muted mb-1">Skills:</div>
              {renderSkills(user.skills)}
            </div>
          </div>
        }
      />
    </List.Item>
  );

  return (
    <Modal
      title={
        <div className="d-flex align-items-center">
          <Icon name="people" className="me-2" />
          <span className="C-heading size-5 semiBold mb-0">
            Applied Users - {job.title}
          </span>
        </div>
      }
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      width={800}
      className="applied-users-modal"
    >
      <div className="applied-users-content">
        {/* Job Information Header */}
        <div className="job-info-header p-3 border rounded mb-4">
          <div className="row">
            <div className="col-8">
              <h4 className="C-heading size-xs semiBold mb-2">{job.title}</h4>
              <div className="C-heading size-xss text-muted mb-1">
                <Icon name="business" size="small" className="me-1" />
                {job.postedBy.companyName}
              </div>
              <div className="C-heading size-xss text-muted mb-0">
                <Icon name="location_on" size="small" className="me-1" />
                {job.location}
              </div>
            </div>
            <div className="col-4 text-right">
              <div className="C-heading size-xs text-muted mb-1">
                Total Applications
              </div>
              <div
                className="C-heading size-4 semiBold"
                style={{ color: "#1890ff" }}
              >
                {appliedUsers.length}
              </div>
            </div>
          </div>
        </div>

        {/* Application Statistics */}
        <div className="application-stats mb-4">
          <div className="row text-center">
            <div className="col-3">
              <div className="stat-item">
                <div className="C-heading size-xs text-muted mb-1">Pending</div>
                <div
                  className="C-heading size-xs semiBold"
                  style={{ color: "#1890ff" }}
                >
                  {appliedUsers.filter((u) => u.status === "pending").length}
                </div>
              </div>
            </div>
            <div className="col-3">
              <div className="stat-item">
                <div className="C-heading size-xs text-muted mb-1">
                  Shortlisted
                </div>
                <div
                  className="C-heading size-xs semiBold"
                  style={{ color: "#52c41a" }}
                >
                  {
                    appliedUsers.filter((u) => u.status === "shortlisted")
                      .length
                  }
                </div>
              </div>
            </div>
            <div className="col-3">
              <div className="stat-item">
                <div className="C-heading size-xs text-muted mb-1">
                  Rejected
                </div>
                <div
                  className="C-heading size-xs semiBold"
                  style={{ color: "#ff4d4f" }}
                >
                  {appliedUsers.filter((u) => u.status === "rejected").length}
                </div>
              </div>
            </div>
            <div className="col-3">
              <div className="stat-item">
                <div className="C-heading size-xs text-muted mb-1">Hired</div>
                <div
                  className="C-heading size-xs semiBold"
                  style={{ color: "#722ed1" }}
                >
                  {appliedUsers.filter((u) => u.status === "hired").length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* Users List */}
        <div className="users-list">
          <List
            dataSource={appliedUsers}
            renderItem={renderUserItem}
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} applicants`,
            }}
          />
        </div>
      </div>
    </Modal>
  );
});

AppliedUsersModal.displayName = "AppliedUsersModal";

export default AppliedUsersModal;
