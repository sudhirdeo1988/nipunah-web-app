export const ENQUIRIES_CACHE_TTL_MS = 5000;
export const ENQUIRY_DETAIL_CACHE_TTL_MS = 4000;

/** Pull a stable id out of enquiry_from / sender fields. */
export function getEnquiryFromId(record) {
  const from =
    record?.enquiryFrom ?? record?.enquiry_from ?? record?.from ?? record?.sender;
  if (from === null || from === undefined) return "";
  if (typeof from === "object") {
    return String(from.id ?? from._id ?? from.user_id ?? from.userId ?? "");
  }
  return String(from);
}

/** Pull recipient id from enquiry_to / to fields. */
export function getEnquiryToId(record) {
  const to = record?.enquiryTo ?? record?.enquiry_to ?? record?.to ?? record?.recipient;
  if (to === null || to === undefined) return "";
  if (typeof to === "object") {
    return String(to.id ?? to._id ?? to.user_id ?? to.userId ?? "");
  }
  return String(to);
}

function looksLikeId(value) {
  if (value === null || value === undefined) return false;
  return /^\d+$/.test(String(value).trim());
}

export function normalizeName(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val.name || val.username || val.email || val.company_name || val.companyName || "";
  }
  return String(val);
}

/** Prefer a human label; never surface a bare numeric id as a display name. */
export function normalizeDisplayName(val, fallback = "Participant") {
  if (val === null || val === undefined || val === "") return fallback;
  if (typeof val === "object") {
    const name =
      val.name ||
      val.username ||
      val.email ||
      val.company_name ||
      val.companyName ||
      val.title ||
      "";
    if (name && !looksLikeId(name)) return name;
    return fallback;
  }
  const text = String(val).trim();
  if (!text || looksLikeId(text)) return fallback;
  return text;
}

export function getEnquiryPartyNames(enquiry, { userId, companyId } = {}) {
  const e = enquiry && typeof enquiry === "object" ? enquiry : {};
  const fromRef = e.enquiryFrom ?? e.enquiry_from;
  const toRef = e.enquiryTo ?? e.enquiry_to;

  const userName = normalizeDisplayName(
    idsMatch(getEnquiryFromId(e), userId) ? fromRef : idsMatch(getEnquiryToId(e), userId) ? toRef : fromRef,
    "User"
  );
  const companyName = normalizeDisplayName(
    idsMatch(getEnquiryToId(e), companyId) ? toRef : idsMatch(getEnquiryFromId(e), companyId) ? fromRef : toRef,
    "Company"
  );

  return { userName, companyName };
}

/**
 * Map enquiry_from / enquiry_to to user vs company using the logged-in viewer.
 * Handles records where from/to are swapped relative to the viewer.
 */
export function resolveEnquiryParties(enquiry, { myId, isUser = false } = {}) {
  const rawFromId = getEnquiryFromId(enquiry);
  const rawToId = getEnquiryToId(enquiry);

  let userId = rawFromId;
  let companyId = rawToId;

  if (myId) {
    if (isUser) {
      if (idsMatch(myId, rawToId) && !idsMatch(myId, rawFromId)) {
        userId = rawToId;
        companyId = rawFromId;
      }
    } else if (idsMatch(myId, rawFromId) && !idsMatch(myId, rawToId)) {
      userId = rawToId;
      companyId = rawFromId;
    }
  }

  const viewerPartyId = isUser ? userId : companyId;
  const { userName, companyName } = getEnquiryPartyNames(enquiry, { userId, companyId });

  return { userId, companyId, viewerPartyId, userName, companyName };
}

