import dayjs from "dayjs";

/** Normalize id for Ant Design Select (number when numeric). */
export function coerceSelectId(value) {
  if (value == null || value === "") return undefined;
  const num = Number(value);
  if (!Number.isNaN(num) && String(num) === String(value).trim()) {
    return num;
  }
  return value;
}

function coerceYear(value) {
  if (value == null || value === "") return undefined;
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed) && parsed > 1000) return parsed;
    const year = new Date(value).getFullYear();
    return Number.isNaN(year) ? undefined : year;
  }
  if (typeof value?.year === "function") return value.year();
  if (typeof value?.format === "function") {
    return parseInt(value.format("YYYY"), 10);
  }
  if (value instanceof Date) return value.getFullYear();
  return undefined;
}

function normalizeAddressForForm(addr, index) {
  if (!addr || typeof addr !== "object") {
    return {
      id: index + 1,
      isPrimary: index === 0,
      country: "",
      state: "",
      address: "",
      city: "",
      postal_code: "",
    };
  }

  const detailAddress =
    addr.address ??
    addr.location ??
    addr.detail_address ??
    addr.detailAddress ??
    addr.street ??
    addr.full_address ??
    "";

  return {
    id: addr.id ?? index + 1,
    isPrimary:
      addr.isPrimary ??
      addr.is_primary ??
      addr.isPrimaryLocation ??
      addr.is_primary_location ??
      index === 0,
    country: addr.country ?? "",
    state: addr.state ?? addr.province ?? "",
    address: detailAddress,
    city: addr.city ?? "",
    postal_code: addr.postal_code ?? addr.postalCode ?? addr.pincode ?? "",
  };
}

function extractAddressesFromApi(raw = {}) {
  if (Array.isArray(raw.addresses) && raw.addresses.length) {
    return raw.addresses;
  }
  if (Array.isArray(raw.locations) && raw.locations.length) {
    return raw.locations;
  }
  if (
    raw.address &&
    typeof raw.address === "object" &&
    !Array.isArray(raw.address)
  ) {
    return [raw.address];
  }
  if (raw.country || raw.city || raw.state || raw.location || raw.postal_code) {
    return [
      {
        country: raw.country,
        state: raw.state,
        city: raw.city,
        location: raw.location,
        address: raw.address,
        postal_code: raw.postal_code,
        isPrimary: true,
      },
    ];
  }
  return [];
}

function normalizeCategoryPair(mainCategoryId, subCategoryId) {
  return {
    mainCategoryId: coerceSelectId(mainCategoryId),
    subCategoryId: coerceSelectId(subCategoryId),
  };
}

function normalizeCategoryForForm(cat) {
  if (!cat || typeof cat !== "object") {
    return { mainCategoryId: undefined, subCategoryId: undefined };
  }

  if (
    cat.mainCategoryId != null ||
    cat.main_category_id != null ||
    (cat.categoryId != null && cat.subCategoryId != null) ||
    (cat.category_id != null && cat.sub_category_id != null)
  ) {
    return normalizeCategoryPair(
      cat.mainCategoryId ??
        cat.main_category_id ??
        cat.categoryId ??
        cat.category_id,
      cat.subCategoryId ??
        cat.sub_category_id ??
        cat.subcategoryId ??
        cat.subcategory_id
    );
  }

  const nestedCategory = cat.category;
  const nestedSub =
    cat.subCategory ?? cat.subcategory ?? cat.sub_category ?? null;

  if (nestedCategory || nestedSub) {
    return normalizeCategoryPair(
      nestedCategory?.id ??
        nestedCategory?.categoryId ??
        nestedCategory?.category_id,
      nestedSub?.id ??
        nestedSub?.subcategoryId ??
        nestedSub?.sub_category_id
    );
  }

  const mainId = cat.id ?? cat.categoryId ?? cat.category_id;
  const explicitSubId =
    cat.subCategoryId ??
    cat.subcategoryId ??
    cat.sub_category_id ??
    cat.selectedSubCategoryId ??
    cat.selected_sub_category_id;

  const subs =
    cat.subCategories ??
    cat.subcategories ??
    cat.sub_categories ??
    cat.items ??
    [];

  if (explicitSubId != null && mainId != null) {
    return normalizeCategoryPair(mainId, explicitSubId);
  }

  if (Array.isArray(subs) && subs.length > 0) {
    const firstSub = subs[0];
    return normalizeCategoryPair(
      mainId,
      firstSub?.id ??
        firstSub?.subcategoryId ??
        firstSub?.sub_category_id ??
        firstSub?.subCategoryId
    );
  }

  return normalizeCategoryPair(mainId, cat.subCategoryId ?? cat.subcategoryId);
}

