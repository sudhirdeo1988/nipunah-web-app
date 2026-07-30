"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Table, Space, Dropdown, Select } from "antd";
import Icon from "@/components/Icon";
import {
  APPLICATION_STATUS_FILTERS,
  getStatusLabel,
} from "../../constants/applicationStatuses";
import { useJobApplicants } from "../../hooks/useJobApplicants";
import CandidateDetailsModal from "./CandidateDetailsModal";
import "../JobTable/JobTable.scss";

const AppliedCandidatesTab = memo(({ jobId }) => {
  const {
    applicants,
    filteredApplicants,
    loading,
    statusFilter,
    setStatusFilter,
    statusCounts,
    scheduleInterview,
    rejectApplicant,
    updateStatus,
  } = useJobApplicants(jobId);

  const [viewCandidateId, setViewCandidateId] = useState(null);

  const viewCandidate = useMemo(
    () => applicants.find((a) => a.id === viewCandidateId) || null,
    [applicants, viewCandidateId]
  );

  useEffect(() => {
    if (viewCandidateId && !viewCandidate) {
      setViewCandidateId(null);
    }
  }, [viewCandidateId, viewCandidate]);

  const filterOptions = useMemo(
    () =>
      APPLICATION_STATUS_FILTERS.map((f) => ({
        value: f.key,
        label: `${f.label}${
          statusCounts[f.key] != null ? ` (${statusCounts[f.key]})` : ""
        }`,
      })),
    [statusCounts]
  );

  const getMenuItems = useCallback(() => {
    return [
      {
        key: "view",
        label: (
          <Space align="center">
            <Icon name="visibility" size="small" />
            <span className="C-heading size-xs mb-0 semiBold">
              View / manage
            </span>
          </Space>
        ),
      },
    ];
  }, []);

  const handleAction = useCallback((key, record) => {
    if (key === "view") {
      setViewCandidateId(record.id);
    }
  }, []);

  const columns = useMemo(
    () => [
      {
        title: "Candidate",
        dataIndex: "name",
        key: "name",
        width: 260,
        render: (name, record) => (
          <div className="job-table-title">
            <div className="job-table-title__row">
              <button
                type="button"
                className="job-table-title__name is-link"
                title={name || "N/A"}
                onClick={() => setViewCandidateId(record.id)}
              >
                {name || "N/A"}
              </button>
            </div>
            <div className="job-table-title__meta" title={record.email}>
              <span className="job-table-title__chip">{record.email}</span>
            </div>
          </div>
        ),
        sorter: (a, b) =>
          String(a.name || "").localeCompare(String(b.name || "")),
      },
      {
        title: "Experience",
        dataIndex: "experience",
        key: "experience",
        width: 120,
        render: (value) => (
          <span className="C-heading size-6 mb-0">{value || "N/A"}</span>
        ),
      },
      {
        title: "Applied",
        dataIndex: "appliedDate",
        key: "appliedDate",
        width: 120,
        render: (value) => (
          <span className="C-heading size-6 mb-0">{value || "N/A"}</span>
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
        width: 160,
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
        width: 150,
        render: (_, record) => {
          if (!record.interview?.date) {
            return <span className="C-heading size-6 mb-0 text-muted">—</span>;
          }
          return (
            <div className="job-table-title">
              <div className="job-table-title__row">
                <span className="C-heading size-6 mb-0">
                  {record.interview.date}
                </span>
              </div>
              {record.interview.time ? (
                <div className="job-table-title__meta">
                  <span className="job-table-title__chip">
                    {record.interview.time}
                  </span>
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
        render: (_, record) => (
          <Dropdown
            menu={{
              items: getMenuItems(record),
              onClick: ({ key }) => handleAction(key, record),
            }}
            trigger={["hover"]}
            placement="bottomRight"
          >
            <button
              type="button"
              className="C-settingButton is-clean small"
              onClick={(e) => e.stopPropagation()}
            >
              <Icon name="more_vert" />
            </button>
          </Dropdown>
        ),
      },
    ],
    [getMenuItems, handleAction]
  );

  return (
    <div className="applied-candidates-tab">
      <div className="applied-candidates-tab__toolbar mb-3">
        <div className="C-heading size-xss text-muted mb-0">
          {statusCounts.all || 0} total applicant
          {(statusCounts.all || 0) === 1 ? "" : "s"}
        </div>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={filterOptions}
          style={{ minWidth: 220 }}
          placeholder="Filter by status"
        />
      </div>

      <Table
        className="job-table"
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={filteredApplicants}
        scroll={{ x: 900 }}
        pagination={{
          hideOnSinglePage: true,
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} candidates`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
      />

      <CandidateDetailsModal
        open={Boolean(viewCandidate)}
        candidate={viewCandidate}
        onCancel={() => setViewCandidateId(null)}
        onScheduleInterview={(c, interview, remarks) =>
          scheduleInterview(c, interview, remarks)
        }
        onReject={(c, remarks) => rejectApplicant(c, remarks)}
        onUpdateStatus={(c, status, remarks) =>
          updateStatus(c, status, remarks)
        }
      />
    </div>
  );
});

AppliedCandidatesTab.displayName = "AppliedCandidatesTab";

export default AppliedCandidatesTab;
