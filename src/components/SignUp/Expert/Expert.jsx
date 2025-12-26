"use client";

import React, { useState, useMemo, useCallback, memo } from "react";
import { Form, Input, message, Select, Divider, Space } from "antd";
import {
  map as _map,
  find as _find,
  isEmpty as _isEmpty,
  groupBy as _groupBy,
} from "lodash-es";
import Icon from "@/components/Icon";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import CountryDetails from "@/utilities/CountryDetails.json";
import ThankYouModal from "@/components/ThankYouModal";
import axiosPublicInstance from "@/utilities/axiosPublicInstance";
import { EXPERTS_DATA } from "@/module/Experts/constants/expertsConfig";

/**
 * ExpertRegistration Component
 *
 * A comprehensive expert registration form that handles:
 * - Personal information (name, email, contact)
 * - Address information (country, state, detailed address)
 * - Credentials (username auto-populated from email, password)
 * - Expertise field (dropdown with Marine Engineering as default)
 *
 * Features:
 * - Email automatically becomes username
 * - Dynamic state/province dropdown based on country selection
 * - Form validation with proper error messages
 * - Responsive design with Bootstrap grid system
 */
const ExpertRegistration = () => {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [form] = Form.useForm();
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for form submission

  // Expertise options for dropdown - grouped by category from EXPERTS_DATA
  const expertiseOptions = useMemo(() => {
    // Group experts by category
    const groupedByCategory = _groupBy(EXPERTS_DATA, "category");

    // Transform grouped data into optGroup format for Ant Design Select
    return _map(groupedByCategory, (experts, categoryName) => ({
      label: categoryName,
      options: _map(experts, (expert) => ({
        label: expert.name,
        value: expert.name,
      })),
    }));
  }, []);

  // ===== MEMOIZED DATA PROCESSING =====

  /**
   * Extract country names from CountryDetails JSON
   * Memoized to prevent unnecessary re-computation on every render
   */
  const countries = useMemo(
    () => _map(CountryDetails, (country) => country.countryName) || [],
    []
  );

  /**
   * Get selected country's detailed information
   * Used to determine available states/provinces
   */
  const selectedCountryData = useMemo(
    () =>
      _find(
        CountryDetails,
        (country) => country.countryName === selectedCountry
      ),
    [selectedCountry]
  );

  /**
   * Extract states/provinces for the selected country
   * Returns empty array if no country selected or no states available
   */
  const states = useMemo(
    () => (selectedCountryData ? selectedCountryData.states : []),
    [selectedCountryData]
  );

  /**
   * Format country options for contact number dropdown
   * Shows country name with dial code for easy selection
   */
  const countryOptions = useMemo(
    () =>
      _map(CountryDetails, (c) => ({
        label: (
          <span className="C-heading size-xs color-light mb-0">
            {c.countryName} ({c.dailCode})
          </span>
        ),
        value: c.dailCode,
      })),
    []
  );

  /**
   * Format country options for address country dropdown
   * Simple key-value pairs for country selection
   */
  const countrySelectOptions = useMemo(
    () =>
      _map(countries, (country) => ({
        label: country,
        value: country,
      })),
    [countries]
  );

  /**
   * Format state/province options for address dropdown
   * Only shows states for the currently selected country
   */
  const stateSelectOptions = useMemo(
    () =>
      _map(states, (state) => ({
        label: state,
        value: state,
      })),
    [states]
  );

  // ===== EVENT HANDLERS =====

  /**
   * Handle form submission
   * - Validates form fields
   * - Prepares payload (removes confirm_password)
   * - Makes POST request to expert registration API
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

      // Build payload according to API specification
      const payload = {
        first_name: allFields.first_name,
        last_name: allFields.last_name,
        email: allFields.email,
        contact_number: allFields.contact_number,
        contact_country_code: allFields.contact_country_code,
        username: allFields.username || allFields.email, // Use email as username if not set
        password: allFields.password,
        is_user_approved: false,
        expertise: allFields.expertise,
        address: {
          country: allFields.address?.country || "",
          state: allFields.address?.state || "",
          location: allFields.address?.location || "",
          city: allFields.address?.city || "",
          postal_code: allFields.address?.postal_code || "",
        },
        social_media: {
          facebook: allFields.social_media?.facebook || "",
          instagram: allFields.social_media?.instagram || "",
          linkedin: allFields.social_media?.linkedin || "",
        },
        subscription_plan: "Free",
        payment_details: {
          is_paid_user: false,
        },
        created_on: Date.now(),
      };

      // Log final payload before API call
      console.log("Expert Registration Payload:", payload);

      // Make POST request to expert registration API
      // Endpoint: /experts/register
      // Method: POST
      // Payload: Structured payload object
      // Using axiosPublicInstance (no credentials) to avoid CORS issues
      const response = await axiosPublicInstance.post(
        "/experts/register",
        payload
      );

      console.log("Expert Registration Response:", response);

      // Show success message
      message.success("Expert profile created successfully!");

      // Show thank you modal on successful registration
      setShowThankYouModal(true);
    } catch (err) {
      // Handle API errors
      // Ensure ThankYouModal is not shown on error
      setShowThankYouModal(false);

      // Extract error message from axios error
      let errorMessage = "Failed to create expert profile. Please try again.";

      if (err?.response?.data) {
        // API returned error response
        const errorData = err.response.data;
        errorMessage =
          errorData.message ||
          errorData.error ||
          errorData.detail ||
          errorMessage;
      } else if (err?.message) {
        // Axios error message
        errorMessage = err.message;
      }

      // Log error for debugging
      console.error("Expert registration error details:", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        error: err,
      });

      // Show error message to user
      message.error(errorMessage);
    } finally {
      // Reset loading state regardless of success or failure
      setIsSubmitting(false);
    }
  }, [form]);

  /**
   * Handle email field change
   * Automatically populates username field with email value
   * This ensures username is always the same as email
   */
  const handleEmailChange = useCallback(
    (e) => {
      const emailValue = e.target.value;
      // Set username field to match email (email field)
      form.setFieldsValue({
        username: emailValue,
      });
    },
    [form]
  );

  /**
   * Handle country selection change
   * Updates selected country and resets state/province field
   * This ensures state dropdown shows correct options for selected country
   */
  const handleCountryChange = useCallback(
    (value) => {
      setSelectedCountry(value);
      // Reset state field when country changes since states are country-specific
      form.setFieldsValue({
        address: {
          ...form.getFieldValue("address"),
          state: undefined,
        },
      });
    },
    [form]
  );

  return (
    <div className="">
      {/* Main Registration Form */}
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={onFinish}
        className="mb-4"
      >
        <div className="row justify-content-center">
          <div className="col-md-9 col-sm-12">
            <div className="p-3 pb-0">
              <div className="row g-3">
                {/* ===== PERSONAL INFORMATION SECTION ===== */}

                {/* First Name Field */}
                <div className="col-6">
                  <Form.Item
                    label={
                      <span className="C-heading size-6 semiBold color-light mb-0">
                        First Name
                      </span>
                    }
                    name="first_name"
                    rules={[
                      { required: true, message: "Please enter first name." },
                    ]}
                    className="mb-2"
                  >
                    <Input
                      placeholder="First name"
                      size="large"
                      prefix={<Icon name="person" isFilled color="#ccc" />}
                    />
                  </Form.Item>
                </div>

                {/* Last Name Field */}
                <div className="col-6">
                  <Form.Item
                    label={
                      <span className="C-heading size-6 semiBold color-light mb-0">
                        Last Name
                      </span>
                    }
                    name="last_name"
                    rules={[
                      { required: true, message: "Please enter last name." },
                    ]}
                    className="mb-2"
                  >
                    <Input
                      placeholder="Last name"
                      size="large"
                      prefix={<Icon name="person" isFilled color="#ccc" />}
                    />
                  </Form.Item>
                </div>

                {/* Email Field - Automatically populates username */}
                <div className="col-6">
                  <Form.Item
                    label={
                      <span className="C-heading size-6 semiBold color-light mb-0">
                        Email
                      </span>
                    }
                    name="email"
                    rules={[
                      { required: true, message: "Please enter email." },
                      { type: "email", message: "Please enter a valid email." },
                    ]}
                    className="mb-2"
                  >
                    <Input
                      placeholder="Email"
                      size="large"
                      prefix={<Icon name="mail" isFilled color="#ccc" />}
                      onChange={handleEmailChange}
                    />
                  </Form.Item>
                </div>

                {/* Expertise Field - Dropdown */}
                <div className="col-6">
                  <Form.Item
                    label={
                      <span className="C-heading size-6 semiBold color-light mb-0">
                        Expertise
                      </span>
                    }
                    name="expertise"
                    rules={[
                      { required: true, message: "Please select expertise." },
                    ]}
                    className="mb-2"
                  >
                    <Select
                      placeholder="Select Expertise"
                      size="large"
                      options={expertiseOptions}
                      prefix={<Icon name="work" isFilled color="#ccc" />}
                    />
                  </Form.Item>
                </div>

                {/* Contact Number Field - Split into country code and number */}
                <div className="col-12">
                  <Form.Item
                    label={
                      <span className="C-heading size-6 semiBold color-light mb-0">
                        Contact Number
                      </span>
                    }
                    required
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

                {/* ===== ADDRESS INFORMATION SECTION ===== */}
                <div className="col-12">
                  <Divider titlePlacement="left">
                    <span className="C-heading size-xss bold mb-0">
                      ADDRESS
                    </span>
                  </Divider>
                </div>

                {/* Country Selection Field */}
                <div className={`col-${_isEmpty(states) ? "12" : "6"}`}>
                  <Form.Item
                    label={
                      <span className="C-heading size-6 semiBold color-light mb-0">
                        Country
                      </span>
                    }
                    name={["address", "country"]}
                    rules={[
                      { required: true, message: "Please select a country." },
                    ]}
                    className="mb-2"
                  >
                    <Select
                      placeholder="Select Country"
                      size="large"
                      showSearch
                      optionFilterProp="label"
                      onChange={handleCountryChange}
                      filterOption={(input, option) =>
                        (option?.label || "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={countrySelectOptions}
                      prefix={<Icon name="public" isFilled color="#ccc" />}
                    />
                  </Form.Item>
                </div>

                {/* State/Province Field - Only shown if selected country has states */}
                {!_isEmpty(states) && (
                  <div className="col-6">
                    <Form.Item
                      label={
                        <span className="C-heading size-6 semiBold color-light mb-0">
                          State/Province
                        </span>
                      }
                      name={["address", "state"]}
                      rules={[
                        {
                          required: true,
                          message: "Please select a state/province.",
                        },
                        {
                          validator: (_, value) => {
                            if (
                              selectedCountry &&
                              selectedCountryData &&
                              selectedCountryData.states.length > 0 &&
                              !value
                            ) {
                              return Promise.reject(
                                new Error("Please select a state/province.")
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
                        disabled={!selectedCountry || states.length === 0}
                        filterOption={(input, option) =>
                          (option?.label || "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={stateSelectOptions}
                      />
                    </Form.Item>
                  </div>
                )}

                {/* Detailed Address Field */}
                <div className="col-12">
                  <Form.Item
                    label={
                      <span className="C-heading size-6 semiBold color-light mb-0">
                        Detail Address
                      </span>
                    }
                    name={["address", "location"]}
                    rules={[
                      { required: true, message: "Please enter address." },
                    ]}
                    className="mb-2"
                  >
                    <Input.TextArea
                      placeholder="Address"
                      size="large"
                      rows={3}
                      prefix={<Icon name="home_pin" />}
                    />
                  </Form.Item>
                </div>

                {/* City Field */}
                <div className="col-6">
                  <Form.Item
                    label={
                      <span className="C-heading size-6 semiBold color-light mb-0">
                        City
                      </span>
                    }
                    name={["address", "city"]}
                    rules={[{ required: true, message: "Please enter city." }]}
                    className="mb-2"
                  >
                    <Input
                      placeholder="City"
                      size="large"
                      prefix={
                        <Icon name="location_city" isFilled color="#ccc" />
                      }
                    />
                  </Form.Item>
                </div>

                {/* Postal Code / Pincode Field */}
                <div className="col-6">
                  <Form.Item
                    label={
                      <span className="C-heading size-6 semiBold color-light mb-0">
                        Postal Code / Pincode
                      </span>
                    }
                    name={["address", "postal_code"]}
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
                      prefix={<Icon name="pin_drop" isFilled color="#ccc" />}
                      maxLength={10}
                    />
                  </Form.Item>
                </div>

                {/* ===== SOCIAL MEDIA SECTION ===== */}
                <div className="col-12">
                  <Divider titlePlacement="left">
                    <span className="C-heading size-xss bold mb-0">
                      SOCIAL MEDIA
                    </span>
                  </Divider>
                </div>

                {/* Facebook Field */}
                <div className="col-12 col-md-6">
                  <Form.Item
                    label={
                      <span className="C-heading size-6 semiBold color-light mb-0">
                        Facebook
                      </span>
                    }
                    name={["social_media", "facebook"]}
                    className="mb-2"
                  >
                    <Input
                      placeholder="Facebook profile URL"
                      size="large"
                      prefix={<Icon name="link" isFilled color="#ccc" />}
                    />
                  </Form.Item>
                </div>

                {/* Instagram Field */}
                <div className="col-12 col-md-6">
                  <Form.Item
                    label={
                      <span className="C-heading size-6 semiBold color-light mb-0">
                        Instagram
                      </span>
                    }
                    name={["social_media", "instagram"]}
                    className="mb-2"
                  >
                    <Input
                      placeholder="Instagram profile URL"
                      size="large"
                      prefix={<Icon name="link" isFilled color="#ccc" />}
                    />
                  </Form.Item>
                </div>

                {/* LinkedIn Field */}
                <div className="col-12 col-md-6">
                  <Form.Item
                    label={
                      <span className="C-heading size-6 semiBold color-light mb-0">
                        LinkedIn
                      </span>
                    }
                    name={["social_media", "linkedin"]}
                    className="mb-2"
                  >
                    <Input
                      placeholder="LinkedIn profile URL"
                      size="large"
                      prefix={<Icon name="link" isFilled color="#ccc" />}
                    />
                  </Form.Item>
                </div>

                {/* ===== CREDENTIALS SECTION ===== */}
                <div className="col-12">
                  <Divider titlePlacement="left">
                    <span className="C-heading size-xss bold mb-0">
                      CREDENTIALS
                    </span>
                  </Divider>
                </div>

                {/* Username Field - Auto-populated from email */}
                <div className="col-12 col-md-6">
                  <Form.Item
                    label={
                      <span className="C-heading size-6 semiBold color-light mb-0">
                        Username
                      </span>
                    }
                    name="username"
                    rules={[
                      { required: true, message: "Please enter username." },
                    ]}
                    className="mb-2"
                  >
                    <Input
                      placeholder="Username (auto-filled from email)"
                      size="large"
                      prefix={<Icon name="person" isFilled color="#ccc" />}
                      readOnly
                      style={{
                        backgroundColor: "#f5f5f5",
                        cursor: "not-allowed",
                      }}
                    />
                  </Form.Item>
                </div>

                {/* Password Field - Strong password validation */}
                <div className="col-12 col-md-6">
                  <Form.Item
                    label={
                      <span className="C-heading size-6 semiBold color-light mb-0">
                        Password
                      </span>
                    }
                    name="password"
                    rules={[
                      { required: true, message: "Please enter password." },
                      {
                        pattern:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/,
                        message:
                          "Password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character, min 6 characters.",
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

                {/* Confirm Password Field - Must match password */}
                <div className="col-12 col-md-6">
                  <Form.Item
                    label={
                      <span className="C-heading size-6 semiBold color-light mb-0">
                        Confirm Password
                      </span>
                    }
                    name="confirm_password"
                    dependencies={["password"]}
                    rules={[
                      { required: true, message: "Please confirm password." },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Passwords do not match.")
                          );
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
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="text-center mt-4">
          <Space>
            <button
              className="C-button is-bordered"
              type="button"
              onClick={() => router.push(ROUTES?.PUBLIC.LOGIN)}
            >
              Cancel
            </button>
            <button
              className="C-button is-filled"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Profile..." : "Create Profile"}
            </button>
          </Space>
        </div>
      </Form>

      {/* Login Link Section */}
      <div className="text-center">
        <span className="C-heading size-xs semiBold mb-1">
          Already have account.? &nbsp;
          <button
            className="C-button is-link p-0 small underline bold"
            type="button"
            onClick={() => router.push(ROUTES?.PUBLIC.LOGIN)}
          >
            Login
          </button>
        </span>
      </div>

      {/* Thank You Modal */}
      <ThankYouModal
        isOpen={showThankYouModal}
        onClose={() => {
          setShowThankYouModal(false);
          router.push(ROUTES?.PUBLIC.LOGIN);
        }}
      />
    </div>
  );
};

export default memo(ExpertRegistration);
