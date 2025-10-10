import React, { useMemo, useState, useCallback, memo } from "react";
import {
  Button,
  Form,
  Input,
  Upload,
  Select,
  Steps,
  Space,
  message,
  Divider,
} from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  LinkedinOutlined,
} from "@ant-design/icons";

import { map as _map, find as _find, isEmpty as _isEmpty } from "lodash-es";
import Icon from "@/components/Icon";
import countryDetails from "@/utilities/CountryDetails.json";

const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;

const categories = [
  {
    title: "Shipping",
    id: 1,
    icon: "shipping",
    list: [
      "Shipping Companies / Vessel Operators",
      "Ship Management Companies",
      "Crew Management & Manning Agencies",
      "Port Authorities & Terminal Operators",
    ],
  },
  {
    title: "Logistics",
    id: 2,
    icon: "logistics",
    list: [
      "Freight Forwarders",
      "Customs Brokers",
      "Warehousing Companies",
      "Last Mile Delivery",
    ],
  },
];

const Company = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState("123456"); // Dev temp OTP
  const [capturedEmail, setCapturedEmail] = useState(""); // Store email from step 1
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [categoriesData, setCategoriesData] = useState([
    { main: undefined, sub: undefined },
  ]);

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

  // --- OTP Functions ---
  const sendOtp = useCallback(() => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpSent(newOtp);
    message.success(`OTP sent (for dev mode): ${newOtp}`);
    setOtpVerified(false);
    form.setFieldsValue({ otp: "" });
  }, [form]);

  const verifyOtp = useCallback(async () => {
    try {
      const { otp } = await form.validateFields(["otp"]);
      if (otp === otpSent) {
        setOtpVerified(true);
        message.success("OTP verified successfully!");
      } else {
        message.error("Invalid OTP. Please try again.");
        setOtpVerified(false);
      }
    } catch (err) {}
  }, [form, otpSent]);

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

  // --- Step Navigation ---
  const next = useCallback(async () => {
    try {
      if (currentStep === 0) {
        try {
          // Validate all fields including nested address fields
          const values = await form.validateFields([
            "company_name",
            "company_title",
            "email",
            "contact_country_code",
            "contact",
            "company_type",
            "addresses",
          ]);

          // Additional validation for addresses array
          const addresses = values.addresses || [];
          if (!addresses.length) {
            message.error("Please add at least one address.");
            return;
          }

          // Validate each address has required fields
          for (let i = 0; i < addresses.length; i++) {
            const address = addresses[i];
            if (!address.country) {
              message.error(`Please select a country for Address ${i + 1}.`);
              return;
            }
            if (!address.address) {
              message.error(
                `Please enter address details for Address ${i + 1}.`
              );
              return;
            }

            // Check if state is required for the selected country
            const countryData = _find(
              countryDetails,
              (c) => c.countryName === address.country
            );
            if (
              countryData &&
              countryData.states.length > 0 &&
              !address.state
            ) {
              message.error(
                `Please select a state/province for Address ${i + 1}.`
              );
              return;
            }
          }

          // Capture email from step 0
          setCapturedEmail(values.email);
        } catch (validationError) {
          console.error("Step 0 validation error:", validationError);
          // Let Ant Design handle the validation error display
          return;
        }
      }
      if (currentStep === 1) {
        // Categories step - validate at least one category is selected
        const categories = form.getFieldValue("categories") || [];
        if (
          !categories.length ||
          !categories.some((cat) => cat.main && cat.sub)
        ) {
          message.error("Please select at least one category and subcategory.");
          return;
        }
        // Validate each category has both main and sub selected
        for (let i = 0; i < categories.length; i++) {
          if (!categories[i].main || !categories[i].sub) {
            message.error(
              `Please complete category ${
                i + 1
              } - select both main and sub category.`
            );
            return;
          }
        }
      }
      if (currentStep === 2 && !otpVerified) {
        message.error("Please verify OTP before proceeding.");
        return;
      }
      if (currentStep === 3) {
        try {
          await form.validateFields([
            "website_url",
            "about_company",
            "employees_count",
            ["socialMedia", "facebook"],
            ["socialMedia", "instagram"],
            ["socialMedia", "linkedin"],
          ]);
        } catch (validationError) {
          console.error("Step 3 validation error:", validationError);
          return;
        }
      }
      if (currentStep === 4) {
        try {
          await form.validateFields([
            "username",
            "password",
            "confirm_password",
          ]);
          onFinish();
          return;
        } catch (validationError) {
          console.error("Step 4 validation error:", validationError);
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
  }, [currentStep, form, otpVerified]);

  const prev = useCallback(
    () => setCurrentStep(currentStep - 1),
    [currentStep]
  );

  // --- Form Submit ---
  const onFinish = useCallback(async () => {
    try {
      await form.validateFields();

      if (!otpVerified) {
        message.error("OTP is not verified.");
        setCurrentStep(1);
        return;
      }

      // Get all form values and debug
      const allFields = form.getFieldsValue(true); // Include undefined values

      console.log("=== COMPANY FORM SUBMISSION DEBUG ===");
      console.log("All Fields (including undefined):", allFields);

      console.log("=====================================");

      message.success("Company registered successfully!");
    } catch (err) {
      console.error("Form submission error:", err);
    }
  }, [form, otpVerified]);

  // --- Logo Upload ---
  const logoUploadProps = {
    name: "file",
    multiple: false,
    action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
    onChange(info) {
      if (info.file.status === "done") {
        message.success(`${info.file.name} uploaded successfully.`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} upload failed.`);
      }
    },
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("You can only upload JPG/PNG file!");
      }
      return isJpgOrPng; // return false will prevent upload
    },
  };

  // --- Steps Content ---
  const steps = [
    {
      title: <span className="C-heading size-6 semiBold mt-2">Details</span>,
      icon: <Icon name="diversity_3" isFilled />,
      content: (
        <div className="row g-3">
          <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Company Name
                </span>
              }
              name="company_name"
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
          <div className="col-12">
            <Form.Item
              name="company_title"
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
          <div className="col-12">
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
                  name="contact"
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
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Company Type
                </span>
              }
              name="company_type"
              rules={[{ required: true, message: "Select company type" }]}
              className="mb-0"
            >
              <Select
                placeholder="Select type"
                size="large"
                prefix={<Icon name="settings" isFilled color="#ccc" />}
              >
                <Option value="private">Private</Option>
                <Option value="public">Public</Option>
              </Select>
            </Form.Item>
          </div>

          <div className="col-12">
            <Divider orientation="left" orientationMargin="0">
              <span className="C-heading size-xss extraBold color-light mb-0">
                ADDRESSES
              </span>
            </Divider>
          </div>

          <Form.List
            name="addresses"
            initialValue={[
              { id: 1, isPrimary: true, country: "", state: "", address: "" },
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
                              optionFilterProp="children"
                              onChange={(value) =>
                                handleCountryChange(value, idx)
                              }
                              filterOption={(input, option) =>
                                option.children
                                  .toLowerCase()
                                  .indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              {_map(countries, (country) => (
                                <Select.Option key={country} value={country}>
                                  <span className="C-heading size-6 semiBold mb-0">
                                    {country}
                                  </span>
                                </Select.Option>
                              ))}
                            </Select>
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
                                optionFilterProp="children"
                                disabled={
                                  !currentCountry || currentStates.length === 0
                                }
                                filterOption={(input, option) =>
                                  option.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                {_map(currentStates, (state) => (
                                  <Select.Option key={state} value={state}>
                                    <span className="C-heading size-6 semiBold mb-0">
                                      {state}
                                    </span>
                                  </Select.Option>
                                ))}
                              </Select>
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
                              prefix={<Icon name="home_pin" />}
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
      title: <span className="C-heading size-6 semiBold mt-2">OTP</span>,
      icon: <Icon name="pin" isFilled />,
      content: (
        <div className="row g-3">
          <div className="col-12">
            {capturedEmail && (
              <div className="mb-3">
                <span className="C-heading size-xs color-light mb-0">
                  OTP sent to: <strong>{capturedEmail}</strong>
                </span>
              </div>
            )}
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Enter OTP
                </span>
              }
              name="otp"
              rules={[
                { required: true, message: "Enter OTP" },
                { len: 6, message: "OTP must be 6 digits" },
              ]}
            >
              <Input
                maxLength={6}
                placeholder="6-digit OTP"
                size="large"
                prefix={<Icon name="pin" isFilled color="#ccc" />}
              />
            </Form.Item>
            <div className="d-flex justify-content-between">
              <button
                type="button"
                onClick={sendOtp}
                className="C-button is-link small"
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={verifyOtp}
                className="C-button is-bordered small"
              >
                Verify OTP
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: <span className="C-heading size-6 semiBold mt-2">Categories</span>,
      icon: <Icon name="format_list_numbered" isFilled />,
      content: (
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
                          }}
                        >
                          {categories.map((cat) => (
                            <Option
                              key={cat.id}
                              value={cat.id}
                              disabled={values.some(
                                (c, i) => i !== idx && c?.main === cat.id
                              )}
                            >
                              {cat.title}
                            </Option>
                          ))}
                        </Select>
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
                          key={currentMainCategory} // Force re-render when main category changes
                        >
                          {currentMainCategory &&
                            categories
                              .find((cat) => cat.id === currentMainCategory)
                              ?.list.map((sub, i) => (
                                <Option
                                  key={i}
                                  value={sub}
                                  disabled={values.some(
                                    (c, i2) => i2 !== idx && c?.sub === sub
                                  )}
                                >
                                  {sub}
                                </Option>
                              ))}
                        </Select>
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
      content: (
        <div className="row g-3">
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
            <Divider orientation="left" orientationMargin="0">
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
              name={["socialMedia", "facebook"]}
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
              name={["socialMedia", "instagram"]}
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
              name={["socialMedia", "linkedin"]}
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
      content: (
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
                placeholder="Username"
                size="large"
                prefix={<Icon name="person" isFilled color="#ccc" />}
                readOnly
                value={capturedEmail}
                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
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
        <div className="col-md-10 d-none d-md-block">
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
          <div className="col-md-7 col-sm-12">
            <div className="p-3 pb-0">{steps[currentStep]?.content}</div>
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
          <Button type="primary" className="C-button is-filled" onClick={next}>
            {currentStep === steps.length - 1 ? "Register" : "Next"}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default memo(Company);
