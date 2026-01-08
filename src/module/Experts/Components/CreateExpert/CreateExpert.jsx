"use client";

import { Form, Input, Space, Spin, Select, Divider } from "antd";
import React, { useCallback, useEffect, useMemo, memo, useState } from "react";
import PropTypes from "prop-types";
import {
  map as _map,
  find as _find,
  isEmpty as _isEmpty,
  groupBy as _groupBy,
} from "lodash-es";
import Icon from "@/components/Icon";
import CountryDetails from "@/utilities/CountryDetails.json";
import { EXPERTS_DATA } from "../../constants/expertsConfig";

/**
 * CreateExpert Component (Edit Only)
 *
 * Form component for editing experts in admin panel.
 * Matches the expert signup form structure exactly (signup?for=expert).
 *
 * Features:
 * - Pre-populates form when editing existing experts
 * - Loading state with spinner during API operations
 * - Form validation with required field checks
 * - All fields match signup form structure
 *
 * @param {Object} props - Component props
 * @param {Object|null} props.selectedExpert - Expert being edited (required for edit mode)
 * @param {string} props.modalMode - Mode: "expert"
 * @param {Function} props.onCancel - Handler for cancel button click
 * @param {Function} props.onSubmit - Handler for form submission
 * @param {boolean} props.loading - Loading state (shows spinner and disables buttons)
 */
const CreateExpert = memo(
  ({ selectedExpert, modalMode, onCancel, onSubmit, loading = false }) => {
    const [form] = Form.useForm();
    const [selectedCountry, setSelectedCountry] = useState(null);

    // Expertise options for dropdown - grouped by category from EXPERTS_DATA
    const expertiseOptions = useMemo(() => {
      const groupedByCategory = _groupBy(EXPERTS_DATA, "category");
      return _map(groupedByCategory, (experts, categoryName) => ({
        label: categoryName,
        options: _map(experts, (expert) => ({
          label: expert.name,
          value: expert.name,
        })),
      }));
    }, []);

    // Country and state options
    const countries = useMemo(
      () => _map(CountryDetails, (country) => country.countryName) || [],
      []
    );

    const selectedCountryData = useMemo(
      () =>
        _find(
          CountryDetails,
          (country) => country.countryName === selectedCountry
        ),
      [selectedCountry]
    );

    const states = useMemo(
      () => (selectedCountryData ? selectedCountryData.states : []),
      [selectedCountryData]
    );

    const countrySelectOptions = useMemo(
      () =>
        _map(countries, (country) => ({
          label: country,
          value: country,
        })),
      [countries]
    );

    const stateSelectOptions = useMemo(
      () =>
        _map(states, (state) => ({
          label: state,
          value: state,
        })),
      [states]
    );

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
     * Handle country selection change
     */
    const handleCountryChange = useCallback(
      (value) => {
        setSelectedCountry(value);
        form.setFieldsValue({
          address: {
            ...form.getFieldValue("address"),
            state: undefined,
          },
        });
      },
      [form]
    );

    /**
     * Update form fields when selectedExpert changes
     * Only resets form when expert changes, not on every render
     */
    useEffect(() => {
      if (selectedExpert) {
        // Split name into first_name and last_name
        const nameParts = (selectedExpert.name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Set selected country for state dropdown
        if (selectedExpert.address?.country) {
          setSelectedCountry(selectedExpert.address.country);
        }

        // Pre-populate form with existing data
        // Use setFieldsValue instead of resetFields to preserve user input on error
        form.setFieldsValue({
          first_name: selectedExpert.firstName || firstName,
          last_name: selectedExpert.lastName || lastName,
          email: selectedExpert.email || "",
          expertise: selectedExpert.expertise || "",
          contact_country_code: selectedExpert.contactCountryCode || "",
          contact_number: selectedExpert.contactNumber || "",
          address: {
            country:
              selectedExpert.address?.country || selectedExpert.country || "",
            state: selectedExpert.address?.state || selectedExpert.state || "",
            location: selectedExpert.address?.location || "",
            city: selectedExpert.address?.city || selectedExpert.city || "",
            postal_code: selectedExpert.address?.postal_code || "",
          },
          social_media: {
            facebook: selectedExpert.socialMedia?.facebook || "",
            instagram: selectedExpert.socialMedia?.instagram || "",
            linkedin: selectedExpert.socialMedia?.linkedin || "",
          },
        });
      }
      // Only run when selectedExpert.id changes, not on every render
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedExpert?.id]);

    /**
     * Handle form submission
     * Only resets form on successful submission
     */
    const handleFormSubmit = useCallback(
      async (values) => {
        console.log("Form submission:", { values, modalMode });
        try {
          await onSubmit(values);
          // Only reset form if submission succeeds
          form.resetFields();
        } catch (error) {
          // Don't reset form on error - keep values so user can retry
          console.error("Form submission error:", error);
        }
      },
      [modalMode, onSubmit, form]
    );

    // Don't render if no expert selected (edit mode only)
    if (!selectedExpert) {
      return null;
    }

    return (
      <Spin spinning={loading} tip="Saving...">
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          onFinish={handleFormSubmit}
          className="mb-4"
        >
          <div className="row justify-content-center">
            <div className="col-md-12 col-sm-12">
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
                        {
                          type: "email",
                          message: "Please enter a valid email.",
                        },
                      ]}
                      className="mb-2"
                    >
                      <Input
                        placeholder="Email"
                        size="large"
                        prefix={<Icon name="mail" isFilled color="#ccc" />}
                        disabled={!!selectedExpert}
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
                              message:
                                "Enter a valid phone number (7-15 digits)",
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
                      rules={[
                        { required: true, message: "Please enter city." },
                      ]}
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
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="C-button is-filled"
                type="submit"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Expert"}
              </button>
            </Space>
          </div>
        </Form>
      </Spin>
    );
  }
);

CreateExpert.displayName = "CreateExpert";

CreateExpert.propTypes = {
  selectedExpert: PropTypes.object.isRequired, // Required for edit mode
  modalMode: PropTypes.oneOf(["expert"]).isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default CreateExpert;
