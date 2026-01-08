import React, { useMemo, useState, useCallback, memo } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Steps,
  Space,
  message,
  Divider,
  DatePicker,
  Upload,
} from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { map as _map, find as _find, isEmpty as _isEmpty } from "lodash-es";
import Icon from "@/components/Icon";
import countryDetails from "@/utilities/CountryDetails.json";
import ThankYouModal from "@/components/ThankYouModal";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import axiosPublicInstance from "@/utilities/axiosPublicInstance";
import { useEffect } from "react";

const { TextArea } = Input;

const Company = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedEmail, setCapturedEmail] = useState(""); // Store email from step 0
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [categoriesData, setCategoriesData] = useState([
    { main: undefined, sub: undefined },
  ]);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for form submission
  const [logoPreview, setLogoPreview] = useState(null); // Preview image URL
  const [logoUploading, setLogoUploading] = useState(false); // Upload loading state
  const [categoriesList, setCategoriesList] = useState([]); // Categories from API
  const [categoriesLoading, setCategoriesLoading] = useState(false); // Loading state for categories
  const [subcategoriesMap, setSubcategoriesMap] = useState({}); // Map of categoryId -> subcategories
  const [subcategoriesLoading, setSubcategoriesLoading] = useState({}); // Loading state for subcategories

  // Memoize expensive calculations
  const countries = useMemo(
    () => _map(countryDetails, (country) => country.countryName) || [],
    []
  );

  const selectedCountryData = useMemo(
    () =>
      _find(
        countryDetails,
        (country) => country.countryName === selectedCountry
      ),
    [selectedCountry]
  );

  const states = useMemo(
    () => (selectedCountryData ? selectedCountryData.states : []),
    [selectedCountryData]
  );

  // Memoize country options for contact dropdown
  const countryOptions = useMemo(
    () =>
      _map(countryDetails, (c) => ({
        label: (
          <span className="C-heading size-xs color-light mb-0">
            {c.countryName} ({c.dailCode})
          </span>
        ),
        value: c.dailCode,
      })),
    []
  );

  const currencyOptions = useMemo(
    () =>
      _map(countryDetails, (c) => ({
        label: (
          <span className="C-heading size-xs color-light mb-0">
            {c.currencyCode} ({c.currencySymbol})
          </span>
        ),
        value: c.currencyCode,
      })),
    []
  );

  // Optimize country change handler
  const handleCountryChange = useCallback(
    (value, addressIndex) => {
      if (addressIndex !== undefined) {
        // For multiple addresses - just reset state for this specific address
        const addresses = form.getFieldValue("addresses") || [];
        addresses[addressIndex] = {
          ...addresses[addressIndex],
          state: undefined,
        };
        form.setFieldsValue({ addresses });
      } else {
        // For single address (backward compatibility)
        setSelectedCountry(value);
        form.setFieldsValue({
          address: {
            ...form.getFieldValue("address"),
            state: undefined,
          },
        });
      }
    },
    [form]
  );

  // --- Form Submit ---
  /**
   * Handle form submission
   * - Validates form fields
   * - Prepares payload (converts found_year, removes confirm_password)
   * - Makes POST request to company registration API
   * - Handles loading, success, and error states
   */
  const onFinish = useCallback(async () => {
    try {
      // Validate all form fields before submission
      await form.validateFields();

      // Set loading state to prevent multiple submissions
      setIsSubmitting(true);

      // Get all form values
      const allFields = form.getFieldsValue(true); // Include undefined values

      // Convert found_year from date string/object to year value (number)
      if (allFields.found_year) {
        if (typeof allFields.found_year === "string") {
          // Handle ISO date string like "2020-12-18T18:30:00.000Z"
          const year = new Date(allFields.found_year).getFullYear();
          allFields.found_year = isNaN(year) ? allFields.found_year : year;
        } else if (typeof allFields.found_year.year === "function") {
          // Handle dayjs/moment object
          allFields.found_year = allFields.found_year.year();
        } else if (typeof allFields.found_year.format === "function") {
          // Fallback: use format if year() doesn't exist
          allFields.found_year = parseInt(
            allFields.found_year.format("YYYY"),
            10
          );
        } else if (allFields.found_year instanceof Date) {
          // Handle Date object
          allFields.found_year = allFields.found_year.getFullYear();
        } else if (typeof allFields.found_year === "number") {
          // Already a number, keep it as is
          // No conversion needed
        }
      }

      // Remove confirm_password from payload (only used for frontend validation)
      delete allFields.confirm_password;

      // Add default paymentDetails object
      allFields.payment_details = {
        paidUser: false,
      };

      // Add subscription plan
      allFields.subscription_plan = "Free";

      console.log("=== COMPANY FORM SUBMISSION ===");
      console.log("Payload:", allFields);

      // Make POST request to company registration API (insecure/public endpoint)
      // Endpoint: /companies/register
      // Method: POST
      // Payload: All form values object
      const response = await axiosPublicInstance.post(
        "/companies/register",
        allFields
      );

      console.log("=== COMPANY REGISTRATION SUCCESS ===");
      console.log("Response:", response);

      // Show success message
      message.success("Company registered successfully!");

      // Show thank you modal on successful registration
      setShowThankYouModal(true);
    } catch (err) {
      // Handle API errors
      console.error("=== COMPANY REGISTRATION ERROR ===");
      console.error("Error:", err);

      // Ensure ThankYouModal is not shown on error
      setShowThankYouModal(false);

      // Extract error message from axios error
      // The axiosPublicInstance interceptor already formats errors, but we handle edge cases
      let errorMessage = "Failed to register company. Please try again.";

      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (typeof err?.response?.data === "string") {
        errorMessage = err.response.data;
      } else if (err?.response?.data) {
        // Handle validation errors or other structured error responses
        const errorData = err.response.data;
        if (Array.isArray(errorData)) {
          errorMessage = errorData.map((e) => e.message || e).join(", ");
        } else if (errorData.errors) {
          // Handle validation errors object
          const errors = Object.values(errorData.errors).flat();
          errorMessage = errors.join(", ");
        }
      }

      // Show error message to user
      message.error(errorMessage);
    } finally {
      // Reset loading state regardless of success or failure
      setIsSubmitting(false);
    }
  }, [form]);

  // --- Step Navigation ---
  const next = useCallback(async () => {
    try {
      if (currentStep === 0) {
        try {
          // Get addresses to build validation paths
          const addresses = form.getFieldValue("addresses") || [];

          if (!addresses.length) {
            message.error("Please add at least one address.");
            return;
          }

          // Build validation paths for all address fields
          const addressFieldsToValidate = [];
          addresses.forEach((_, index) => {
            addressFieldsToValidate.push(["addresses", index, "country"]);
            addressFieldsToValidate.push(["addresses", index, "address"]);
            addressFieldsToValidate.push(["addresses", index, "city"]);
            addressFieldsToValidate.push(["addresses", index, "postal_code"]);
            // State will be validated by its own rules if required
            addressFieldsToValidate.push(["addresses", index, "state"]);
          });

          // Validate all fields including nested address fields
          const values = await form.validateFields([
            "name",
            "title",
            "email",
            "contact_country_code",
            "contact_number",
            ...addressFieldsToValidate,
          ]);

          // Capture email from step 0
          setCapturedEmail(values.email);
        } catch (validationError) {
          console.error("Step 0 validation error:", validationError);
          // Ant Design will automatically display field-level validation errors
          return;
        }
      }
      if (currentStep === 1) {
        // Categories step - validate Form.List fields
        try {
          const categories = form.getFieldValue("categories") || [];

          if (!categories.length) {
            message.error("Please add at least one category.");
            return;
          }

          // Build validation paths for all category fields
          const categoryFieldsToValidate = [];
          categories.forEach((_, index) => {
            categoryFieldsToValidate.push(["categories", index, "main"]);
            categoryFieldsToValidate.push(["categories", index, "sub"]);
          });

          // Validate all category fields using Ant Design validation
          await form.validateFields(categoryFieldsToValidate);
        } catch (validationError) {
          console.error(
            "Step 1 (Categories) validation error:",
            validationError
          );
          // Ant Design will automatically display field-level validation errors
          return;
        }
      }
      if (currentStep === 2) {
        try {
          await form.validateFields([
            "website_url",
            "about_company",
            "employees_count",
            ["social_media", "facebook"],
            ["social_media", "instagram"],
            ["social_media", "linkedin"],
          ]);
        } catch (validationError) {
          console.error("Step 2 validation error:", validationError);
          return;
        }
      }
      if (currentStep === 3) {
        try {
          await form.validateFields([
            "username",
            "password",
            "confirm_password",
          ]);
          onFinish();
          return;
        } catch (validationError) {
          console.error("Step 3 validation error:", validationError);
          return;
        }
      }
      setCurrentStep(currentStep + 1);
    } catch (err) {
      console.error("Step navigation error:", err);
      console.error("Error details:", {
        message: err?.message,
        stack: err?.stack,
        currentStep,
        formValues: form.getFieldsValue(),
      });
      // Validation errors handled by AntD
    }
  }, [currentStep, form, onFinish]);

  const prev = useCallback(
    () => setCurrentStep(currentStep - 1),
    [currentStep]
  );

  // --- Logo Upload Handler ---
  /**
   * Handle logo file upload to S3
   * - Validates file type (png, jpg, webp)
   * - Uploads to S3 bucket via API
   * - Stores S3 path in form field
   * - Shows preview
   */
  const handleLogoUpload = useCallback(
    async (file) => {
      try {
        // Validate file type
        const isValidType =
          file.type === "image/png" ||
          file.type === "image/jpeg" ||
          file.type === "image/jpg" ||
          file.type === "image/webp";

        if (!isValidType) {
          message.error("You can only upload PNG, JPG, or WEBP files!");
          return false;
        }

        // Validate file size (max 5MB)
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
          message.error("Image must be smaller than 5MB!");
          return false;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload to S3
        setLogoUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "company-logo");

        // Upload to S3 via API endpoint
        // Assuming endpoint: /api/upload or /api/companies/upload-logo
        const response = await axiosPublicInstance.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Extract S3 path/URL from response
        // Adjust based on your API response structure
        const s3Path =
          response?.data?.url ||
          response?.data?.path ||
          response?.data?.location ||
          response?.data?.s3Path ||
          response?.data?.data?.url;

        if (s3Path) {
          // Set form field value with S3 path
          form.setFieldValue("logo_url", s3Path);
          message.success("Logo uploaded successfully!");
        } else {
          throw new Error("Upload response missing file path");
        }

        setLogoUploading(false);
        return false; // Prevent default upload behavior
      } catch (error) {
        console.error("Logo upload error:", error);
        setLogoUploading(false);
        setLogoPreview(null);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to upload logo. Please try again.";
        message.error(errorMessage);
        return false;
      }
    },
    [form]
  );

  /**
   * Handle logo removal
   */
  const handleLogoRemove = useCallback(() => {
    setLogoPreview(null);
    form.setFieldValue("logo_url", undefined);
  }, [form]);

  // --- Fetch Categories from API ---
  /**
   * Fetch all categories from API
   */
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      // axiosPublicInstance returns response.data directly
      const response = await axiosPublicInstance.get(
        "/categories/getAllCategories",
        {
          params: {
            page: 1,
            limit: 100, // Get all categories
            sortBy: "name",
            order: "asc",
          },
        }
      );

      // Extract categories from response
      // API response structure: { success: true, data: { items: [...] } }
      // axiosPublicInstance returns response.data directly, so response = { success: true, data: { items: [...] } }
      const categoriesData =
        response?.data?.items ||
        response?.items ||
        response?.categories ||
        response?.data?.categories ||
        (Array.isArray(response?.data) ? response.data : []) ||
        (Array.isArray(response) ? response : []);

      if (Array.isArray(categoriesData) && categoriesData.length > 0) {
        setCategoriesList(categoriesData);
        // Also populate subcategories map from nested data if available
        const subcatsMap = {};
        categoriesData.forEach((cat) => {
          if (
            cat.subCategories?.items &&
            Array.isArray(cat.subCategories.items)
          ) {
            subcatsMap[cat.id] = cat.subCategories.items;
          }
        });
        if (Object.keys(subcatsMap).length > 0) {
          setSubcategoriesMap((prev) => ({ ...prev, ...subcatsMap }));
        }
      } else {
        console.warn("No categories found in API response:", response);
        setCategoriesList([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error(
        error?.message || "Failed to load categories. Please try again."
      );
      setCategoriesList([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  /**
   * Fetch subcategories for a specific category
   */
  const fetchSubcategories = useCallback(
    async (categoryId) => {
      if (!categoryId) {
        return;
      }

      // Check if already loaded (including empty arrays)
      if (subcategoriesMap.hasOwnProperty(categoryId)) {
        return;
      }

      try {
        setSubcategoriesLoading((prev) => ({ ...prev, [categoryId]: true }));
        const response = await axiosPublicInstance.get(
          `/categories/${categoryId}/subcategories`,
          {
            params: {
              page: 1,
              limit: 100, // Get all subcategories
              sortBy: "name",
              order: "asc",
            },
          }
        );

        // Extract subcategories from response
        // API response structure: { success: true, data: { items: [...] } }
        // axiosPublicInstance returns response.data directly
        const subcategoriesData =
          response?.data?.items ||
          response?.items ||
          response?.subcategories ||
          response?.data?.subcategories ||
          (Array.isArray(response?.data) ? response.data : []) ||
          (Array.isArray(response) ? response : []);

        if (Array.isArray(subcategoriesData)) {
          setSubcategoriesMap((prev) => ({
            ...prev,
            [categoryId]: subcategoriesData,
          }));
        } else {
          // Set empty array if not an array
          setSubcategoriesMap((prev) => ({
            ...prev,
            [categoryId]: [],
          }));
        }
      } catch (error) {
        console.error(
          `Error fetching subcategories for category ${categoryId}:`,
          error
        );
        // Set empty array on error
        setSubcategoriesMap((prev) => ({
          ...prev,
          [categoryId]: [],
        }));
      } finally {
        setSubcategoriesLoading((prev) => ({
          ...prev,
          [categoryId]: false,
        }));
      }
    },
    [subcategoriesMap]
  );

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // --- Steps Content ---
  // Convert content to functions so Form.Item can access FormContext
  const steps = [
    {
      title: <span className="C-heading size-6 semiBold mt-2">Details</span>,
      icon: <Icon name="diversity_3" isFilled />,
      content: () => (
        <div className="row g-3">
          <div className="col-md-6 col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Company Name
                </span>
              }
              name="name"
              rules={[{ required: true, message: "Enter company name" }]}
              className="mb-2"
            >
              <Input
                placeholder="Company name"
                size="large"
                prefix={<Icon name="diversity_3" isFilled color="#ccc" />}
              />
            </Form.Item>
          </div>
          <div className="col-md-6 col-12">
            <Form.Item
              name="title"
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Company title
                </span>
              }
              className="mb-2"
              tooltip="As per company registration documents"
            >
              <Input
                placeholder="Company title"
                size="large"
                prefix={<Icon name="id_card" isFilled color="#ccc" />}
              />
            </Form.Item>
          </div>
          <div className="col-md-6 col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Company Email ID
                </span>
              }
              name="email"
              rules={[
                { required: true, message: "Enter email" },
                { type: "email", message: "Invalid email" },
              ]}
              className="mb-2"
            >
              <Input
                placeholder="Email"
                size="large"
                prefix={<Icon name="mail" isFilled color="#ccc" />}
              />
            </Form.Item>
          </div>
          <div className="col-md-6 col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Contact Number
                </span>
              }
              required
              className="mb-2"
            >
              <Space.Compact block>
                <Form.Item
                  name="contact_country_code"
                  noStyle
                  rules={[{ required: true, message: "Select code" }]}
                >
                  <Select
                    placeholder="Code"
                    size="large"
                    style={{ width: "30%" }}
                    options={countryOptions}
                  />
                </Form.Item>
                <Form.Item
                  name="contact_number"
                  noStyle
                  rules={[
                    { required: true, message: "Enter contact number" },
                    {
                      pattern: /^\d{7,15}$/,
                      message: "Enter a valid phone number (7-15 digits)",
                    },
                  ]}
                >
                  <Input
                    placeholder="Phone number"
                    size="large"
                    style={{ width: "70%" }}
                    prefix={<Icon name="phone" isFilled color="#ccc" />}
                  />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          </div>

          <div className="col-12">
            <Divider titlePlacement="left" styles={{ content: { margin: 0 } }}>
              <span className="C-heading size-xss extraBold color-light mb-0">
                ADDRESSES
              </span>
            </Divider>
          </div>

          <Form.List
            name="addresses"
            initialValue={[
              {
                id: 1,
                isPrimary: true,
                country: "",
                state: "",
                address: "",
                city: "",
                postal_code: "",
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, idx) => {
                  const addresses = form.getFieldValue("addresses") || [];
                  const currentAddress = addresses[idx];
                  const currentCountry = currentAddress?.country;
                  const currentCountryData = _find(
                    countryDetails,
                    (c) => c.countryName === currentCountry
                  );
                  const currentStates = currentCountryData
                    ? currentCountryData.states
                    : [];

                  return (
                    <div key={key}>
                      <div className="row g-3">
                        <div className="col-12">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="C-heading size-6 semiBold color-light mb-0">
                              {idx === 0
                                ? "Primary Business Address"
                                : `Address ${idx + 1}`}
                            </span>
                            {idx > 0 && (
                              <Button
                                type="text"
                                danger
                                size="small"
                                onClick={() => {
                                  remove(name);
                                }}
                                icon={<Icon name="delete" />}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>

                        <div
                          className={`col-${
                            _isEmpty(currentStates) ? "12" : "6"
                          }`}
                        >
                          <Form.Item
                            label={
                              <span className="C-heading size-6 semiBold color-light mb-0">
                                Country
                              </span>
                            }
                            {...restField}
                            name={[name, "country"]}
                            rules={[
                              {
                                required: true,
                                message: "Please select a country.",
                              },
                            ]}
                            className="mb-2"
                          >
                            <Select
                              placeholder="Select Country"
                              size="large"
                              showSearch
                              optionFilterProp="label"
                              onChange={(value) =>
                                handleCountryChange(value, idx)
                              }
                              filterOption={(input, option) => {
                                const labelText =
                                  typeof option?.label === "string"
                                    ? option.label
                                    : option?.label?.props?.children || "";
                                return String(labelText)
                                  .toLowerCase()
                                  .includes(input.toLowerCase());
                              }}
                              options={_map(countries, (country) => ({
                                label: (
                                  <span className="C-heading size-6 semiBold mb-0">
                                    {country}
                                  </span>
                                ),
                                value: country,
                              }))}
                            />
                          </Form.Item>
                        </div>

                        {!_isEmpty(currentStates) && (
                          <div className="col-6">
                            <Form.Item
                              label={
                                <span className="C-heading size-6 semiBold color-light mb-0">
                                  State/Province
                                </span>
                              }
                              {...restField}
                              name={[name, "state"]}
                              rules={[
                                {
                                  validator: (_, value) => {
                                    if (
                                      currentCountry &&
                                      currentCountryData &&
                                      currentCountryData.states.length > 0 &&
                                      !value
                                    ) {
                                      return Promise.reject(
                                        new Error(
                                          "Please select a state/province."
                                        )
                                      );
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]}
                              className="mb-2"
                            >
                              <Select
                                placeholder="Select State/Province"
                                size="large"
                                showSearch
                                optionFilterProp="label"
                                disabled={
                                  !currentCountry || currentStates.length === 0
                                }
                                filterOption={(input, option) => {
                                  const labelText =
                                    typeof option?.label === "string"
                                      ? option.label
                                      : option?.label?.props?.children || "";
                                  return String(labelText)
                                    .toLowerCase()
                                    .includes(input.toLowerCase());
                                }}
                                options={_map(currentStates, (state) => ({
                                  label: (
                                    <span className="C-heading size-6 semiBold mb-0">
                                      {state}
                                    </span>
                                  ),
                                  value: state,
                                }))}
                              />
                            </Form.Item>
                          </div>
                        )}

                        <div className="col-12">
                          <Form.Item
                            label={
                              <span className="C-heading size-6 semiBold color-light mb-0">
                                Detail Address
                              </span>
                            }
                            {...restField}
                            name={[name, "address"]}
                            rules={[
                              {
                                required: true,
                                message: "Please enter address.",
                              },
                            ]}
                            className="mb-2"
                          >
                            <Input.TextArea
                              placeholder="Address"
                              size="large"
                              rows={2}
                            />
                          </Form.Item>
                        </div>

                        <div className="col-6">
                          <Form.Item
                            label={
                              <span className="C-heading size-6 semiBold color-light mb-0">
                                City
                              </span>
                            }
                            {...restField}
                            name={[name, "city"]}
                            rules={[
                              {
                                required: true,
                                message: "Please enter city.",
                              },
                            ]}
                            className="mb-2"
                          >
                            <Input
                              placeholder="City"
                              size="large"
                              prefix={
                                <Icon
                                  name="location_city"
                                  isFilled
                                  color="#ccc"
                                />
                              }
                            />
                          </Form.Item>
                        </div>

                        <div className="col-6">
                          <Form.Item
                            label={
                              <span className="C-heading size-6 semiBold color-light mb-0">
                                Postal Code / Pincode
                              </span>
                            }
                            {...restField}
                            name={[name, "postal_code"]}
                            rules={[
                              {
                                required: true,
                                message: "Please enter postal code/pincode.",
                              },
                              {
                                pattern: /^\d{4,10}$/,
                                message: "Postal code must be 4-10 digits.",
                              },
                            ]}
                            className="mb-2"
                          >
                            <Input
                              placeholder="Postal Code / Pincode"
                              size="large"
                              prefix={
                                <Icon name="pin_drop" isFilled color="#ccc" />
                              }
                              maxLength={10}
                            />
                          </Form.Item>
                        </div>

                        <Form.Item {...restField} name={[name, "id"]} hidden>
                          <Input />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "isPrimary"]}
                          hidden
                        >
                          <Input />
                        </Form.Item>
                      </div>

                      {idx < fields.length - 1 && (
                        <div className="col-12 mb-3">
                          <Divider />
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="col-12">
                  <Button
                    type="dashed"
                    onClick={() => {
                      const addresses = form.getFieldValue("addresses") || [];
                      const newId =
                        Math.max(...addresses.map((addr) => addr.id || 0)) + 1;
                      add({
                        id: newId,
                        isPrimary: false,
                        country: "",
                        state: "",
                        address: "",
                        city: "",
                        postal_code: "",
                      });
                    }}
                    block
                    icon={<Icon name="add" />}
                    className="mt-2"
                  >
                    Add Another Address
                  </Button>
                </div>
              </>
            )}
          </Form.List>
          {/* <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Upload logo
                </span>
              }
              name="logo"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
              rules={[{ required: true, message: "Upload logo" }]}
            >
              <Dragger {...logoUploadProps}>
                <Icon name="upload" isFilled className="mb-2 color-primary" />
                <span className="C-heading size-6 mb-2">
                  Click or drag file to upload
                </span>
                <span className="C-heading size-xs mb-0">
                  File Format: <strong>JPG, PNG &lt; 2MB</strong>
                </span>
              </Dragger>
            </Form.Item>
          </div> */}
        </div>
      ),
    },
    {
      title: <span className="C-heading size-6 semiBold mt-2">Categories</span>,
      icon: <Icon name="format_list_numbered" isFilled />,
      content: () => (
        <Form.List name="categories">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, idx) => {
                const values = form.getFieldValue("categories") || [];
                const currentMainCategory = values[idx]?.main;

                return (
                  <div className="row g-2 align-items-center" key={key}>
                    <div className="col-md-5">
                      <Form.Item
                        {...restField}
                        name={[name, "main"]}
                        rules={[{ required: true, message: "Select category" }]}
                        label={
                          <span className="C-heading size-xs semiBold color-light mb-0">
                            Category
                          </span>
                        }
                      >
                        <Select
                          placeholder="Main Category"
                          size="large"
                          loading={categoriesLoading}
                          notFoundContent={
                            categoriesLoading
                              ? "Loading..."
                              : "No categories found"
                          }
                          onChange={(value) => {
                            // Clear subcategory when main category changes
                            form.setFieldValue(
                              ["categories", name, "sub"],
                              undefined
                            );
                            // Update local state to trigger re-render
                            const newValues = [...values];
                            newValues[idx] = { main: value, sub: undefined };
                            setCategoriesData(newValues);
                            // Fetch subcategories for the selected category if not already loaded
                            if (value && !subcategoriesMap[value]) {
                              // Check if category has nested subcategories
                              const selectedCategory = categoriesList.find(
                                (cat) => cat.id === value
                              );
                              if (
                                selectedCategory?.subCategories?.items &&
                                Array.isArray(
                                  selectedCategory.subCategories.items
                                )
                              ) {
                                // Use nested subcategories
                                setSubcategoriesMap((prev) => ({
                                  ...prev,
                                  [value]: selectedCategory.subCategories.items,
                                }));
                              } else {
                                // Fetch from API
                                fetchSubcategories(value);
                              }
                            }
                          }}
                          options={categoriesList.map((cat) => ({
                            label: cat.name || cat.title || cat.categoryName,
                            value: cat.id || cat.categoryId,
                            disabled: values.some(
                              (c, i) =>
                                i !== idx &&
                                (c?.main === cat.id ||
                                  c?.main === cat.categoryId)
                            ),
                          }))}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-md-5">
                      <Form.Item
                        {...restField}
                        name={[name, "sub"]}
                        rules={[
                          { required: true, message: "Select subcategory" },
                        ]}
                        label={
                          <span className="C-heading size-xs semiBold color-light mb-0">
                            Sub category
                          </span>
                        }
                      >
                        <Select
                          placeholder="Subcategory"
                          size="large"
                          disabled={!currentMainCategory}
                          loading={subcategoriesLoading[currentMainCategory]}
                          notFoundContent={
                            subcategoriesLoading[currentMainCategory]
                              ? "Loading..."
                              : !currentMainCategory
                              ? "Select a category first"
                              : "No subcategories found"
                          }
                          key={currentMainCategory} // Force re-render when main category changes
                          options={
                            currentMainCategory &&
                            subcategoriesMap[currentMainCategory]
                              ? subcategoriesMap[currentMainCategory].map(
                                  (sub) => ({
                                    label:
                                      sub.name ||
                                      sub.subcategoryName ||
                                      sub.title,
                                    value:
                                      sub.id ||
                                      sub.subcategoryId ||
                                      sub.name ||
                                      sub.subcategoryName,
                                    disabled: values.some(
                                      (c, i2) =>
                                        i2 !== idx &&
                                        (c?.sub === sub.id ||
                                          c?.sub === sub.subcategoryId ||
                                          c?.sub === sub.name ||
                                          c?.sub === sub.subcategoryName)
                                    ),
                                  })
                                )
                              : []
                          }
                        />
                      </Form.Item>
                    </div>
                    <div className="col-md-2">
                      {fields.length > 1 && (
                        <button
                          className="C-settingButton small mt-1"
                          onClick={() => remove(name)}
                        >
                          <Icon name="remove" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <Form.Item className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    add();
                    setCategoriesData([
                      ...categoriesData,
                      { main: undefined, sub: undefined },
                    ]);
                  }}
                  className="C-button is-link small"
                >
                  <Space>
                    <Icon name="add" isFilled />
                    Add Category
                  </Space>
                </button>
              </Form.Item>
            </>
          )}
        </Form.List>
      ),
    },
    {
      title: <span className="C-heading size-6 semiBold mt-2">Statistics</span>,
      icon: <Icon name="groups" isFilled />,
      content: () => (
        <div className="row g-3">
          <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Found Year
                </span>
              }
              name="found_year"
              className="mb-2"
            >
              <DatePicker picker="year" size="large" />
            </Form.Item>
          </div>
          <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Website URL
                </span>
              }
              name="website_url"
              className="mb-2"
            >
              <Input
                placeholder="Website URL"
                size="large"
                prefix={<Icon name="http" isFilled color="#ccc" />}
              />
            </Form.Item>
          </div>
          <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  About company
                </span>
              }
              name="about_company"
              className="mb-2"
            >
              <TextArea rows={3} placeholder="About company" size="large" />
            </Form.Item>
          </div>
          <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Employee count
                </span>
              }
              name="employees_count"
              className="mb-2"
            >
              <Input
                placeholder="Employees count"
                size="large"
                prefix={<Icon name="groups" isFilled color="#ccc" />}
              />
            </Form.Item>
          </div>
          <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Turnover
                </span>
              }
              className="mb-0"
            >
              <Space.Compact block>
                <Form.Item name="turnover_currency" noStyle>
                  <Select
                    placeholder="Currency"
                    size="large"
                    style={{ width: "30%" }}
                    options={currencyOptions}
                    filterOption={(input, option) => {
                      const labelText =
                        typeof option?.label === "string"
                          ? option.label
                          : option?.label?.props?.children || "";
                      return labelText
                        .toLowerCase()
                        .includes(input.toLowerCase());
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="turnover"
                  noStyle
                  rules={[
                    {
                      pattern: /^\d+(\.\d{1,2})?$/,
                      message: "Enter a valid amount (numbers only)",
                    },
                  ]}
                >
                  <Input
                    placeholder="Amount"
                    size="large"
                    style={{ width: "70%" }}
                    prefix={<Icon name="paid" isFilled color="#ccc" />}
                  />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          </div>
          <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Key Clients
                </span>
              }
              name="key_clients"
              className="mb-2"
            >
              <TextArea rows={3} placeholder="Enter key clients" size="large" />
            </Form.Item>
          </div>
          <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Company Logo
                  <span
                    className="text-muted ms-1"
                    style={{ fontSize: "12px" }}
                  >
                    (Optional)
                  </span>
                </span>
              }
              name="logo_url"
              className="mb-2"
            >
              <div>
                {logoPreview && (
                  <div
                    style={{
                      marginBottom: 16,
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      style={{
                        maxWidth: "200px",
                        maxHeight: "200px",
                        borderRadius: "8px",
                        border: "1px solid #d9d9d9",
                        padding: "8px",
                        backgroundColor: "#fff",
                      }}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleLogoRemove}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
                <Upload
                  name="logo"
                  beforeUpload={handleLogoUpload}
                  showUploadList={false}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  disabled={logoUploading}
                >
                  <Button
                    icon={<UploadOutlined />}
                    loading={logoUploading}
                    size="large"
                    block
                  >
                    {logoUploading
                      ? "Uploading..."
                      : logoPreview
                      ? "Change Logo"
                      : "Upload Company Logo"}
                  </Button>
                </Upload>
                <div
                  className="mt-2"
                  style={{ fontSize: "12px", color: "#8c8c8c" }}
                >
                  Supported formats: PNG, JPG, WEBP (Max 5MB)
                </div>
              </div>
            </Form.Item>
          </div>

          <div className="col-12">
            <Divider titlePlacement="left" styles={{ content: { margin: 0 } }}>
              <span className="C-heading size-xss extraBold color-light mb-0">
                SOCIAL MEDIA
              </span>
            </Divider>
          </div>

          <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Facebook Link
                </span>
              }
              name={["social_media", "facebook"]}
              className="mb-2"
            >
              <Input
                placeholder="Facebook URL"
                size="large"
                prefix={<FacebookOutlined style={{ color: "#ccc" }} />}
              />
            </Form.Item>
          </div>

          <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Instagram Link
                </span>
              }
              name={["social_media", "instagram"]}
              className="mb-2"
            >
              <Input
                placeholder="Instagram URL"
                size="large"
                prefix={<InstagramOutlined style={{ color: "#ccc" }} />}
              />
            </Form.Item>
          </div>

          <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  LinkedIn Link
                </span>
              }
              name={["social_media", "linkedin"]}
              className="mb-2"
            >
              <Input
                placeholder="LinkedIn URL"
                size="large"
                prefix={<LinkedinOutlined style={{ color: "#ccc" }} />}
              />
            </Form.Item>
          </div>
        </div>
      ),
    },

    {
      title: <span className="C-heading size-6 semiBold mt-2">Password</span>,
      icon: <Icon name="passkey" isFilled />,
      content: () => (
        <div className="row g-3">
          <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Username
                </span>
              }
              name="username"
              rules={[{ required: true, message: "Enter username" }]}
              className="mb-2"
              initialValue={capturedEmail}
            >
              <Input
                placeholder="Username (auto-filled from email)"
                size="large"
                prefix={<Icon name="person" isFilled color="#ccc" />}
                readOnly
                value={capturedEmail}
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </Form.Item>
          </div>
          <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Password
                </span>
              }
              name="password"
              rules={[
                { required: true, message: "Enter password" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/,
                  message:
                    "Must contain uppercase, lowercase, number, special char, min 6 chars",
                },
              ]}
              className="mb-2"
            >
              <Input.Password
                placeholder="Password"
                size="large"
                prefix={<Icon name="passkey" isFilled color="#ccc" />}
              />
            </Form.Item>
          </div>
          <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Confirm Password
                </span>
              }
              name="confirm_password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Confirm password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
              className="mb-2"
            >
              <Input.Password
                placeholder="Confirm Password"
                size="large"
                prefix={<Icon name="passkey" isFilled color="#ccc" />}
              />
            </Form.Item>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Progress Steps */}
      <div className="row justify-content-center">
        <div className="col-md-12 d-none d-md-block">
          <Steps
            current={currentStep}
            className="formSteps mb-5"
            items={steps}
          />
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        initialValues={{
          categories: [{ main: undefined, sub: undefined }],
          contact_country_code: "+91",
        }}
      >
        {/* Step Content */}
        <div className="row justify-content-center">
          <div className="col-md-10 col-sm-12">
            <div className="p-3 pb-0">
              {typeof steps[currentStep]?.content === "function"
                ? steps[currentStep].content()
                : steps[currentStep]?.content}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-3">
          {currentStep > 0 && (
            <Button
              onClick={prev}
              className="C-button is-bordered"
              style={{ marginRight: 8 }}
            >
              Previous
            </Button>
          )}
          <Button
            type="primary"
            className="C-button is-filled"
            onClick={next}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {currentStep === steps.length - 1 ? "Register" : "Next"}
          </Button>
        </div>
      </Form>

      {/* Thank You Modal */}
      <ThankYouModal
        isOpen={showThankYouModal}
        onClose={() => {
          setShowThankYouModal(false);
          router.push(ROUTES?.PUBLIC.LOGIN);
        }}
      />
    </>
  );
};

export default memo(Company);
