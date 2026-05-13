"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Table, Modal, Dropdown, Space, Button, Input, message } from "antd";
import Icon from "@/components/Icon";
import { enquiryService } from "@/utilities/apiServices";
import { useAppSelector } from "@/store/hooks";
import { getIdFromStoredUser } from "@/utilities/sessionUser";
import { useRole } from "@/hooks/useRole";
import { useEffect } from "react";

const { TextArea } = Input;
const ENQUIRIES_CACHE_TTL_MS = 5000;
const enquiriesInFlightByCompany = new Map();
const enquiriesCacheByCompany = new Map();

async function getEnquiriesWithDedupe(companyId, { force = false } = {}) {
  const key = String(companyId);
  const now = Date.now();

  if (!force) {
    const cached = enquiriesCacheByCompany.get(key);
    if (cached && now - cached.timestamp < ENQUIRIES_CACHE_TTL_MS) {
      return cached.data;
    }
  }

  if (enquiriesInFlightByCompany.has(key)) {
    return enquiriesInFlightByCompany.get(key);
  }

  const requestPromise = enquiryService
    .getEnquiries({ companyId: key })
    .then((res) => {
      enquiriesCacheByCompany.set(key, { data: res, timestamp: Date.now() });
      return res;
    })
    .finally(() => {
      enquiriesInFlightByCompany.delete(key);
    });

  enquiriesInFlightByCompany.set(key, requestPromise);
  return requestPromise;
}

function getThreadItems(enquiryDetails) {
  const e = enquiryDetails && typeof enquiryDetails === "object" ? enquiryDetails : {};
  const candidates = [
    e.thread,
    e.messages,
    e.responses,
    e.conversation,
    e.items,
  ];

  const firstArray = candidates.find((c) => Array.isArray(c));
  if (firstArray) return firstArray;

  // Fallback: treat enquiry as single message
  const single =
    e.description || e.body || e.message || e.text || e.content ? [
      {
        from: e.by || e.sender || e.createdBy,
        by: e.by || e.sender || e.createdBy,
        text: e.description || e.body || e.message || e.text || e.content,
        message:
          e.description || e.body || e.message || e.text || e.content,
      },
    ] : [];

  return single;
}

function normalizeName(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val.name || val.username || val.email || "";
  }
  return String(val);
}

function normalizeThreadSender(threadItem) {
  const t = threadItem && typeof threadItem === "object" ? threadItem : {};
  const sender =
    normalizeName(t.from) ||
    normalizeName(t.by) ||
    normalizeName(t.sender) ||
    normalizeName(t.user) ||
    normalizeName(t.createdBy);
  return sender || "User";
}

function normalizeThreadText(threadItem) {
  const t = threadItem && typeof threadItem === "object" ? threadItem : {};
  return (
    t.response ||
    t.responseText ||
    t.message ||
    t.text ||
    t.content ||
    t.description ||
    ""
  );
}

function normalizeEnquiryRecord(item) {
  const e = item && typeof item === "object" ? item : {};
  const replies = Array.isArray(e.replies) ? e.replies : [];
  const thread = [
    ...(e.description
      ? [
          {
            by: normalizeName(e.enquiryFrom) || "User",
            message: e.description,
          },
        ]
      : []),
    ...replies.map((reply) => ({
      by: "Reply",
      message: typeof reply === "string" ? reply : normalizeThreadText(reply),
    })),
  ];

  return {
    ...e,
    id: e.id,
    title: e.title || "—",
    description: e.description || "—",
    byName: normalizeName(e.enquiryFrom) || "User",
    replyCount: replies.length,
    thread,
  };
}

/** Pull a stable id out of the various shapes the upstream may return. */
function getEnquiryFromId(record) {
  const from =
    record?.enquiryFrom ?? record?.enquiry_from ?? record?.from ?? record?.sender;
  if (from === null || from === undefined) return "";
  if (typeof from === "object") {
    return String(from.id ?? from._id ?? from.user_id ?? from.userId ?? "");
  }
  return String(from);
}

