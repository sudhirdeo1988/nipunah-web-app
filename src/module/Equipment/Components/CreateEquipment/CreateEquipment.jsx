import { Form, Input, Select, Space, Spin, DatePicker } from "antd";
import React, { useCallback, useEffect, useMemo, memo, useState } from "react";
import PropTypes from "prop-types";
import Icon from "@/components/Icon";
import { map as _map, find as _find, isEmpty as _isEmpty } from "lodash-es";
import CountryDetails from "@/utilities/CountryDetails.json";
import {
  EQUIPMENT_TYPES,
  AVAILABLE_FOR_OPTIONS,
  RENT_TYPE_OPTIONS,
} from "../../constants/equipmentConstants";
import { useCategory } from "@/module/Category/hooks/useCategory";
import { companyService } from "@/utilities/apiServices";
import dayjs from "dayjs";

const { TextArea } = Input;

/**
 * CreateEquipment Component
 *
 * A reusable form component for creating and editing equipment.
 * Handles all equipment form fields including name, category, type, address, contact, etc.
 */
const CreateEquipment = memo(
  ({ selectedEquipment, modalMode, onCancel, onSubmit, loading = false }) => {
    const [form] = Form.useForm();
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [companiesLoading, setCompaniesLoading] = useState(false);
    const { categories } = useCategory();
    // Note: fetchCategories is called automatically by useCategory hook on mount
    // No need to call it again here to avoid duplicate API calls

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

    // Category options from API
    const categoryOptions = useMemo(
      () =>
        _map(categories, (cat) => ({
          label: cat.c_name,
          value: cat.c_name,
        })),
      [categories]
    );

    // Company options from API
    const companyOptions = useMemo(
      () =>
        _map(companies, (company) => ({
          label: company.name || company.companyName || company.shortName,
          value: company.name || company.companyName || company.shortName,
        })),
      [companies]
    );

    // Fetch companies on component mount
    useEffect(() => {
      const fetchCompanies = async () => {
        try {
          setCompaniesLoading(true);
          const response = await companyService.getCompanies({
            page: 1,
            limit: 1000, // Get all companies
          });
          
          if (response?.success && response?.data?.items) {
            setCompanies(response.data.items);
          } else if (Array.isArray(response?.data)) {
            setCompanies(response.data);
          }
        } catch (error) {
          console.error("Error fetching companies:", error);
          setCompanies([]);
        } finally {
          setCompaniesLoading(false);
        }
      };

      fetchCompanies();
    }, []);

    // Update form fields when selectedEquipment changes
    useEffect(() => {
      if (selectedEquipment) {
        form.setFieldsValue({
          name: selectedEquipment.name,
          category: selectedEquipment.category,
          type: selectedEquipment.type,
          about: selectedEquipment.about,
          manufacture_year: selectedEquipment.manufactureYear
            ? dayjs(`${selectedEquipment.manufactureYear}-01-01`)
            : undefined,
          manufacture_company: selectedEquipment.manufactureCompany,
          available_for: selectedEquipment.availableFor,
          rent_type: selectedEquipment.rentType,
          contact_email: selectedEquipment.contactEmail,
          contact_country_code: selectedEquipment.contact_country_code,
          contact_number: selectedEquipment.contactNumber,
          address: {
            country: selectedEquipment.address?.country,
            state: selectedEquipment.address?.state,
            location: selectedEquipment.address?.location,
            city: selectedEquipment.address?.city,
            postal_code: selectedEquipment.address?.postal_code,
          },
        });
        if (selectedEquipment.address?.country) {
          setSelectedCountry(selectedEquipment.address.country);
        }
      } else {
        form.resetFields();
        setSelectedCountry(null);
      }
    }, [selectedEquipment, form]);

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

    const handleFormSubmit = useCallback(
      (values) => {
        // Convert manufacture_year DatePicker to year number
        if (values.manufacture_year) {
          if (values.manufacture_year.year) {
            values.manufacture_year = values.manufacture_year.year();
          } else if (values.manufacture_year instanceof Date) {
            values.manufacture_year = values.manufacture_year.getFullYear();
          }
        }

        // Build payload structure
        const payload = {
          name: values.name,
          category: values.category,
          type: values.type,
          about: values.about || "",
          manufacture_year: values.manufacture_year,
          manufacture_company: values.manufacture_company,
          available_for: values.available_for,
          rent_type: values.rent_type,
          added_by: "user", // Default to logged in user
          equipment_address: {
            country: values.address?.country || "",
            state: values.address?.state || "",
            location: values.address?.location || "",
            city: values.address?.city || "",
            postal_code: values.address?.postal_code || "",
          },
          contact_email: values.contact_email,
          contact_country_code: values.contact_country_code,
          contact_number: values.contact_number,
        };

        onSubmit(payload);
        form.resetFields();
      },
      [onSubmit, form]
    );

    return (
      <Spin spinning={loading} tip="Saving...">
        <Form
          layout="vertical"
          form={form}
          name="equipment-form"
          style={{ maxWidth: 800 }}
          className="py-3"
          onFinish={handleFormSubmit}
        >
          <div className="row g-3">
            {/* Equipment Name */}
            <div className="col-12 col-md-6">
              <Form.Item
                name="name"
                className="mb-1"
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Equipment Name
                  </span>
                }
                rules={[
                  { required: true, message: "Please enter equipment name" },
                ]}
              >
                <Input
                  placeholder="Enter Equipment Name"
                  size="large"
                  prefix={<Icon name="precision_manufacturing" isFilled color="#ccc" />}
                />
              </Form.Item>
            </div>

            {/* Category */}
            <div className="col-12 col-md-6">
              <Form.Item
                name="category"
                className="mb-1"
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Category
                  </span>
                }
                rules={[
                  { required: true, message: "Please select category" },
                ]}
              >
                <Select
                  placeholder="Select Category"
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  options={categoryOptions}
                  prefix={<Icon name="category" isFilled color="#ccc" />}
                />
              </Form.Item>
            </div>

            {/* Type */}
            <div className="col-12 col-md-6">
              <Form.Item
                name="type"
                className="mb-1"
                label={
                  <span className="C-heading size-xs semiBold mb-0">Type</span>
                }
                rules={[{ required: true, message: "Please select type" }]}
              >
                <Select
                  placeholder="Select Type"
                  size="large"
                  options={EQUIPMENT_TYPES}
                  prefix={<Icon name="category" isFilled color="#ccc" />}
                />
              </Form.Item>
            </div>

            {/* Manufacture Year */}
            <div className="col-12 col-md-6">
              <Form.Item
                name="manufacture_year"
                className="mb-1"
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Manufacture Year
                  </span>
                }
              >
                <DatePicker
                  picker="year"
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="Select Year"
                  disabledDate={(current) => {
                    if (!current) return false;
                    const currentYear = new Date().getFullYear();
                    return current.year() > currentYear;
                  }}
                />
              </Form.Item>
            </div>

            {/* Companies */}
            <div className="col-12 col-md-6">
              <Form.Item
                name="manufacture_company"
                className="mb-1"
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Companies
                  </span>
                }
              >
                <Select
                  placeholder="Select Company"
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  loading={companiesLoading}
                  notFoundContent={companiesLoading ? "Loading companies..." : "No companies found"}
                  options={companyOptions}
                  allowClear
                />
              </Form.Item>
            </div>

            {/* Available For */}
            <div className="col-12 col-md-6">
              <Form.Item
                name="available_for"
                className="mb-1"
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Available For
                  </span>
                }
                rules={[
                  { required: true, message: "Please select available for" },
                ]}
              >
                <Select
                  placeholder="Select Available For"
                  size="large"
                  options={AVAILABLE_FOR_OPTIONS}
                />
              </Form.Item>
            </div>

            {/* About - Rich Text Editor (using TextArea for now) - Single column after the 2x2 grid */}
            <div className="col-12">
              <Form.Item
                name="about"
                className="mb-1"
                label={
                  <span className="C-heading size-xs semiBold mb-0">About</span>
                }
                rules={[
                  { required: true, message: "Please enter equipment description" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Enter equipment description"
                  size="large"
                />
              </Form.Item>
            </div>

            {/* Rent Type - Only show if available_for is rent */}
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.available_for !== currentValues.available_for
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("available_for") === "rent" ? (
                  <div className="col-6">
                    <Form.Item
                      name="rent_type"
                      className="mb-1"
                      label={
                        <span className="C-heading size-xs semiBold mb-0">
                          Rent Type
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message: "Please select rent type",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select Rent Type"
                        size="large"
                        options={RENT_TYPE_OPTIONS}
                      />
                    </Form.Item>
                  </div>
                ) : null
              }
            </Form.Item>

            {/* Address Section */}
            <div className="col-12">
              <div className="border-top pt-3 mt-2">
                <h5 className="C-heading size-xs bold mb-3">Equipment Address</h5>
              </div>
            </div>

            {/* Country */}
            <div className={`col-${_isEmpty(states) ? "12" : "6"}`}>
              <Form.Item
                name={["address", "country"]}
                className="mb-1"
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Country
                  </span>
                }
                rules={[
                  { required: true, message: "Please select country" },
                ]}
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

            {/* State */}
            {!_isEmpty(states) && (
              <div className="col-6">
                <Form.Item
                  name={["address", "state"]}
                  className="mb-1"
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      State/Province
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please select state" },
                  ]}
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
                    prefix={<Icon name="location_on" isFilled color="#ccc" />}
                  />
                </Form.Item>
              </div>
            )}

            {/* Location */}
            <div className="col-12">
              <Form.Item
                name={["address", "location"]}
                className="mb-1"
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Detail Address
                  </span>
                }
                rules={[
                  { required: true, message: "Please enter address" },
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="Enter detailed address"
                  size="large"
                />
              </Form.Item>
            </div>

            {/* City */}
            <div className="col-6">
              <Form.Item
                name={["address", "city"]}
                className="mb-1"
                label={
                  <span className="C-heading size-xs semiBold mb-0">City</span>
                }
                rules={[{ required: true, message: "Please enter city" }]}
              >
                <Input
                  placeholder="Enter City"
                  size="large"
                  prefix={
                    <Icon name="location_city" isFilled color="#ccc" />
                  }
                />
              </Form.Item>
            </div>

            {/* Postal Code */}
            <div className="col-6">
              <Form.Item
                name={["address", "postal_code"]}
                className="mb-1"
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Postal Code
                  </span>
                }
                rules={[
                  { required: true, message: "Please enter postal code" },
                ]}
              >
                <Input
                  placeholder="Enter Postal Code"
                  size="large"
                  prefix={<Icon name="pin_drop" isFilled color="#ccc" />}
                />
              </Form.Item>
            </div>

            {/* Contact Email */}
            <div className="col-12">
              <Form.Item
                name="contact_email"
                className="mb-1"
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Contact Email
                  </span>
                }
                rules={[
                  { required: true, message: "Please enter contact email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input
                  placeholder="Enter Contact Email"
                  size="large"
                  type="email"
                  prefix={<Icon name="mail" isFilled color="#ccc" />}
                />
              </Form.Item>
            </div>

            {/* Contact Number */}
            <div className="col-12">
              <Form.Item
                className="mb-1"
                label={
                  <span className="C-heading size-xs semiBold mb-0">
                    Contact Number
                  </span>
                }
                required
              >
                <Space.Compact block>
                  <Form.Item
                    name="contact_country_code"
                    noStyle
                    rules={[
                      { required: true, message: "Select code" },
                    ]}
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
          </div>

          <div className="text-right mt-3">
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
                {selectedEquipment ? "Update Equipment" : "Save Equipment"}
              </button>
            </Space>
          </div>
        </Form>
      </Spin>
    );
  }
);

CreateEquipment.displayName = "CreateEquipment";

CreateEquipment.propTypes = {
  selectedEquipment: PropTypes.object,
  modalMode: PropTypes.oneOf(["equipment"]).isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default CreateEquipment;

