/**
 * @typedef {Object} ProfileField
 * @property {string[]} path
 * @property {string} label
 * @property {string} [type]
 * @property {boolean} [readOnly]
 * @property {number} [maxLength]
 */

export const PROFILE_SCHEMAS = {
  user: [
    {
      title: "Basic Information",
      fields: [
        { path: ["first_name"], label: "First Name", required: true },
        { path: ["last_name"], label: "Last Name", required: true },
        { path: ["email"], label: "Email", type: "email", readOnly: true },
        { path: ["username"], label: "Username", readOnly: true },
        { path: ["contact_country_code"], label: "Country Code", required: true },
        {
          path: ["contact_number"],
          label: "Contact Number",
          type: "digits",
          maxLength: 15,
          required: true,
        },
      ],
    },
    {
      title: "Address",
      fields: [
        { path: ["address", "country"], label: "Country", required: true },
        { path: ["address", "state"], label: "State", required: true },
        { path: ["address", "city"], label: "City", required: true },
        { path: ["address", "location"], label: "Location", required: true },
        {
          path: ["address", "postal_code"],
          label: "Postal Code",
          type: "digits",
          maxLength: 10,
          required: true,
        },
      ],
    },
  ],
  company: [
    {
      title: "Company Details",
      fields: [
        { path: ["name"], label: "Company Name", required: true },
        { path: ["title"], label: "Company Title" },
        { path: ["email"], label: "Email", type: "email", readOnly: true },
        { path: ["username"], label: "Username", readOnly: true },
        { path: ["contact_country_code"], label: "Country Code", required: true },
        {
          path: ["contact_number"],
          label: "Contact Number",
          type: "digits",
          maxLength: 15,
          required: true,
        },
        { path: ["found_year"], label: "Found Year" },
        { path: ["website_url"], label: "Website URL" },
        {
          path: ["about_company"],
          label: "About Company",
          type: "textarea",
          required: true,
        },
        {
          path: ["employees_count"],
          label: "Employees Count",
          type: "employeeCount",
          required: true,
        },
        { path: ["turnover_currency"], label: "Turnover Currency" },
        { path: ["turnover"], label: "Turnover" },
        { path: ["key_clients"], label: "Key Clients", type: "textarea" },
      ],
    },
    {
      title: "Addresses",
      fields: [
        {
          path: ["addresses"],
          label: "Addresses (JSON)",
          type: "json",
          required: true,
        },
      ],
    },
    {
      title: "Categories",
      fields: [
        {
          path: ["categories"],
          label: "Categories (JSON)",
          type: "json",
          required: true,
        },
      ],
    },
  ],
  /** Same core fields as user; work/education/skills are shown in `ExpertCareerSection`. */
  expert: [
    {
      title: "Basic Information",
      fields: [
        { path: ["first_name"], label: "First Name", required: true },
        { path: ["last_name"], label: "Last Name", required: true },
        { path: ["email"], label: "Email", type: "email", readOnly: true },
        { path: ["username"], label: "Username", readOnly: true },
        { path: ["contact_country_code"], label: "Country Code", required: true },
        {
          path: ["contact_number"],
          label: "Contact Number",
          type: "digits",
          maxLength: 15,
          required: true,
        },
      ],
    },
    {
      title: "Address",
      fields: [
        { path: ["address", "country"], label: "Country", required: true },
        { path: ["address", "state"], label: "State", required: true },
        { path: ["address", "city"], label: "City", required: true },
        { path: ["address", "location"], label: "Location", required: true },
        {
          path: ["address", "postal_code"],
          label: "Postal Code",
          type: "digits",
          maxLength: 10,
          required: true,
        },
      ],
    },
  ],
};

