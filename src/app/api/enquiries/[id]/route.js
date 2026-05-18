import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

export const dynamic = "force-dynamic";

const TOKEN_COOKIE_KEYS = [
  "access_token",
  "token",
  "auth_token",
  "authToken",
  "jwt",
  "id_token",
];

function getUpstreamApiBaseUrl() {
  const env = process.env.API_BASE_URL;
  if (typeof env === "string" && env.trim()) {
    return env.trim().replace(/\/$/, "");
  }
  return API_BASE_URL.replace(/\/$/, "");
}

function getBearerTokenFromAuthorizationHeader(request) {
  const auth = request.headers.get("authorization");
  if (!auth || typeof auth !== "string") return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

function getBearerTokenFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const trimmedCookie = cookie.trim();
    const equalIndex = trimmedCookie.indexOf("=");
    if (equalIndex > 0) {
      const key = trimmedCookie.substring(0, equalIndex).trim();
      const value = trimmedCookie.substring(equalIndex + 1).trim();
      if (key && value) {
        try {
          acc[key] = decodeURIComponent(value);
        } catch {
          acc[key] = value;
        }
      }
    }
    return acc;
  }, {});

  for (const key of TOKEN_COOKIE_KEYS) {
    if (cookies[key]) return cookies[key];
  }
  return null;
}

function isUsableToken(token) {
  if (!token || typeof token !== "string") return false;
  const normalized = token.trim().toLowerCase();
  if (!normalized) return false;
  return !["undefined", "null", "nan"].includes(normalized);
}

function resolveBearerToken(request) {
  return (
    getBearerTokenFromAuthorizationHeader(request) ||
    getBearerTokenFromCookieHeader(request.headers.get("cookie") || "")
  );
}

async function readUpstreamBody(response) {
  const raw = await response.text();
  if (!raw) return { message: response.statusText || "Empty response" };
  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw };
  }
}

/**
 * GET /api/enquiries/:id
 * Proxy to ${API_BASE_URL}/enquiries/:id
 * Falls back to threads list when upstream detail fails and companyId is provided.
 */
export async function GET(request, { params }) {
  const base = getUpstreamApiBaseUrl();
  try {
    const { id } = (await params) || {};
    if (!id) {
      return NextResponse.json({ message: "Enquiry id is required." }, { status: 400 });
    }

    const token = resolveBearerToken(request);
    if (!isUsableToken(token)) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication token is required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId")?.trim() || "";

    let url = `${base}/enquiries/${id}`;
    const forwarded = Array.from(searchParams.entries()).filter(
      ([key, value]) =>
        key !== "companyId" &&
        value !== null &&
        value !== undefined &&
        value !== ""
    );
    if (forwarded.length > 0) {
      const qs = new URLSearchParams(forwarded).toString();
      if (qs) url += `?${qs}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await readUpstreamBody(response);

    if (response.ok) {
      return NextResponse.json(data, {
        status: response.status,
        statusText: response.statusText,
      });
    }

    if (companyId) {
      const threadsUrl = `${base}/enquiries/threads?companyId=${encodeURIComponent(companyId)}`;
      const threadsResponse = await fetch(threadsUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      const threadsData = await readUpstreamBody(threadsResponse);
      if (threadsResponse.ok) {
        const list = Array.isArray(threadsData?.data) ? threadsData.data : [];
        const found = list.find((item) => String(item?.id) === String(id));
        if (found) {
          return NextResponse.json({ data: found }, { status: 200 });
        }
      }
    }

    console.error("GET /api/enquiries/:id upstream non-OK:", response.status, url, data);

    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("GET /api/enquiries/:id proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to fetch enquiry",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/enquiries/:id
 */
export async function DELETE(request, { params }) {
  const base = getUpstreamApiBaseUrl();
  try {
    const { id } = (await params) || {};
    if (!id) {
      return NextResponse.json({ message: "Enquiry id is required." }, { status: 400 });
    }

    const token = resolveBearerToken(request);
    if (!isUsableToken(token)) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication token is required" },
        { status: 401 }
      );
    }

    const response = await fetch(`${base}/enquiries/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await readUpstreamBody(response);

    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("DELETE /api/enquiries/:id proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to delete enquiry",
      },
      { status: 500 }
    );
  }
}
