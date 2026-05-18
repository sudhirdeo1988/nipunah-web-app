"use client";

import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Modal, Button, Input, Spin } from "antd";

const { TextArea } = Input;

function formatMessageTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ChatBubble = memo(function ChatBubble({ message, isOwn }) {
  return (
    <div className={`d-flex ${isOwn ? "justify-content-end" : "justify-content-start"}`}>
      <div
        className="rounded px-3 py-2"
        style={{
          maxWidth: "78%",
          background: isOwn ? "var(--bs-primary, #1677ff)" : "#f5f5f5",
          color: isOwn ? "#fff" : "inherit",
        }}
      >
        <div
          className="C-heading size-xs semiBold mb-1"
          style={{ opacity: isOwn ? 0.9 : 1 }}
        >
          {message.displayName || "Participant"}
        </div>
        <div style={{ whiteSpace: "pre-wrap" }}>{message.message || "—"}</div>
        {message.createdAt ? (
          <div className="mt-1" style={{ opacity: 0.75, fontSize: 11 }}>
            {formatMessageTime(message.createdAt)}
          </div>
        ) : null}
      </div>
    </div>
  );
});

const EnquiryThreadModal = ({
  open,
  enquiry,
  messages,
  loading,
  refreshing = false,
  canReply,
  replyHint,
  replyText,
  sending,
  onReplyTextChange,
  onSendReply,
  onClose,
}) => {
  const threadEndRef = useRef(null);
  const title = enquiry?.title || enquiry?.subject || "Enquiry";

  useEffect(() => {
    if (!open || loading) return;
    threadEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [open, messages.length, loading, refreshing]);

  const handleKeyDown = useCallback(
    (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        onSendReply?.();
      }
    },
    [onSendReply]
  );

  const emptyState = useMemo(
    () => !loading && messages.length === 0,
    [loading, messages.length]
  );

  return (
    <Modal
      title={<span className="C-heading size-5 mb-0 bold">Enquiry conversation</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      destroyOnClose
    >
      <div className="mb-3 pb-2 border-bottom">
        <div className="C-heading size-6 semiBold mb-0">{title}</div>
      </div>

      <div
        className="border rounded p-3 mb-3"
        style={{ maxHeight: 380, overflowY: "auto", background: "#fafafa" }}
        aria-live="polite"
      >
        {loading ? (
          <div className="d-flex justify-content-center py-4">
            <Spin />
          </div>
        ) : emptyState ? (
          <div className="text-muted text-center py-3">No messages yet.</div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} isOwn={msg.isOwn} />
            ))}
            <div ref={threadEndRef} />
          </div>
        )}
        {refreshing ? (
          <div className="d-flex justify-content-center py-2">
            <Spin size="small" />
          </div>
        ) : null}
      </div>

      {canReply ? (
        <div className="border-top pt-3">
          <div className="C-heading size-xs semiBold mb-2">Your reply</div>
          <TextArea
            rows={3}
            value={replyText}
            onChange={(e) => onReplyTextChange?.(e.target.value ?? "")}
            onKeyDown={handleKeyDown}
            placeholder="Write your message… (Ctrl+Enter to send)"
            disabled={sending || refreshing}
          />
          <div className="d-flex justify-content-end gap-2 mt-2">
            <Button className="C-button is-bordered small" onClick={onClose} disabled={sending}>
              Close
            </Button>
            <Button
              type="primary"
              className="C-button is-filled small"
              onClick={onSendReply}
              loading={sending}
              disabled={sending || refreshing || !replyText?.trim()}
            >
              Send reply
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {replyHint ? (
            <div className="text-muted mb-3" style={{ fontSize: 13 }}>
              {replyHint}
            </div>
          ) : null}
          <div className="d-flex justify-content-end">
            <Button className="C-button is-bordered small" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default EnquiryThreadModal;
