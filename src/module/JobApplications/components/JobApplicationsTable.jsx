"use client";

import React, { memo, useCallback, useMemo, useState } from "react";
import { Table, Select, Space, Modal, Input, Dropdown, DatePicker } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import Icon from "@/components/Icon";
import { ROUTES } from "@/constants/routes";
import {
  APPLICATION_STATUS_FILTERS,
  getStatusLabel,
  INTERVIEW_MODES,
} from "@/module/Job/constants/applicationStatuses";
import {
  canCandidateRespond,
  CANDIDATE_RESPONSE,
} from "../constants/mockMyApplications";
import "@/module/Job/components/JobTable/JobTable.scss";
import "@/module/Job/components/JobManagementDetails/JobManagementDetails.scss";
import "./JobApplications.scss";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const getJobDetailsHref = (record) => {
  const id = record?.jobId ?? record?.id;
  if (id == null) return ROUTES.PUBLIC.JOBS;
  return `${ROUTES.PUBLIC.JOBS}/${id}?from=job-applications`;
};

const getCompanyInitials = (shortName, name) =>
  String(shortName || name || "CO")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase() || "CO";

const ACTION_DELETE = "delete";

const JobApplicationsTable = memo(({
  applications,
  loading,
  onRespond,
  onDelete,
}) => {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [remarks, setRemarks] = useState("");

  const filterOptions = useMemo(
    () =>
      APPLICATION_STATUS_FILTERS.map((f) => ({
        value: f.key,
        label: f.label,
      })),
    []
  );

  const filtered = useMemo(() => {
    let list = [...(applications || [])];

    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (dateRange?.[0] && dateRange?.[1]) {
      const start = dateRange[0].startOf("day");
      const end = dateRange[1].endOf("day");
      list = list.filter((a) => {
        if (!a.appliedDate) return false;
        const d = dayjs(a.appliedDate);
        if (!d.isValid()) return false;
        return (
          (d.isAfter(start) || d.isSame(start)) &&
          (d.isBefore(end) || d.isSame(end))
        );
      });
    }

    list.sort((a, b) =>
      String(b.appliedDate || "").localeCompare(String(a.appliedDate || ""))
    );

    return list;
  }, [applications, statusFilter, dateRange]);

  const openAction = useCallback((app, response) => {
    setRemarks("");
    setActionModal({ app, response });
  }, []);

  const confirmAction = useCallback(async () => {
    if (!actionModal?.app) return;
    const id = actionModal.app.id || actionModal.app.applicationId;
    try {
      if (actionModal.response === ACTION_DELETE) {
        await onDelete?.(id, remarks);
      } else {
        await onRespond?.(id, actionModal.response, remarks);
      }
      setActionModal(null);
      setRemarks("");
    } catch {
      // Error toast handled in hook
    }
  }, [actionModal, onDelete, onRespond, remarks]);

  const getMenuItems = useCallback((record) => {
    const items = [
      {
        key: "view_details",
        label: (
          <Space align="center">
            <Icon name="visibility" size="small" />
            <span className="C-heading size-xs mb-0 semiBold">
              View job details
            </span>
          </Space>
        ),
      },
    ];

    // Accept / Reject hidden when company rejected OR user already responded
    if (canCandidateRespond(record)) {
      items.push(
        {
          key: "accept",
          label: (
            <Space align="center">
              <Icon name="check_circle" size="small" />
              <span className="C-heading size-xs mb-0 semiBold">Accept</span>
            </Space>
          ),
        },
        {
          key: "reject",
          label: (
            <Space align="center">
              <Icon name="cancel" size="small" />
              <span className="C-heading size-xs mb-0 semiBold">Reject</span>
            </Space>
          ),
        }
      );
    }

    items.push({
      key: "delete",
      danger: true,
      label: (
        <Space align="center">
          <Icon name="delete" size="small" />
          <span className="C-heading size-xs mb-0 semiBold">Delete</span>
        </Space>
      ),
    });

    return items;
  }, []);

  const handleMenuClick = useCallback(
    (menuInfo, record) => {
      const { key } = menuInfo;
      if (key === "view_details") {
        router.push(getJobDetailsHref(record));
        return;
      }
      if (key === "accept") {
        openAction(record, CANDIDATE_RESPONSE.ACCEPTED);
        return;
      }
      if (key === "reject") {
        openAction(record, CANDIDATE_RESPONSE.REJECTED);
        return;
      }
      if (key === "delete") {
        openAction(record, ACTION_DELETE);
      }
    },
    [openAction, router]
  );

  const columns = useMemo(
    () => [
      {
        title: "Job",
        key: "job",
        width: 280,
        render: (_, record) => {
          const href = getJobDetailsHref(record);
          return (
            <div className="job-table-title">
              <div className="job-table-title__row">
                <Link
                  href={href}
                  className="job-table-title__name is-link"
                  title={record.jobTitle || "N/A"}
                >
                  {record.jobTitle || "N/A"}
                </Link>
              </div>
              <div className="job-table-title__meta">
                {[
                  record.employmentType,
                  record.workMode,
                  record.experienceRequired,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
          );
        },
      },
      {
        title: "Company",
        dataIndex: "companyName",
        key: "companyName",
        width: 200,
        render: (value, record) => (
          <div className="job-table-company">
            <div className="job-table-company__logo" aria-hidden>
              {getCompanyInitials(record.companyShortName, value)}
            </div>
            <div className="job-table-company__meta">
              <span className="job-table-company__name">
                {value || "N/A"}
              </span>
              {record.companyShortName ? (
                <span className="job-table-company__short">
                  {record.companyShortName}
                </span>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        title: "Applied",
        dataIndex: "appliedDate",
        key: "appliedDate",
        width: 120,
        defaultSortOrder: "descend",
        render: (v) => (
          <span className="C-heading size-6 mb-0">{v || "N/A"}</span>
        ),
        sorter: (a, b) =>
          String(a.appliedDate || "").localeCompare(
            String(b.appliedDate || "")
          ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 150,
        render: (status) => (
          <span
            className={`applicant-status-pill applicant-status-pill--${
              status || "applied"
            }`}
          >
            {getStatusLabel(status)}
          </span>
        ),
      },
      {
        title: "Interview",
        key: "interview",
        width: 200,
        render: (_, record) => {
          if (!record.interview?.date) {
            return <span className="C-heading size-6 mb-0 text-muted">—</span>;
          }
          const mode =
            INTERVIEW_MODES.find((m) => m.value === record.interview.mode)
              ?.label || record.interview.mode;
          return (
            <div className="job-applications__interview">
              <div className="job-applications__interview-row">
                <Icon name="calendar_month" size="extra-small" />
                <span>
                  {record.interview.date}
                  {record.interview.time ? ` · ${record.interview.time}` : ""}
                </span>
              </div>
              {mode ? (
                <div className="job-applications__interview-row is-mode">
                  <Icon name="videocam" size="extra-small" />
                  <span>{mode}</span>
                </div>
              ) : null}
            </div>
          );
        },
      },
      {
        title: "Action",
        key: "action",
        width: 70,
        fixed: "right",
        render: (_, record) => {
          const items = getMenuItems(record);
          if (!items.length) return null;
          return (
            <Dropdown
              menu={{
                items,
                onClick: (menuInfo) => handleMenuClick(menuInfo, record),
              }}
              trigger={["hover", "click"]}
              placement="bottomRight"
            >
              <button
                type="button"
                className="C-settingButton is-clean small"
                onClick={(e) => e.stopPropagation()}
                aria-label="Application actions"
              >
                <Icon name="more_vert" />
              </button>
            </Dropdown>
          );
        },
      },
    ],
    [getMenuItems, handleMenuClick]
  );

  const isAccept = actionModal?.response === CANDIDATE_RESPONSE.ACCEPTED;
  const isDelete = actionModal?.response === ACTION_DELETE;

  const modalTitle = isAccept
    ? "Accept application"
    : isDelete
      ? "Delete application"
      : "Reject application";

  const modalOkText = isAccept ? "Accept" : isDelete ? "Reject & delete" : "Reject";

  const modalDescription = isAccept
    ? `Confirm that you want to accept “${actionModal?.app?.jobTitle}” at the current stage (${getStatusLabel(actionModal?.app?.status)}).`
    : isDelete
      ? `This will reject “${actionModal?.app?.jobTitle}” and remove it from your applications list.`
      : `Confirm that you want to reject / withdraw “${actionModal?.app?.jobTitle}”. You can do this at any application stage.`;

  return (
    <div className="job-applications">
      <div className="job-applications__toolbar mb-3">
        <div className="C-heading size-xs text-muted mb-0">
          {filtered.length} application{filtered.length === 1 ? "" : "s"}
        </div>
        <Space wrap size={10}>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={filterOptions}
            style={{ minWidth: 180 }}
            placeholder="Filter by status"
          />
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            allowClear
            placeholder={["Applied from", "Applied to"]}
          />
        </Space>
      </div>

      <Table
        className="job-table"
        rowKey={(r) => r.id || r.applicationId}
        loading={loading}
        columns={columns}
        dataSource={filtered}
        scroll={{ x: 1100 }}
        pagination={{
          hideOnSinglePage: true,
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} applications`,
        }}
        locale={{
          emptyText: "You have not applied to any jobs yet.",
        }}
      />

      <Modal
        open={Boolean(actionModal)}
        title={
          <span className="C-heading size-5 semiBold mb-0">{modalTitle}</span>
        }
        onCancel={() => setActionModal(null)}
        onOk={confirmAction}
        okText={modalOkText}
        okButtonProps={{
          danger: !isAccept,
          className: "C-button is-filled small",
        }}
        cancelButtonProps={{ className: "C-button is-outlined small" }}
        destroyOnClose
      >
        <p className="C-heading size-xs text-muted mb-3">{modalDescription}</p>
        <label className="C-heading size-xs semiBold mb-1 d-block">
          Remarks (optional)
        </label>
        <TextArea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder={
            isAccept
              ? "e.g. Looking forward to the next steps"
              : "e.g. Not able to continue at this time"
          }
        />
      </Modal>
    </div>
  );
});

JobApplicationsTable.displayName = "JobApplicationsTable";

export default JobApplicationsTable;