const EnquiryListing = ({ permissions = {} }) => {
  const canView = Boolean(permissions.view);
  const canDelete = Boolean(permissions.delete);
  const canRespond = Boolean(permissions.respond);
  const user = useAppSelector((state) => state.user.user);
  const { isUser } = useRole();
  const isUserRole = isUser();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(null);
  const [selectedEnquiryDetails, setSelectedEnquiryDetails] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [responseText, setResponseText] = useState("");

  const companyId = useMemo(() => getIdFromStoredUser(user), [user]);

  const fetchEnquiries = useCallback(async ({ force = false } = {}) => {
    if (companyId == null || companyId === "") return;
    setLoading(true);
    try {
      const res = await getEnquiriesWithDedupe(companyId, { force });
      const list = Array.isArray(res?.data) ? res.data : [];
      setEnquiries(list.map(normalizeEnquiryRecord));
    } catch (err) {
      message.error(err?.message || "Failed to load enquiries");
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const closeModals = useCallback(() => {
    setIsViewModalOpen(false);
    setIsRespondModalOpen(false);
    setResponseText("");
    setSelectedEnquiryId(null);
    setSelectedEnquiryDetails(null);
  }, []);

  const handleView = useCallback(
    (record) => {
      if (!record?.id) return;
      setSelectedEnquiryId(record.id);
      setSelectedEnquiryDetails(record);
      setIsViewModalOpen(true);
    },
    []
  );

  const handleRespond = useCallback(
    (record) => {
      if (!record?.id) return;
      setSelectedEnquiryId(record.id);
      setSelectedEnquiryDetails(record);
      setResponseText("");
      setIsRespondModalOpen(true);
    },
    []
  );

  const handleDelete = useCallback(
    (record) => {
      const id = record?.id;
      if (!id) return;

      Modal.confirm({
        title: "Delete enquiry?",
        content: "This action cannot be undone.",
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          setActionLoading(true);
          try {
            await enquiryService.deleteEnquiry(id);
            setEnquiries((prev) => prev.filter((item) => item.id !== id));
            message.success("Enquiry deleted successfully");
          } catch (err) {
            message.error(err?.message || "Failed to delete enquiry");
          } finally {
            setActionLoading(false);
          }
        },
      });
    },
    []
  );

  const actionMenuItems = useMemo(() => {
    const items = [];
    if (canView) {
      items.push({
        key: "view",
        label: (
          <Space align="center">
            <Icon name="visibility" size="small" />
            <span className="C-heading size-xs mb-0 semiBold">View</span>
          </Space>
        ),
      });
    }
    // Users only see/send their own enquiries; the Respond action is reserved
    // for admin/company who reply to them.
    if (canRespond && !isUserRole) {
      items.push({
        key: "respond",
        label: (
          <Space align="center">
            <Icon name="reply" size="small" />
            <span className="C-heading size-xs mb-0 semiBold">Respond</span>
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
  }, [canView, canRespond, canDelete, isUserRole]);

  const handleMenuClick = useCallback(
    async (menuInfo, record) => {
      const key = menuInfo?.key;
      if (key === "view") return handleView(record);
      if (key === "respond") return handleRespond(record);
      if (key === "delete") return handleDelete(record);
    },
    [handleDelete, handleRespond, handleView]
  );

  const columns = useMemo(
    () => {
      const titleCol = {
        title: "Title",
        dataIndex: "title",
        key: "title",
        width: isUserRole ? "25%" : "25%",
        render: (v) => <span className="C-heading size-xs">{v || "—"}</span>,
      };
      const descriptionCol = {
        title: "Description",
        dataIndex: "description",
        key: "description",
        width: isUserRole ? "50%" : "45%",
        render: (v) => (
          <span title={v || ""} className="text-truncate d-block" style={{ maxWidth: 520 }}>
            {v || "—"}
          </span>
        ),
      };
      const byCol = {
        title: "By",
        dataIndex: "byName",
        key: "byName",
        width: "20%",
        render: (v) => <span>{v || "—"}</span>,
      };
      const repliesCol = {
        title: "Replies",
        key: "replyCount",
        width: "10%",
        render: (_, record) => (
          <span>{Number.isFinite(record?.replyCount) ? record.replyCount : 0}</span>
        ),
      };
      const actionCol = {
        title: "Action",
        key: "action",
        width: isUserRole ? "15%" : "10%",
        render: (_, record) => {
          if (actionMenuItems.length === 0) return null;
          return (
            <Dropdown
              menu={{
                items: actionMenuItems,
                onClick: (menuInfo) => handleMenuClick(menuInfo, record),
              }}
              trigger={["hover", "click"]}
            >
              <button className="C-settingButton is-clean small" type="button">
                <Icon name="more_vert" />
              </button>
            </Dropdown>
          );
        },
      };

      // User view: drop "By" (always themselves) and add a reply count instead.
      if (isUserRole) {
        return [titleCol, descriptionCol, repliesCol, actionCol];
      }
      return [titleCol, descriptionCol, byCol, actionCol];
    },
    [actionMenuItems, handleMenuClick, isUserRole]
  );

  // For the user role the listing must only contain enquiries this user sent.
  // Backend may return both sent + received for the same id, so we filter
  // client-side by the normalized `enquiryFrom` identifier.
  const visibleEnquiries = useMemo(() => {
    if (!isUserRole) return enquiries;
    const myId = String(companyId ?? "");
    if (!myId) return enquiries;
    return enquiries.filter((record) => getEnquiryFromId(record) === myId);
  }, [enquiries, isUserRole, companyId]);

  const threadItems = useMemo(() => {
    return getThreadItems(selectedEnquiryDetails);
  }, [selectedEnquiryDetails]);

  const enquirySenderName = useMemo(() => {
    const e = selectedEnquiryDetails && typeof selectedEnquiryDetails === "object"
      ? selectedEnquiryDetails
      : null;
    if (!e) return "";
    return (
      normalizeName(e.by) ||
      normalizeName(e.user) ||
      normalizeName(e.sender) ||
      normalizeName(e.createdBy) ||
      ""
    );
  }, [selectedEnquiryDetails]);

  const submitRespond = useCallback(async () => {
    if (!selectedEnquiryId) return;
    if (!responseText.trim()) {
      message.error("Please enter a response");
      return;
    }
    if (companyId == null || companyId === "") {
      message.error("Invalid company id");
      return;
    }

    const responseMessage = responseText.trim();
    const targetEnquiry = enquiries.find((item) => item.id === selectedEnquiryId);
    if (!targetEnquiry) return;

    setActionLoading(true);
    try {
      await enquiryService.respondToEnquiry(selectedEnquiryId, {
        enquiry_from: companyId,
        enquiry_to: targetEnquiry.enquiryFrom,
        enquiry_for: targetEnquiry.enquiryFor,
        title: targetEnquiry.title,
        description: responseMessage,
      });
      message.success("Response sent successfully");
      closeModals();
      fetchEnquiries({ force: true });
    } catch (err) {
      message.error(err?.message || "Failed to send response");
    } finally {
      setActionLoading(false);
    }
  }, [
    closeModals,
    companyId,
    enquiries,
    fetchEnquiries,
    responseText,
    selectedEnquiryId,
  ]);

  return (
    <>
      <Table
        columns={columns}
        dataSource={visibleEnquiries}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 900 }}
      />

      {/* View thread modal */}
      <Modal
        title={<span className="C-heading size-5 mb-0 bold">Enquiry Thread</span>}
        open={isViewModalOpen}
        onCancel={closeModals}
        footer={null}
        width={900}
        centered
        destroyOnClose
      >
        <div>
            <div className="mb-3">
              <div className="C-heading size-6 semiBold mb-1">
                {selectedEnquiryDetails?.title ||
                  selectedEnquiryDetails?.subject ||
                  "—"}
              </div>
              <div className="color-light text-muted" style={{ whiteSpace: "pre-wrap" }}>
                {selectedEnquiryDetails?.description ||
                  selectedEnquiryDetails?.body ||
                  "—"}
              </div>
            </div>

            <div className="border rounded p-3" style={{ maxHeight: 420, overflow: "auto" }}>
              {threadItems.length === 0 ? (
                <div className="text-muted">No thread messages found.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {threadItems.map((t, idx) => {
                    const sender = normalizeThreadSender(t);
                    const text = normalizeThreadText(t);
                    return (
                      <div key={idx} className="border rounded p-2">
                        <div className="C-heading size-xs semiBold">{sender}</div>
                        <div style={{ whiteSpace: "pre-wrap" }} className="color-light">
                          {text || "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
      </Modal>

      {/* Respond modal */}
      <Modal
        title={<span className="C-heading size-5 mb-0 bold">Respond to Enquiry</span>}
        open={isRespondModalOpen}
        onCancel={closeModals}
        footer={
          <div className="d-flex justify-content-end gap-2">
            <Button className="C-button is-bordered small" onClick={closeModals}>
              Cancel
            </Button>
            <Button
              type="primary"
              className="C-button is-filled small"
              onClick={submitRespond}
              disabled={!canRespond || actionLoading}
              loading={actionLoading}
            >
              Send Response
            </Button>
          </div>
        }
        width={900}
        centered
        destroyOnClose
      >
        <div>
            <div className="border rounded p-3" style={{ maxHeight: 260, overflow: "auto" }}>
              {threadItems.length === 0 ? (
                <div className="text-muted">No thread messages found.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {threadItems.map((t, idx) => {
                    const sender = normalizeThreadSender(t);
                    const text = normalizeThreadText(t);
                    return (
                      <div key={idx} className="border rounded p-2">
                        <div className="C-heading size-xs bold">{sender}</div>
                        <div style={{ whiteSpace: "pre-wrap" }} className="color-light">
                          {text || "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-3">
              <div className="C-heading size-xs semiBold mb-2">
                Response to {enquirySenderName || "User"}
              </div>
              <TextArea
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value ?? "")}
                placeholder="Write your response..."
              />
            </div>
          </div>
      </Modal>
    </>
  );
};

export default EnquiryListing;

