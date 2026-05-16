/**
 * Ant Design form rules for profile edit — aligned with registration forms.
 */

const STATE_PATTERN = /^[A-Za-z\s]+$/;
const PHONE_PATTERN = /^\d{7,15}$/;
const POSTAL_PATTERN = /^\d{4,10}$/;
const TURNOVER_PATTERN = /^\d+(\.\d{1,2})?$/;

const requiredRule = (message) => ({ required: true, message });

const stateRules = (required) => {
  const rules = [];
  if (required) {
    rules.push(requiredRule("Please enter state/province."));
  }
  rules.push({
    pattern: required ? STATE_PATTERN : /^[A-Za-z\s]*$/,
    message: "Only alphabets and spaces are allowed.",
  });
  return rules;
};

const postalRules = (required) => {
  const rules = [];
  if (required) {
    rules.push(requiredRule("Please enter postal code/pincode."));
  }
  rules.push({
    pattern: POSTAL_PATTERN,
    message: "Postal code must be 4-10 digits.",
  });
  return rules;
};

const contactNumberRules = () => [
  requiredRule("Enter contact number"),
  {
    pattern: PHONE_PATTERN,
    message: "Enter a valid phone number (7-15 digits)",
  },
];

/** @param {import("@/components/Profile/profileSchemas").ProfileField} field */
const fieldKey = (field) => field.path.join("__");

const validateCompanyAddressesJson = (_, value) => {
  let addresses;
  try {
    addresses = value?.trim() ? JSON.parse(value) : [];
  } catch {
    return Promise.reject(new Error("Addresses must be valid JSON."));
  }
  if (!Array.isArray(addresses) || addresses.length === 0) {
    return Promise.reject(new Error("At least one address is required."));
  }
  const primary = addresses.find((a) => a?.isPrimary) || addresses[0];
  const location =
    primary?.location ?? primary?.address ?? "";
  const checks = [
    [primary?.country, "Country"],
    [primary?.state, "State/Province"],
    [location, "Detail address"],
    [primary?.city, "City"],
    [primary?.postal_code, "Postal code"],
  ];
  for (const [val, label] of checks) {
    if (!val || !String(val).trim()) {
      return Promise.reject(
        new Error(`Primary address: ${label} is required.`)
      );
    }
  }
  if (primary.state && !STATE_PATTERN.test(String(primary.state).trim())) {
    return Promise.reject(
      new Error("Primary address: only alphabets and spaces are allowed in state.")
    );
  }
  const postal = String(primary.postal_code || "").trim();
  if (postal && !POSTAL_PATTERN.test(postal)) {
    return Promise.reject(
      new Error("Primary address: postal code must be 4-10 digits.")
    );
  }
  return Promise.resolve();
};

const validateCompanyCategoriesJson = (_, value) => {
  let categories;
  try {
    categories = value?.trim() ? JSON.parse(value) : [];
  } catch {
    return Promise.reject(new Error("Categories must be valid JSON."));
  }
  if (!Array.isArray(categories) || categories.length === 0) {
    return Promise.reject(new Error("At least one category is required."));
  }
  for (let i = 0; i < categories.length; i += 1) {
    const row = categories[i] || {};
    if (!row.mainCategoryId) {
      return Promise.reject(
        new Error(`Category ${i + 1}: main category is required.`)
      );
    }
    if (!row.subCategoryId) {
      return Promise.reject(
        new Error(`Category ${i + 1}: subcategory is required.`)
      );
    }
  }
  return Promise.resolve();
};

const USER_EXPERT_RULES = {
  first_name: [requiredRule("Please enter first name.")],
  last_name: [requiredRule("Please enter last name.")],
  contact_country_code: [requiredRule("Select code")],
  contact_number: contactNumberRules(),
  address__country: [requiredRule("Please select a country.")],
  address__state: stateRules(true),
  address__location: [requiredRule("Please enter address.")],
  address__city: [requiredRule("Please enter city.")],
  address__postal_code: postalRules(true),
};

const COMPANY_RULES = {
  name: [requiredRule("Enter company name")],
  contact_country_code: [requiredRule("Select code")],
  contact_number: contactNumberRules(),
  about_company: [requiredRule("Please enter about company")],
  employees_count: [
    requiredRule("Please select employee count range"),
  ],
  turnover: [
    {
      pattern: TURNOVER_PATTERN,
      message: "Enter a valid amount (numbers only)",
    },
  ],
  addresses: [{ validator: validateCompanyAddressesJson }],
  categories: [{ validator: validateCompanyCategoriesJson }],
};

const RULES_BY_ROLE = {
  user: USER_EXPERT_RULES,
  expert: USER_EXPERT_RULES,
  company: COMPANY_RULES,
};

/**
 * @param {import("@/components/Profile/profileSchemas").ProfileField} field
 * @param {"user"|"expert"|"company"} role
 */
export function buildProfileFieldRules(field, role) {
  if (field.readOnly) {
    if (field.type === "digits") {
      return [
        {
          pattern: /^\d+$/,
          message: "Only numbers are allowed.",
        },
      ];
    }
    return undefined;
  }

  const roleRules = RULES_BY_ROLE[role] || RULES_BY_ROLE.user;
  const key = fieldKey(field);
  const mapped = roleRules[key];

  if (mapped) {
    return [...mapped];
  }

  if (field.type === "digits") {
    const last = field.path?.[field.path.length - 1];
    if (last === "postal_code") {
      return postalRules(false);
    }
    return [
      {
        pattern: /^\d+$/,
        message: "Only numbers are allowed.",
      },
    ];
  }

  const lastSegment = field.path?.[field.path.length - 1];
  if (lastSegment === "state" && field.path?.[0] === "address") {
    return stateRules(false);
  }

  if (field.type === "json") {
    return [{ validator: () => Promise.resolve() }];
  }

  return undefined;
}

/** Address rules for nested `address.*` Form.Items (BecomeExpertModal). */
export const EXPERT_ADDRESS_FORM_RULES = {
  country: [requiredRule("Please select a country.")],
  state: stateRules(true),
  city: [requiredRule("Please enter city.")],
  postal_code: postalRules(true),
  location: [requiredRule("Please enter address.")],
};

export const EXPERT_BASIC_FORM_RULES = {
  first_name: [requiredRule("Please enter first name.")],
  last_name: [requiredRule("Please enter last name.")],
  contact_country_code: [requiredRule("Select code")],
  contact_number: contactNumberRules(),
  expertise: [requiredRule("Please select expertise.")],
};
