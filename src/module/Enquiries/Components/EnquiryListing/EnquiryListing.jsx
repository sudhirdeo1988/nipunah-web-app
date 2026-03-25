"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Table, Modal, Dropdown, Space, Button, Input, message } from "antd";
import Icon from "@/components/Icon";

const { TextArea } = Input;

const MOCK_ENQUIRIES = [
  {
    id: 1001,
    title: "Need details for premium listing",
    description: "Please share premium listing benefits and pricing.",
    byName: "Aarav Sharma",
    thread: [
      { by: "Aarav Sharma", message: "Please share premium listing benefits and pricing." },
      { by: "Admin", message: "Sure, we have monthly and yearly plans. I will share details." },
    ],
  },
  {
    id: 1002,
    title: "Unable to update profile",
    description: "I get an error while saving profile information.",
    byName: "Nisha Verma",
    thread: [
      { by: "Nisha Verma", message: "I get an error while saving profile information." },
      { by: "Admin", message: "Could you share a screenshot of the error?" },
      { by: "Nisha Verma", message: "It says validation failed for phone number." },
    ],
  },
  {
    id: 1003,
    title: "Question about equipment posting",
    description: "What file formats are accepted for equipment images?",
    byName: "Rohit Jain",
    thread: [
      { by: "Rohit Jain", message: "What file formats are accepted for equipment images?" },
    ],
  },
];

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

const EnquiryListing = ({ permissions = {} }) => {
  const canView = Boolean(permissions.view);
  const canDelete = Boolean(permissions.delete);
  const canRespond = Boolean(permissions.respond);

  const [enquiries, setEnquiries] = useState(MOCK_ENQUIRIES);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(null);
  const [selectedEnquiryDetails, setSelectedEnquiryDetails] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [responseText, setResponseText] = useState("");

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
          setEnquiries((prev) => prev.filter((item) => item.id !== id));
          message.success("Enquiry deleted successfully");
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
    if (canRespond) {
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
  }, [canView, canRespond, canDelete]);

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
    () => [
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        width: "25%",
        render: (v) => <span className="C-heading size-xs">{v || "—"}</span>,
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        width: "45%",
        render: (v) => (
          <span title={v || ""} className="text-truncate d-block" style={{ maxWidth: 520 }}>
            {v || "—"}
          </span>
        ),
      },
      {
        title: "By",
        dataIndex: "byName",
        key: "byName",
        width: "20%",
        render: (v) => <span>{v || "—"}</span>,
      },
      {
        title: "Action",
        key: "action",
        width: "10%",
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
      },
    ],
    [actionMenuItems, handleMenuClick]
  );

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

  const submitRespond = useCallback(() => {
    if (!selectedEnquiryId) return;
    if (!responseText.trim()) {
      message.error("Please enter a response");
      return;
    }
    const responseMessage = responseText.trim();

    setEnquiries((prev) =>
      prev.map((item) => {
        if (item.id !== selectedEnquiryId) return item;
        return {
          ...item,
          thread: [...getThreadItems(item), { by: "Admin", message: responseMessage }],
        };
      })
    );
    message.success("Response sent successfully");
    closeModals();
  }, [closeModals, responseText, selectedEnquiryId]);

  return (
    <>
      <Table
        columns={columns}
        dataSource={enquiries}
        rowKey="id"
        loading={false}
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
              disabled={!canRespond}
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

