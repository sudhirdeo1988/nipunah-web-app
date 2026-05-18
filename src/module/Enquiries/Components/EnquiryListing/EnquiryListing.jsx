"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Table, Modal, Dropdown, Space, message } from "antd";
import Icon from "@/components/Icon";
import { enquiryService } from "@/utilities/apiServices";
import { useAppSelector } from "@/store/hooks";
import { getIdFromStoredUser } from "@/utilities/sessionUser";
import { useRole } from "@/hooks/useRole";
import EnquiryThreadModal from "../EnquiryThreadModal/EnquiryThreadModal";
import {
  ENQUIRIES_CACHE_TTL_MS,
  ENQUIRY_DETAIL_CACHE_TTL_MS,
  buildConversationThread,
  canReplyToEnquiry,
  extractEnquiryFromResponse,
  getReplyBlockedHint,
  buildEnquiryPartiesPayload,
  idsMatch,
  invalidateEnquiriesListCache,
  invalidateEnquiryDetailCache,
  normalizeEnquiryRecord,
  resolveEnquiryParties,
  enquiriesInFlightByCompany,
  enquiriesCacheByCompany,
  enquiryDetailInFlightById,
  enquiryDetailCacheById,
} from "../../utils/enquiryThreadUtils";

const viewerContextFor = (myId, isUser) => ({ myId, isUser });

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

