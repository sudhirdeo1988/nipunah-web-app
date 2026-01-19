import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/api";

/**
 * GET /api/equipments/[equipmentId]
 * Proxy endpoint for fetching a single equipment by ID
 * Automatically includes bearer token from cookies
 */
export async function GET(request, { params }) {
  try {
    const { equipmentId } = params;
    const url = `${API_BASE_URL}/equipments/${equipmentId}`;

    // Get access token from request cookies
    const cookieHeader = request.headers.get("cookie") || "";
    let token = null;

    if (cookieHeader) {
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

      token = cookies["access_token"] || cookies.access_token || null;
    }

    // Prepare headers
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication token is required",
        },
        { status: 401 }
      );
    }

    // Make the request to the external API
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || response.statusText };
      }
    }

    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("Get Equipment by ID API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to fetch equipment",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/equipments/[equipmentId]
 * Proxy endpoint for updating equipment
 * Automatically includes bearer token from cookies
 */
export async function PUT(request, { params }) {
  try {
    const { equipmentId } = params;
    const body = await request.json();
    const url = `${API_BASE_URL}/equipments/${equipmentId}`;

    // Get access token from request cookies
    const cookieHeader = request.headers.get("cookie") || "";
    let token = null;

    if (cookieHeader) {
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

      token = cookies["access_token"] || cookies.access_token || null;
    }

    // Prepare headers
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication token is required",
        },
        { status: 401 }
      );
    }

    // Make the request to the external API
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || response.statusText };
      }
    }

    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("Update Equipment API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to update equipment",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/equipments/[equipmentId]
 * Proxy endpoint for deleting equipment
 * Automatically includes bearer token from cookies
 */
export async function DELETE(request, { params }) {
  try {
    const { equipmentId } = params;
    const url = `${API_BASE_URL}/equipments/${equipmentId}`;

    // Get access token from request cookies
    const cookieHeader = request.headers.get("cookie") || "";
    let token = null;

    if (cookieHeader) {
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

      token = cookies["access_token"] || cookies.access_token || null;
    }

    // Prepare headers
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication token is required",
        },
        { status: 401 }
      );
    }

    // Make the request to the external API
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || response.statusText };
      }
    }

    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    console.error("Delete Equipment API proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "Failed to delete equipment",
      },
      { status: 500 }
    );
  }
}