function extractCategoriesFromApi(raw = {}) {
  const sources = [
    raw.categories,
    raw.company_categories,
    raw.companyCategories,
    raw.category_mappings,
    raw.categoryMappings,
  ];

  for (const source of sources) {
    if (Array.isArray(source) && source.length) {
      return source;
    }
  }

  if (raw.category && typeof raw.category === "object") {
    return [raw.category];
  }

  return [];
}

function normalizeCategoriesForForm(raw = {}) {
  const categoriesRaw = extractCategoriesFromApi(raw);
  const rows = [];

  for (const cat of categoriesRaw) {
    if (!cat || typeof cat !== "object") continue;

    const subs =
      cat.subCategories ??
      cat.subcategories ??
      cat.sub_categories ??
      [];

    const hasExplicitPair =
      cat.mainCategoryId != null ||
      cat.main_category_id != null ||
      cat.subCategoryId != null ||
      cat.sub_category_id != null ||
      cat.categoryId != null ||
      cat.category_id != null ||
      cat.subcategoryId != null ||
      cat.subcategory_id != null ||
      cat.category != null ||
      cat.subCategory != null ||
      cat.subcategory != null;

    if (
      Array.isArray(subs) &&
      subs.length > 1 &&
      !hasExplicitPair &&
      (cat.id != null || cat.categoryId != null)
    ) {
      const mainId = cat.id ?? cat.categoryId ?? cat.category_id;
      for (const sub of subs) {
        rows.push(
          normalizeCategoryPair(
            mainId,
            sub?.id ?? sub?.subcategoryId ?? sub?.sub_category_id
          )
        );
      }
      continue;
    }

    rows.push(normalizeCategoryForForm(cat));
  }

  const filtered = rows.filter(
    (row) => row.mainCategoryId != null || row.subCategoryId != null
  );

  return filtered.length
    ? filtered
    : [{ mainCategoryId: undefined, subCategoryId: undefined }];
}

/**
 * Normalize company API/session user to a consistent app shape.
 * Keeps all original fields and adds normalized addresses/categories arrays.
 */
export function normalizeCompanyUser(raw = {}) {
  if (!raw || typeof raw !== "object") return {};

  const addresses = extractAddressesFromApi(raw).map(normalizeAddressForForm);
  const categories = normalizeCategoriesForForm(raw);

  return {
    ...raw,
    addresses: addresses.length
      ? addresses
      : Array.isArray(raw.addresses)
        ? raw.addresses
        : [],
    categories: categories.some((c) => c.mainCategoryId != null)
      ? categories
      : Array.isArray(raw.categories)
        ? raw.categories
        : categories,
  };
}

