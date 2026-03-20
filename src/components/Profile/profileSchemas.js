export const PROFILE_SCHEMAS = {
  user: [
    {
      title: "Basic Information",
      fields: [
        { path: ["first_name"], label: "First Name" },
        { path: ["last_name"], label: "Last Name" },
        { path: ["email"], label: "Email", type: "email", readOnly: true },
        { path: ["username"], label: "Username", readOnly: true },
        { path: ["contact_country_code"], label: "Country Code" },
        { path: ["contact_number"], label: "Contact Number" },
      ],
    },
    {
      title: "Address",
      fields: [
        { path: ["address", "country"], label: "Country" },
        { path: ["address", "state"], label: "State" },
        { path: ["address", "city"], label: "City" },
        { path: ["address", "location"], label: "Location" },
        { path: ["address", "postal_code"], label: "Postal Code" },
      ],
    },
    {
      title: "Social Media",
      fields: [
        { path: ["social_media", "facebook"], label: "Facebook" },
        { path: ["social_media", "instagram"], label: "Instagram" },
        { path: ["social_media", "linkedin"], label: "LinkedIn" },
      ],
    },
  ],
  company: [
    {
      title: "Company Details",
      fields: [
        { path: ["name"], label: "Company Name" },
        { path: ["title"], label: "Company Title" },
        { path: ["email"], label: "Email", type: "email", readOnly: true },
        { path: ["username"], label: "Username", readOnly: true },
        { path: ["contact_country_code"], label: "Country Code" },
        { path: ["contact_number"], label: "Contact Number" },
        { path: ["found_year"], label: "Found Year" },
        { path: ["website_url"], label: "Website URL" },
        { path: ["about_company"], label: "About Company", type: "textarea" },
        { path: ["employees_count"], label: "Employees Count" },
        { path: ["turnover_currency"], label: "Turnover Currency" },
        { path: ["turnover"], label: "Turnover" },
        { path: ["key_clients"], label: "Key Clients", type: "textarea" },
      ],
    },
    {
      title: "Addresses",
      fields: [{ path: ["addresses"], label: "Addresses (JSON)", type: "json" }],
    },
    {
      title: "Categories",
      fields: [{ path: ["categories"], label: "Categories (JSON)", type: "json" }],
    },
    {
      title: "Social Media",
      fields: [
        { path: ["social_media", "facebook"], label: "Facebook" },
        { path: ["social_media", "instagram"], label: "Instagram" },
        { path: ["social_media", "linkedin"], label: "LinkedIn" },
      ],
    },
  ],
};

