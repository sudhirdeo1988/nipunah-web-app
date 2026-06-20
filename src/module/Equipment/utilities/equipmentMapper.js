import CountryDetails from "@/utilities/CountryDetails.json";

function normalizeDialCode(code) {
  if (code == null || code === "") return "";
  const trimmed = String(code).trim().replace(/\s+/g, "");
  if (!trimmed) return "";
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}

function dialCodeFromCountryName(countryName) {
  if (!countryName) return "";
  const normalized = String(countryName).trim().toLowerCase();
  const match = CountryDetails.find(
    (c) => c.countryName?.trim().toLowerCase() === normalized
  );
  return match?.dailCode ? normalizeDialCode(match.dailCode) : "";
}

function resolveEquipmentContactCountryCode(raw) {
  const address = raw?.equipment_address || raw?.address || {};
  const fromApi = raw?.contact_country_code ?? raw?.contactCountryCode ?? "";
  const normalized = normalizeDialCode(fromApi);
  if (normalized) return normalized;
  return dialCodeFromCountryName(address?.country);
}

function formatEquipmentDate(dateValue) {
  if (!dateValue) return "N/A";

  let date;

  if (typeof dateValue === "string") {
    if (dateValue.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
      date = new Date(dateValue);
    } else {
      const timestamp = parseInt(dateValue, 10);
      if (!Number.isNaN(timestamp)) {
        const timestampLength = timestamp.toString().length;
        date =
          timestampLength === 10
            ? new Date(timestamp * 1000)
            : new Date(timestamp);
      } else {
        return "N/A";
      }
    }
  } else if (typeof dateValue === "number") {
    const timestampLength = dateValue.toString().length;
    date =
      timestampLength === 10 ? new Date(dateValue * 1000) : new Date(dateValue);
  } else {
    return "N/A";
  }

  if (Number.isNaN(date.getTime())) return "N/A";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/** Normalize GET /equipments/:id (or list row) into app equipment shape. */
export function mapApiEquipmentRecord(raw) {
  if (!raw || typeof raw !== "object") return null;

  const createdAt = raw.createdAt || raw.created_at || raw.created_on;
  const address = raw?.equipment_address || raw?.address || {};
  const contactCountryCode = resolveEquipmentContactCountryCode(raw);

  return {
    id: raw?.id ?? raw?.equipment_id ?? raw?.equipmentId ?? null,
    name: raw?.name || "",
    category: raw?.category || "",
    type: raw?.type || "",
    about: raw?.about || "",
    manufactureYear: raw?.manufacture_year ?? raw?.manufactureYear ?? "",
    manufactureCompany: raw?.manufacture_company ?? raw?.manufactureCompany ?? "",
    availableFor: raw?.available_for ?? raw?.availableFor ?? "",
    rentType: raw?.rent_type ?? raw?.rentType ?? "",
    contactEmail: raw?.contact_email ?? raw?.contactEmail ?? "",
    contactNumber: raw?.contact_number ?? raw?.contactNumber ?? "",
    contact_country_code: contactCountryCode,
    contactCountryCode,
    address,
    createDate: raw?.createDate || formatEquipmentDate(createdAt),
    companyId: raw?.company_id ?? raw?.companyId ?? null,
  };
}

export function getResolvedCompanyId(user) {
  if (!user || typeof user !== "object") return null;
  return user.company_id ?? user.companyId ?? user.id ?? null;
}

export function getEquipmentCompanyId(equipment) {
  if (!equipment || typeof equipment !== "object") return null;
  return equipment.companyId ?? equipment.company_id ?? null;
}

/** Company users may only edit/delete their own equipment; other roles are unrestricted. */
export function canUserManageEquipment(equipment, user, role) {
  const normalizedRole = String(
    role || user?.role || user?.type || ""
  ).toLowerCase();
  if (normalizedRole !== "company") return true;

  const ownerId = getEquipmentCompanyId(equipment);
  const userCompanyId = getResolvedCompanyId(user);
  if (ownerId == null || userCompanyId == null) return false;
  return String(ownerId) === String(userCompanyId);
}

export function extractEquipmentPayload(response) {
  return (
    response?.data?.equipment ||
    response?.equipment ||
    (response?.data && typeof response.data === "object" ? response.data : response)
  );
}

/** Parse list API responses (axios interceptor already unwraps axios.data). */
export function parseEquipmentListResponse(res) {
  if (!res) {
    return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }
  if (Array.isArray(res)) {
    return {
      items: res,
      total: res.length,
      page: 1,
      limit: res.length,
      totalPages: 1,
    };
  }
  if (res.data?.items && Array.isArray(res.data.items)) {
    return {
      items: res.data.items,
      total: res.data.total ?? res.data.items.length,
      page: res.data.page ?? 1,
      limit: res.data.limit ?? res.data.items.length,
      totalPages: res.data.totalPages ?? 1,
    };
  }
  if (Array.isArray(res.items)) {
    return {
      items: res.items,
      total: res.total ?? res.items.length,
      page: res.page ?? 1,
      limit: res.limit ?? res.items.length,
      totalPages: res.totalPages ?? 1,
    };
  }
  if (Array.isArray(res.data)) {
    return {
      items: res.data,
      total: res.total ?? res.data.length,
      page: res.page ?? 1,
      limit: res.limit ?? res.data.length,
      totalPages: res.totalPages ?? 1,
    };
  }
  if (Array.isArray(res.equipments)) {
    return {
      items: res.equipments,
      total: res.total ?? res.equipments.length,
      page: res.page ?? 1,
      limit: res.limit ?? res.equipments.length,
      totalPages: res.totalPages ?? 1,
    };
  }
  return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
}