/** Map company API/session user to Ant Design form values. */
export function companyProfileFormValues(raw = {}) {
  const normalized = normalizeCompanyUser(raw);
  const addressesRaw = extractAddressesFromApi(normalized);

  const addresses = addressesRaw.length
    ? addressesRaw.map(normalizeAddressForForm)
    : [
        {
          id: 1,
          isPrimary: true,
          country: "",
          state: "",
          address: "",
          city: "",
          postal_code: "",
        },
      ];

  const categories = normalizeCategoriesForForm(normalized);

  const foundYear =
    normalized.found_year ??
    normalized.foundYear ??
    normalized.founded_year ??
    normalized.founded_in;
  let found_year;
  if (foundYear != null && foundYear !== "") {
    const yearNum = coerceYear(foundYear);
    if (yearNum) found_year = dayjs(String(yearNum), "YYYY");
  }

  const socialRaw = normalized.social_media ?? normalized.socialMedia ?? {};

  let contact_number =
    normalized.contact_number ??
    normalized.contactNumber ??
    normalized.phone ??
    "";
  const contact_country_code =
    normalized.contact_country_code ??
    normalized.contactCountryCode ??
    "";

  if (
    typeof contact_number === "string" &&
    contact_number.startsWith("+") &&
    !contact_country_code
  ) {
    const match = contact_number.match(/^(\+\d{1,4})(\d+)$/);
    if (match) {
      contact_number = match[2];
    }
  }

  return {
    name: normalized.name ?? "",
    title: normalized.title ?? "",
    email:
      normalized.email ??
      normalized.contact_email ??
      normalized.contactEmail ??
      "",
    username: normalized.username ?? "",
    contact_country_code,
    contact_number: String(contact_number).replace(/\D/g, "").slice(0, 15),
    addresses,
    categories,
    found_year,
    website_url: normalized.website_url ?? normalized.websiteUrl ?? "",
    about_company:
      normalized.about_company ??
      normalized.about ??
      normalized.aboutCompany ??
      normalized.description ??
      "",
    employees_count:
      normalized.employees_count ??
      normalized.employee_count ??
      normalized.employeesCount ??
      normalized.employeeCount ??
      "",
    turnover_currency:
      normalized.turnover_currency ?? normalized.turnoverCurrency ?? "",
    turnover: String(
      normalized.turnover ?? normalized.turnOver ?? normalized.turn_over ?? ""
    ),
    key_clients: normalized.key_clients ?? normalized.keyClients ?? "",
    logo_url: normalized.logo_url ?? normalized.logoUrl ?? "",
    social_media: {
      facebook: socialRaw.facebook ?? "",
      instagram: socialRaw.instagram ?? "",
      linkedin: socialRaw.linkedin ?? "",
    },
  };
}

/** Build PUT body for company profile update (matches registration payload shape). */
export function companyProfileToApiPayload(profile = {}) {
  const payload = { ...profile };

  if (payload.found_year != null) {
    const year = coerceYear(payload.found_year);
    if (year != null) payload.found_year = year;
    else delete payload.found_year;
  }

  delete payload.confirm_password;
  delete payload.password;
  delete payload.logo;

  if (Array.isArray(payload.addresses)) {
    payload.addresses = payload.addresses.map((addr) => ({
      isPrimary: !!addr?.isPrimary,
      country: addr?.country || "",
      state: addr?.state || "",
      location: addr?.location || addr?.address || "",
      city: addr?.city || "",
      postal_code: addr?.postal_code || "",
    }));
  }

  if (Array.isArray(payload.categories)) {
    payload.categories = payload.categories.map((cat) => ({
      mainCategoryId: coerceSelectId(cat?.mainCategoryId),
      subCategoryId: coerceSelectId(cat?.subCategoryId),
    }));
  }

  payload.social_media = {
    facebook: payload?.social_media?.facebook || "",
    instagram: payload?.social_media?.instagram || "",
    linkedin: payload?.social_media?.linkedin || "",
  };

  return payload;
}

