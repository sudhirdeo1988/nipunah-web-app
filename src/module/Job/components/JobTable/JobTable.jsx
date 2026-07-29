"use client";

import React, { useCallback, useMemo, memo } from "react";
import { Table, Dropdown, Space } from "antd";
import Icon from "@/components/Icon";
import "./JobTable.scss";

/**
 * JobTable Component
 *
 * Title column packs Active, Work Mode, Employment Type, Experience compactly.
 */
const JobTable = memo(
  ({
    jobs,
    rowSelection,
    onMenuClick,
    loading = false,
    pagination: paginationConfig,
    onChange,
    permissions = {},
  }) => {
    const canView = Boolean(permissions.view);
    const canEdit = Boolean(permissions.edit);
    const canApprove = Boolean(permissions.approve);
    const canDelete = Boolean(permissions.delete);

    const renderJobTitle = useCallback((text, record) => {
      const isActive = record.isActive !== false;
      const metaParts = [
        record.employmentType,
        record.workMode,
        record.experienceRequired,
      ].filter(Boolean);

      return (
        <div className="job-table-title">
          <div className="job-table-title__row">
            <span className="job-table-title__name" title={text || "N/A"}>
              {text || "N/A"}
            </span>
            <span
              className={`job-table-title__status ${
                isActive ? "is-active" : "is-inactive"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
          {metaParts.length > 0 ? (
            <div className="job-table-title__meta" title={metaParts.join(" · ")}>
              {metaParts.map((part, index) => (
                <React.Fragment key={`${part}-${index}`}>
                  {index > 0 ? (
                    <span className="job-table-title__sep">·</span>
                  ) : null}
                  <span className="job-table-title__chip">{part}</span>
                </React.Fragment>
              ))}
            </div>
          ) : null}
        </div>
      );
    }, []);

    const renderPostedBy = useCallback((postedBy) => {
      if (!postedBy) return <span className="C-heading size-6 mb-0">N/A</span>;
      return (
        <div>
          <span className="C-heading size-6 mb-0 semiBold">
            {postedBy.companyName || "N/A"}
          </span>
          {postedBy.companyShortName ? (
            <div className="C-heading size-xss mb-0 text-muted">
              {postedBy.companyShortName}
            </div>
          ) : null}
        </div>
      );
    }, []);

    const renderLocation = useCallback(
      (location) => (
        <span className="C-heading size-6 mb-0">{location || "N/A"}</span>
      ),
      []
    );

    const renderSalary = useCallback((_, record) => {
      if (record.salaryNotDisclosed) {
        return (
          <span className="C-heading size-6 mb-0 text-muted">Not Disclosed</span>
        );
      }
      const salary = record.salaryRange || "";
      if (!salary || salary === " - ") {
        return <span className="C-heading size-6 mb-0">N/A</span>;
      }
      return <span className="C-heading size-6 mb-0">{salary}</span>;
    }, []);

    const renderPostedDate = useCallback(
      (date) => (
        <span className="C-heading size-6 mb-0">{date || "N/A"}</span>
      ),
      []
    );

    const renderPeopleApplied = useCallback(
      (count, record) => {
        const appliedCount = count || 0;
        return (
          <button
            className="C-button is-clean small"
            onClick={() => onMenuClick({ key: "view_applied_users" }, record)}
            style={{
              color: "#1890ff",
              textDecoration: "underline",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            {appliedCount}
          </button>
        );
      },
      [onMenuClick]
    );

    const getActionMenuItems = useCallback(
      (record) => {
        const items = [];
        if (canView) {
          items.push({
            key: "view_details",
            label: (
              <Space align="center">
                <Icon name="visibility" size="small" />
                <span className="C-heading size-xs mb-0 semiBold">
                  View Details
                </span>
              </Space>
            ),
          });
        }
        if (canEdit) {
          items.push({
            key: "edit",
            label: (
              <Space align="center">
                <Icon name="edit" size="small" />
                <span className="C-heading size-xs mb-0 semiBold">Edit</span>
              </Space>
            ),
          });
        }
        if (canApprove && record.status !== "approved") {
          items.push({
            key: "approve",
            label: (
              <Space align="center">
                <Icon name="check_circle" size="small" />
                <span className="C-heading size-xs mb-0 semiBold">Approve</span>
              </Space>
            ),
          });
        }
        if (canDelete) {
          items.push({
            key: "delete",
            label: (
              <Space align="center">
                <Icon name="delete" size="small" />
                <span className="C-heading size-xs mb-0 semiBold">Delete</span>
              </Space>
            ),
          });
        }
        return items;
      },
      [canView, canEdit, canApprove, canDelete]
    );

    const renderAction = useCallback(
      (_, record) => {
        const items = getActionMenuItems(record);
        if (items.length === 0) return null;
        return (
          <Dropdown
            menu={{
              items,
              onClick: (menuInfo) => onMenuClick(menuInfo, record),
            }}
            trigger={["hover"]}
            placement="bottomRight"
          >
            <button
              className="C-settingButton is-clean small"
              onClick={(e) => e.stopPropagation()}
            >
              <Icon name="more_vert" />
            </button>
          </Dropdown>
        );
      },
      [getActionMenuItems, onMenuClick]
    );

    const columns = useMemo(
      () => [
        {
          title: "Title",
          dataIndex: "title",
          key: "title",
          width: 320,
          render: renderJobTitle,
          sorter: (a, b) =>
            String(a.title || "").localeCompare(String(b.title || "")),
          filters: [
            { text: "Active", value: "active" },
            { text: "Inactive", value: "inactive" },
          ],
          onFilter: (value, record) =>
            value === "active"
              ? record.isActive !== false
              : record.isActive === false,
        },
        {
          title: "Company",
          dataIndex: "postedBy",
          key: "postedBy",
          width: 160,
          render: renderPostedBy,
          sorter: (a, b) =>
            (a.postedBy?.companyName || "").localeCompare(
              b.postedBy?.companyName || ""
            ),
        },
        {
          title: "Location",
          dataIndex: "location",
          key: "location",
          width: 160,
          render: renderLocation,
          sorter: (a, b) =>
            String(a.location || "").localeCompare(String(b.location || "")),
        },
        {
          title: "Salary",
          key: "salaryRange",
          width: 140,
          render: renderSalary,
        },
        {
          title: "Posted",
          dataIndex: "jobPostedDate",
          key: "jobPostedDate",
          width: 110,
          render: renderPostedDate,
          sorter: (a, b) =>
            String(a.jobPostedDate || "").localeCompare(
              String(b.jobPostedDate || "")
            ),
        },
        {
          title: "Applicants",
          dataIndex: "peopleApplied",
          key: "peopleApplied",
          width: 100,
          render: renderPeopleApplied,
          sorter: (a, b) => (a.peopleApplied || 0) - (b.peopleApplied || 0),
        },
        {
          title: "Action",
          dataIndex: "action",
          key: "action",
          width: 70,
          fixed: "right",
          render: renderAction,
        },
      ],
      [
        renderJobTitle,
        renderPostedBy,
        renderLocation,
        renderSalary,
        renderPostedDate,
        renderPeopleApplied,
        renderAction,
      ]
    );

    return (
      <Table
        className="job-table"
        columns={columns}
        dataSource={jobs}
        rowKey="id"
        rowSelection={rowSelection}
        pagination={
          paginationConfig
            ? {
                current: paginationConfig.current,
                pageSize: paginationConfig.pageSize,
                total: paginationConfig.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} jobs`,
                pageSizeOptions: ["10", "20", "50", "100"],
              }
            : {
                hideOnSinglePage: true,
                defaultPageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} jobs`,
                pageSizeOptions: ["10", "20", "50", "100"],
              }
        }
        loading={loading}
        onChange={onChange}
        scroll={{ x: 1000 }}
      />
    );
  }
);

JobTable.displayName = "JobTable";

export default JobTable;
