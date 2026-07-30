"use client";

import React, { useCallback, useMemo, memo } from "react";
import { Table, Dropdown, Space } from "antd";
import Link from "next/link";
import Icon from "@/components/Icon";
import { ROUTES } from "@/constants/routes";
import {
  getHiringStatus,
  getHiringStatusLabel,
  isJobInHistory,
  JOB_LIST_VIEW,
} from "../../constants/jobHiringStatuses";
import "./JobTable.scss";

const getJobId = (record) =>
  record?.id ?? record?.jobId ?? record?.job_id ?? null;

const getJobDetailsHref = (record, tab) => {
  const id = getJobId(record);
  if (id == null) return ROUTES.PRIVATE.JOB;
  const base = `${ROUTES.PRIVATE.JOB}/${id}`;
  return tab === "candidates" ? `${base}?tab=candidates` : base;
};

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
    listView = JOB_LIST_VIEW.ACTIVE,
  }) => {
    const canView = Boolean(permissions.view);
    const canEdit = Boolean(permissions.edit);
    const canApprove = Boolean(permissions.approve);
    const canDelete = Boolean(permissions.delete);

    const renderJobTitle = useCallback((text, record) => {
      const hiringStatus = getHiringStatus(record);
      const inHistory = isJobInHistory(record);
      const statusLabel = inHistory
        ? getHiringStatusLabel(hiringStatus)
        : record.isActive !== false
          ? "Active"
          : "Inactive";
      const statusClass = inHistory
        ? hiringStatus === "filled"
          ? "is-filled"
          : "is-closed"
        : record.isActive !== false
          ? "is-active"
          : "is-inactive";
      const metaParts = [
        record.employmentType,
        record.workMode,
        record.experienceRequired,
      ].filter(Boolean);
      const href = getJobDetailsHref(record);
      const hasId = getJobId(record) != null;

      return (
        <div className="job-table-title">
          <div className="job-table-title__row">
            {hasId ? (
              <Link
                href={href}
                className="job-table-title__name is-link"
                title={text || "N/A"}
              >
                {text || "N/A"}
              </Link>
            ) : (
              <span className="job-table-title__name" title={text || "N/A"}>
                {text || "N/A"}
              </span>
            )}
            <span className={`job-table-title__status ${statusClass}`}>
              {statusLabel}
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
      const initials = String(
        postedBy.companyShortName || postedBy.companyName || "CO"
      )
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 2)
        .toUpperCase() || "CO";
      return (
        <div className="job-table-company">
          <div className="job-table-company__logo" aria-hidden>
            {initials}
          </div>
          <div className="job-table-company__meta">
            <span className="job-table-company__name">
              {postedBy.companyName || "N/A"}
            </span>
            {postedBy.companyShortName ? (
              <span className="job-table-company__short">
                {postedBy.companyShortName}
              </span>
            ) : null}
          </div>
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

    const renderPeopleApplied = useCallback((count, record) => {
      const appliedCount = count || 0;
      const id = getJobId(record);
      if (id == null) {
        return <span className="C-heading size-6 mb-0">{appliedCount}</span>;
      }
      return (
        <Link
          href={getJobDetailsHref(record, "candidates")}
          className="job-table-applicants-link"
        >
          {appliedCount}
        </Link>
      );
    }, []);

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
          if (
            listView !== JOB_LIST_VIEW.HISTORY &&
            !isJobInHistory(record)
          ) {
            items.push({
              key: "close_job",
              label: (
                <Space align="center">
                  <Icon name="work_off" size="small" />
                  <span className="C-heading size-xs mb-0 semiBold">
                    Close Position
                  </span>
                </Space>
              ),
            });
          }
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
      [canView, canEdit, canApprove, canDelete, listView]
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
          width: 200,
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