function formatCategoryForView(cat, pair = {}) {
  if (!cat || typeof cat !== "object") {
    return {
      main:
        pair.mainCategoryId != null
          ? `Category (ID: ${pair.mainCategoryId})`
          : "—",
      sub:
        pair.subCategoryId != null
          ? `Subcategory (ID: ${pair.subCategoryId})`
          : "—",
    };
  }

  const mainName =
    cat.name ??
    cat.categoryName ??
    cat.title ??
    cat.category?.name ??
    cat.category?.categoryName;

  const nestedSub = cat.subCategory ?? cat.subcategory ?? cat.sub_category;
  let subName =
    nestedSub?.name ??
    nestedSub?.subcategoryName ??
    nestedSub?.title ??
    cat.subcategoryName ??
    cat.sub_category_name;

  const subs = cat.subCategories ?? cat.subcategories ?? cat.sub_categories ?? [];
  const explicitSubId =
    pair.subCategoryId ??
    cat.subCategoryId ??
    cat.subcategoryId ??
    cat.sub_category_id ??
    cat.selectedSubCategoryId;

  if (mainName && !subName && explicitSubId != null && Array.isArray(subs)) {
    const matched = subs.find(
      (sub) =>
        coerceSelectId(sub.id ?? sub.subcategoryId ?? sub.sub_category_id) ===
        coerceSelectId(explicitSubId)
    );
    subName = matched?.name ?? matched?.subcategoryName ?? matched?.title;
  }

  if (mainName && !subName && Array.isArray(subs) && subs.length === 1) {
    subName = subs[0]?.name ?? subs[0]?.subcategoryName ?? subs[0]?.title;
  }

  if (mainName && subName) {
    return { main: mainName, sub: subName };
  }

  if (mainName && Array.isArray(subs) && subs.length > 0) {
    const subNames = subs
      .map((sub) => sub?.name ?? sub?.subcategoryName ?? sub?.title)
      .filter(Boolean);
    return { main: mainName, sub: subNames.join(", ") || "—" };
  }

  if (mainName) {
    return { main: mainName, sub: "—" };
  }

  return {
    main:
      pair.mainCategoryId != null
        ? `Category (ID: ${pair.mainCategoryId})`
        : "—",
    sub:
      pair.subCategoryId != null
        ? `Subcategory (ID: ${pair.subCategoryId})`
        : "—",
  };
}

/** Human-readable category rows for profile view. */
export function companyProfileCategoriesForView(raw = {}) {
  const categoriesRaw = extractCategoriesFromApi(raw);
  const formCats = normalizeCategoriesForForm(raw).filter(
    (pair) => pair.mainCategoryId != null || pair.subCategoryId != null
  );

  if (!formCats.length) {
    return categoriesRaw.map((cat) => formatCategoryForView(cat));
  }

  return formCats.map((pair, idx) => {
    const rawCat = categoriesRaw[idx] ?? categoriesRaw[0];
    return formatCategoryForView(rawCat, pair);
  });
}

/** Display-ready company profile snapshot for read-only UI. */
export function companyProfileViewData(raw = {}) {
  const form = companyProfileFormValues(raw);

  const addresses = (form.addresses || []).map((addr, idx) => ({
    title: addr.isPrimary ? "Primary Business Address" : `Address ${idx + 1}`,
    isPrimary: !!addr.isPrimary,
    country: addr.country || "—",
    state: addr.state || "—",
    city: addr.city || "—",
    detailAddress: addr.address || "—",
    postalCode: addr.postal_code || "—",
  }));

  const categories = companyProfileCategoriesForView(raw);

  const foundYear = coerceYear(
    raw.found_year ?? raw.foundYear ?? raw.founded_year ?? raw.founded_in
  );

  const turnoverParts = [form.turnover_currency, form.turnover].filter(
    Boolean
  );
  const turnoverDisplay = turnoverParts.length ? turnoverParts.join(" ") : "—";

  const social = form.social_media || {};
  const socialLinks = [
    { label: "Facebook", url: social.facebook },
    { label: "Instagram", url: social.instagram },
    { label: "LinkedIn", url: social.linkedin },
  ].filter((link) => link.url);

  const contactParts = [form.contact_country_code, form.contact_number].filter(
    Boolean
  );

  return {
    name: form.name || "—",
    title: form.title || "—",
    email: form.email || "—",
    username: form.username || "—",
    contactDisplay: contactParts.length ? contactParts.join(" ") : "—",
    contactCountryCode: form.contact_country_code || "—",
    contactNumber: form.contact_number || "—",
    addresses,
    categories,
    foundYear: foundYear ? String(foundYear) : "—",
    websiteUrl: form.website_url || "",
    aboutCompany: form.about_company || "—",
    employeesCount: form.employees_count || "—",
    turnoverCurrency: form.turnover_currency || "—",
    turnover: form.turnover || "—",
    turnoverDisplay,
    keyClients: form.key_clients || "—",
    logoUrl: form.logo_url || "",
    socialLinks,
  };
}