async function fetchEnquiryDetail(enquiryId, { force = false, companyId } = {}) {
  const key = String(enquiryId);
  if (!key) return null;

  if (force) {
    invalidateEnquiryDetailCache(key);
  } else {
    const now = Date.now();
    const cached = enquiryDetailCacheById.get(key);
    if (cached && now - cached.timestamp < ENQUIRY_DETAIL_CACHE_TTL_MS) {
      return cached.data;
    }
  }

  if (enquiryDetailInFlightById.has(key)) {
    return enquiryDetailInFlightById.get(key);
  }

  const params =
    companyId != null && companyId !== "" ? { companyId: String(companyId) } : {};

  const requestPromise = enquiryService
    .getEnquiryById(key, params)
    .then((res) => {
      enquiryDetailCacheById.set(key, { data: res, timestamp: Date.now() });
      return res;
    })
    .finally(() => {
      enquiryDetailInFlightById.delete(key);
    });

  enquiryDetailInFlightById.set(key, requestPromise);
  return requestPromise;
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

  const [threadModalOpen, setThreadModalOpen] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadRefreshing, setThreadRefreshing] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(null);
  const [selectedEnquiryDetails, setSelectedEnquiryDetails] = useState(null);
  const [replyText, setReplyText] = useState("");

  const currentUserId = useMemo(() => getIdFromStoredUser(user), [user]);
  const myId = useMemo(() => String(currentUserId ?? ""), [currentUserId]);
  const viewerCtx = useMemo(
    () => viewerContextFor(myId, isUserRole),
    [myId, isUserRole]
  );

  const applyEnquiryToState = useCallback((enquiryId, raw, listFallback = {}) => {
    if (!raw || typeof raw !== "object") return null;
    const normalized = normalizeEnquiryRecord({ ...listFallback, ...raw });
    setSelectedEnquiryDetails((prev) =>
      prev && String(prev.id) !== String(enquiryId) ? prev : normalized
    );
    setEnquiries((prev) =>
      prev.map((item) => (String(item.id) === String(enquiryId) ? normalized : item))
    );
    return normalized;
  }, []);

  const fetchEnquiries = useCallback(async ({ force = false } = {}) => {
    if (currentUserId == null || currentUserId === "") return;
    setLoading(true);
    try {
      const res = await getEnquiriesWithDedupe(currentUserId, { force });
      const list = Array.isArray(res?.data) ? res.data : [];
      setEnquiries(list.map(normalizeEnquiryRecord));
    } catch (err) {
      message.error(err?.message || "Failed to load enquiries");
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const closeThreadModal = useCallback(() => {
    setThreadModalOpen(false);
    setThreadLoading(false);
    setThreadRefreshing(false);
    setReplyText("");
    setSelectedEnquiryId(null);
    setSelectedEnquiryDetails(null);
  }, []);

  /**
   * GET /api/enquiries/:id — same fetch used by View / Reply.
   * refreshOnly: keep modal open and show inline refresh (after send reply).
   */
  const loadThreadForEnquiry = useCallback(
    async (record, { force = false, refreshOnly = false } = {}) => {
      if (!record?.id) return null;
      const enquiryId = record.id;

      if (refreshOnly) {
        setThreadRefreshing(true);
      } else {
        setSelectedEnquiryId(enquiryId);
        setSelectedEnquiryDetails(normalizeEnquiryRecord(record));
        setThreadModalOpen(true);
        setThreadLoading(true);
      }

      try {
        const res = await fetchEnquiryDetail(enquiryId, {
          force: force || refreshOnly,
          companyId: currentUserId,
        });
        const raw = extractEnquiryFromResponse(res);
        if (raw && typeof raw === "object") {
          return applyEnquiryToState(enquiryId, raw, record);
        }
        return null;
      } catch (err) {
        message.error(
          err?.message ||
            (refreshOnly ? "Failed to load latest messages" : "Failed to load conversation")
        );
        return null;
      } finally {
        setThreadLoading(false);
        setThreadRefreshing(false);
      }
    },
    [applyEnquiryToState, currentUserId]
  );

  const handleView = useCallback(
    (record) => loadThreadForEnquiry(record, { force: true }),
    [loadThreadForEnquiry]
  );

  const handleReply = useCallback(
    (record) => loadThreadForEnquiry(record, { force: true }),
    [loadThreadForEnquiry]
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
            invalidateEnquiryDetailCache(id);
            invalidateEnquiriesListCache(currentUserId);
            message.success("Enquiry deleted successfully");
          } catch (err) {
            message.error(err?.message || "Failed to delete enquiry");
          } finally {
            setActionLoading(false);
          }
        },
      });
    },
    [currentUserId]
  );

  const getActionMenuItems = useCallback(
    (record) => {
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
      const mayReply =
        canRespond && canReplyToEnquiry(record, { isUser: isUserRole, myId });
      if (mayReply) {
        items.push({
          key: "reply",
          label: (
            <Space align="center">
              <Icon name="reply" size="small" />
              <span className="C-heading size-xs mb-0 semiBold">Reply</span>
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
    [canView, canRespond, canDelete, isUserRole, myId]
  );

  const handleMenuClick = useCallback(
    (menuInfo, record) => {
      const key = menuInfo?.key;
      if (key === "view") return handleView(record);
      if (key === "reply") return handleReply(record);
      if (key === "delete") return handleDelete(record);
    },
    [handleDelete, handleReply, handleView]
  );

  const columns = useMemo(
    () => {
      const titleCol = {
        title: "Title",
        dataIndex: "title",
        key: "title",
        width: "25%",
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
          const rowMenuItems = getActionMenuItems(record);
          if (rowMenuItems.length === 0) return null;
          return (
            <Dropdown
              menu={{
                items: rowMenuItems,
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

      if (isUserRole) {
        return [titleCol, descriptionCol, repliesCol, actionCol];
      }
      return [titleCol, descriptionCol, byCol, actionCol];
    },
    [getActionMenuItems, handleMenuClick, isUserRole]
  );

  const visibleEnquiries = useMemo(() => {
    if (!isUserRole || !myId) return enquiries;
    return enquiries.filter((record) => {
      const { userId } = resolveEnquiryParties(record, viewerCtx);
      return idsMatch(userId, myId);
    });
  }, [enquiries, isUserRole, myId, viewerCtx]);

  const canReplyInThread = useMemo(() => {
    if (!canRespond || !selectedEnquiryDetails) return false;
    return canReplyToEnquiry(selectedEnquiryDetails, { isUser: isUserRole, myId });
  }, [canRespond, isUserRole, myId, selectedEnquiryDetails]);

  const replyBlockedHint = useMemo(() => {
    if (!selectedEnquiryDetails || canReplyInThread) return "";
    return getReplyBlockedHint(isUserRole);
  }, [canReplyInThread, isUserRole, selectedEnquiryDetails]);

  const threadMessages = useMemo(() => {
    if (!selectedEnquiryDetails) return [];

    const parties = resolveEnquiryParties(selectedEnquiryDetails, viewerCtx);
    const thread = buildConversationThread(selectedEnquiryDetails, viewerCtx);

    return thread.map((msg) => {
      const isOwn = idsMatch(msg.senderId, parties.viewerPartyId);
      const displayName = isOwn
        ? "Me"
        : idsMatch(msg.senderId, parties.userId)
          ? parties.userName
          : idsMatch(msg.senderId, parties.companyId)
            ? parties.companyName
            : msg.senderName;

      return { ...msg, isOwn, displayName };
    });
  }, [selectedEnquiryDetails, viewerCtx]);

  const submitReply = useCallback(async () => {
    if (!selectedEnquiryId || !replyText.trim()) {
      message.error("Please enter a message");
      return;
    }
    if (!myId) {
      message.error("Could not resolve your account. Please log in again.");
      return;
    }

    const targetEnquiry =
      selectedEnquiryDetails ||
      enquiries.find((item) => String(item.id) === String(selectedEnquiryId));
    if (!targetEnquiry) return;

    if (!canReplyToEnquiry(targetEnquiry, { isUser: isUserRole, myId })) {
      message.warning(getReplyBlockedHint(isUserRole));
      return;
    }

    const responseMessage = replyText.trim();
    const { enquiry_from, enquiry_to } = buildEnquiryPartiesPayload(targetEnquiry, {
      myId,
      isUser: isUserRole,
    });

    if (!enquiry_from || !enquiry_to) {
      message.error("Could not resolve sender or recipient for this enquiry.");
      return;
    }

    if (idsMatch(enquiry_from, enquiry_to)) {
      message.error("Sender and recipient cannot be the same.");
      return;
    }

    setActionLoading(true);
    try {
      await enquiryService.respondToEnquiry(selectedEnquiryId, {
        enquiry_from,
        enquiry_to,
        enquiry_for: targetEnquiry.enquiryFor ?? targetEnquiry.enquiry_for,
        title: targetEnquiry.title,
        description: responseMessage,
      });

      setReplyText("");
      message.success("Reply sent successfully");

      invalidateEnquiriesListCache(currentUserId);
      await fetchEnquiries({ force: true });
      await loadThreadForEnquiry(
        { ...targetEnquiry, id: selectedEnquiryId },
        { force: true, refreshOnly: true }
      );
    } catch (err) {
      message.error(err?.message || "Failed to send reply");
    } finally {
      setActionLoading(false);
    }
  }, [
    currentUserId,
    enquiries,
    fetchEnquiries,
    isUserRole,
    myId,
    loadThreadForEnquiry,
    replyText,
    selectedEnquiryDetails,
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

      <EnquiryThreadModal
        open={threadModalOpen}
        enquiry={selectedEnquiryDetails}
        messages={threadMessages}
        loading={threadLoading}
        refreshing={threadRefreshing}
        canReply={canReplyInThread}
        replyHint={replyBlockedHint}
        replyText={replyText}
        sending={actionLoading}
        onReplyTextChange={setReplyText}
        onSendReply={submitReply}
        onClose={closeThreadModal}
      />
    </>
  );
};

export default EnquiryListing;