export function normalizeThreadText(threadItem) {
  const t = threadItem && typeof threadItem === "object" ? threadItem : {};
  if (typeof threadItem === "string") return threadItem;
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

export function idsMatch(a, b) {
  if (a === null || a === undefined || b === null || b === undefined) return false;
  const left = String(a).trim();
  const right = String(b).trim();
  if (!left || !right) return false;
  return left === right;
}

export function getReplyFromId(reply) {
  const r = reply && typeof reply === "object" ? reply : {};
  const from =
    r.enquiryFrom ??
    r.enquiry_from ??
    r.from ??
    r.sender ??
    r.userId ??
    r.user_id ??
    r.createdBy ??
    r.created_by;
  if (from === null || from === undefined) return "";
  if (typeof from === "object") {
    return String(from.id ?? from._id ?? from.user_id ?? from.userId ?? "");
  }
  return String(from);
}

function getResolvedParties(enquiry, viewerContext) {
  if (viewerContext?.myId != null && viewerContext?.myId !== "") {
    return resolveEnquiryParties(enquiry, viewerContext);
  }
  return {
    userId: getEnquiryFromId(enquiry),
    companyId: getEnquiryToId(enquiry),
  };
}

/** Users may reply only after at least one message from the company. */
export function canUserReplyToEnquiry(enquiry, viewerContext) {
  const { userId, companyId } = getResolvedParties(enquiry, viewerContext);
  const replies = Array.isArray(enquiry?.replies) ? enquiry.replies : [];
  if (!userId || !companyId || replies.length === 0) return false;

  return replies.some((reply, replyIndex) => {
    const item = typeof reply === "string" ? {} : reply ?? {};
    const replyFrom = getReplyFromId(item);
    if (replyFrom) return idsMatch(replyFrom, companyId);
    return replyIndex % 2 === 0;
  });
}

/** Company may reply to a new enquiry, then only after the user has responded. */
export function canCompanyReplyToEnquiry(enquiry, viewerContext) {
  const { userId, companyId } = getResolvedParties(enquiry, viewerContext);
  const replies = Array.isArray(enquiry?.replies) ? enquiry.replies : [];
  if (!userId || !companyId) return false;

  if (replies.length === 0) return true;

  return replies.some((reply, replyIndex) => {
    const item = typeof reply === "string" ? {} : reply ?? {};
    const replyFrom = getReplyFromId(item);
    if (replyFrom) return idsMatch(replyFrom, userId);
    return replyIndex % 2 === 1;
  });
}

export function canReplyToEnquiry(enquiry, { isUser = false, myId } = {}) {
  const viewerContext = myId ? { myId, isUser } : undefined;
  return isUser
    ? canUserReplyToEnquiry(enquiry, viewerContext)
    : canCompanyReplyToEnquiry(enquiry, viewerContext);
}

/**
 * Build enquiry_from / enquiry_to for create & reply.
 *
 * Rules (always):
 * - enquiry_from = current logged-in user id (company or user account)
 * - enquiry_to   = the other party on this thread (who you are messaging)
 *
 * On an existing thread, if you are enquiry_from → to is enquiry_to; if you are
 * enquiry_to → to is enquiry_from. Role-based fallback matches new-enquiry shape
 * (user → company: from=user, to=company).
 */
export function buildEnquiryPartiesPayload(enquiry, { myId, isUser = false } = {}) {
  const rawFromId = getEnquiryFromId(enquiry);
  const rawToId = getEnquiryToId(enquiry);
  const enquiry_from = myId == null || myId === "" ? "" : String(myId);

  let enquiry_to = "";
  if (idsMatch(enquiry_from, rawFromId)) {
    enquiry_to = rawToId;
  } else if (idsMatch(enquiry_from, rawToId)) {
    enquiry_to = rawFromId;
  } else if (!isUser) {
    enquiry_to = rawFromId;
  } else {
    enquiry_to = rawToId;
  }

  return { enquiry_from, enquiry_to };
}

/** @deprecated Use buildEnquiryPartiesPayload */
export function getReplyRecipientId(enquiry, options = {}) {
  return buildEnquiryPartiesPayload(enquiry, options).enquiry_to;
}

export function getReplyBlockedHint(isUser) {
  return isUser
    ? "You can reply after the company responds to your enquiry."
    : "You can reply after the user responds to your message.";
}

function resolveReplySenderId(item, { fromId, toId, replyIndex }) {
  if (!fromId || !toId) return getReplyFromId(item);
  // replies[0] = company, replies[1] = user, replies[2] = company, …
  const inferredId = replyIndex % 2 === 0 ? toId : fromId;
  const explicitFromId = getReplyFromId(item);
  if (!explicitFromId) return inferredId;
  if (idsMatch(explicitFromId, inferredId)) return explicitFromId;
  // API sometimes echoes the wrong enquiry_from — trust thread position
  return inferredId;
}

function getThreadArrays(enquiry) {
  const e = enquiry && typeof enquiry === "object" ? enquiry : {};
  const candidates = [e.thread, e.messages, e.responses, e.conversation, e.items];
  return candidates.find((c) => Array.isArray(c) && c.length > 0) || null;
}

function normalizeThreadMessage(item, { fromId, toId, fromName, toName, index, isReply }) {
  const text = normalizeThreadText(item);
  if (!text) return null;

  const replyIndex = isReply ? index : null;
  const senderId = isReply
    ? resolveReplySenderId(item, { fromId, toId, replyIndex })
    : (() => {
        const explicitFromId = getReplyFromId(item);
        if (explicitFromId) return explicitFromId;
        if (fromId && toId) return index % 2 === 0 ? fromId : toId;
        return "";
      })();

  const isFromParty = idsMatch(senderId, fromId);
  const rawSenderLabel =
    normalizeName(item?.from) ||
    normalizeName(item?.by) ||
    normalizeName(item?.sender) ||
    normalizeName(item?.user) ||
    normalizeName(item?.createdBy) ||
    "";
  const senderName = normalizeDisplayName(
    rawSenderLabel && !looksLikeId(rawSenderLabel) ? rawSenderLabel : null,
    isFromParty ? fromName : toName
  );

  return {
    id: item?.id ?? item?._id ?? `msg-${index}`,
    senderId: senderId || "",
    senderName,
    message: text,
    createdAt: item?.createdAt ?? item?.created_at ?? item?.timestamp ?? null,
  };
}

/** Build ordered chat messages for an enquiry record. */
export function buildConversationThread(enquiry, viewerContext) {
  const e = enquiry && typeof enquiry === "object" ? enquiry : {};
  const parties = viewerContext
    ? resolveEnquiryParties(e, viewerContext)
    : {
        userId: getEnquiryFromId(e),
        companyId: getEnquiryToId(e),
        userName: getEnquiryPartyNames(e).userName,
        companyName: getEnquiryPartyNames(e).companyName,
      };

  const fromId = parties.userId;
  const toId = parties.companyId;
  const fromName = parties.userName;
  const toName = parties.companyName;

  const prebuilt = getThreadArrays(e);
  if (prebuilt) {
    return prebuilt
      .map((item, index) =>
        normalizeThreadMessage(item, { fromId, toId, fromName, toName, index })
      )
      .filter(Boolean);
  }

  const messages = [];
  if (e.description) {
    messages.push({
      id: "root",
      senderId: fromId,
      senderName: fromName,
      message: e.description,
      createdAt: e.createdAt ?? e.created_at ?? null,
    });
  }

  const replies = Array.isArray(e.replies) ? e.replies : [];
  replies.forEach((reply, replyIndex) => {
    const item = typeof reply === "string" ? { description: reply } : reply;
    const normalized = normalizeThreadMessage(item, {
      fromId,
      toId,
      fromName,
      toName,
      index: replyIndex,
      isReply: true,
    });
    if (normalized) messages.push(normalized);
  });

  return messages;
}

export function normalizeEnquiryRecord(item) {
  const e = item && typeof item === "object" ? item : {};
  const replies = Array.isArray(e.replies) ? e.replies : [];
  const thread = buildConversationThread(e);

  return {
    ...e,
    id: e.id,
    title: e.title || "—",
    description: e.description || "—",
    enquiryFrom: e.enquiryFrom ?? e.enquiry_from,
    enquiryTo: e.enquiryTo ?? e.enquiry_to,
    enquiryFor: e.enquiryFor ?? e.enquiry_for,
    byName: normalizeName(e.enquiryFrom) || "User",
    replyCount: replies.length,
    thread,
  };
}

export function extractEnquiryFromResponse(res) {
  if (!res || typeof res !== "object") return null;
  return res.data ?? res.enquiry ?? res.result ?? res;
}

/** Id from create/detail/list API response shapes. */
export function extractEnquiryIdFromResponse(res) {
  const raw = extractEnquiryFromResponse(res);
  if (!raw || typeof raw !== "object") return "";
  return String(raw.id ?? raw._id ?? raw.enquiry_id ?? raw.enquiryId ?? "");
}

export function invalidateEnquiriesListCache(companyId) {
  if (companyId == null || companyId === "") return;
  enquiriesCacheByCompany.delete(String(companyId));
}

// Module-level caches (shared with listing fetch dedupe)
export const enquiriesInFlightByCompany = new Map();
export const enquiriesCacheByCompany = new Map();
export const enquiryDetailInFlightById = new Map();
export const enquiryDetailCacheById = new Map();

export function invalidateEnquiryDetailCache(enquiryId) {
  if (enquiryId == null || enquiryId === "") return;
  const key = String(enquiryId);
  enquiryDetailCacheById.delete(key);
  enquiryDetailInFlightById.delete(key);
}
