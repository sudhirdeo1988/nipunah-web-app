"use client";

import React, { useState, useMemo, useCallback, memo } from "react";
import { Form, Input, Steps, message, Select, Divider, Space } from "antd";
import { map as _map, find as _find, isEmpty as _isEmpty } from "lodash-es";
import Icon from "@/components/Icon";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import CountryDetails from "@/utilities/CountryDetails.json";

const UserRegistration = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [otpVerified, setOtpVerified] = useState(true);
  const [otpSent, setOtpSent] = useState("123456"); // temp OTP for dev mode
  const [capturedEmail, setCapturedEmail] = useState(""); // Store email from step 1
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [form] = Form.useForm();

  // Memoize expensive calculations
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

  // Memoize country options for contact dropdown
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

  // Memoize country select options
  const countrySelectOptions = useMemo(
    () =>
      _map(countries, (country) => (
        <Select.Option key={country} value={country}>
          {country}
        </Select.Option>
      )),
    [countries]
  );

  // Memoize state select options
  const stateSelectOptions = useMemo(
    () =>
      _map(states, (state) => (
        <Select.Option key={state} value={state}>
          {state}
        </Select.Option>
      )),
    [states]
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
      const values = await form.validateFields(["otp"]);
      if (values.otp === otpSent) {
        setOtpVerified(true);
        message.success("OTP verified successfully!");
      } else {
        setOtpVerified(false);
        message.error("Invalid OTP. Please try again.");
      }
    } catch (err) {}
  }, [form, otpSent]);

  // --- Step Navigation ---
  const next = useCallback(async () => {
    try {
      if (currentStep === 0) {
        const values = await form.validateFields([
          "first_name",
          "last_name",
          "email",
          "contact",
          "address",
        ]);

        // Capture email from step 1
        setCapturedEmail(values.email);
        setCurrentStep(currentStep + 1);
      } else if (currentStep === 1) {
        if (!otpVerified) {
          message.error("Please verify OTP before proceeding.");
          return;
        }

        setCurrentStep(currentStep + 1);
      }
    } catch (err) {
      console.error("Step navigation error:", err);
    }
  }, [currentStep, form, otpVerified]);

  const prev = useCallback(
    () => setCurrentStep(currentStep - 1),
    [currentStep]
  );

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

      console.log("=== FORM SUBMISSION DEBUG ===");
      console.log("All Fields (including undefined):", allFields);
      console.log("Address Object Structure:", allFields.address);

      message.success("User registered successfully!");
    } catch (err) {
      console.error("Form submission error:", err);
    }
  }, [form, otpVerified]);

  // Optimize country change handler
  const handleCountryChange = useCallback(
    (value) => {
      setSelectedCountry(value);
      form.setFieldsValue({
        address: {
          ...form.getFieldValue("address"),
          state: undefined,
        },
      }); // Reset state when country changes
    },
    [form]
  );

  // --- Step Contents ---
  const userDetailsStep = (
    <div className="row g-3">
      <div className="col-12">
        <Form.Item
          label={
            <span className="C-heading size-6 semiBold color-light mb-0">
              First Name
            </span>
          }
          name="first_name"
          rules={[{ required: true, message: "Please enter first name." }]}
          className="mb-2"
        >
          <Input
            placeholder="First name"
            size="large"
            prefix={<Icon name="person" isFilled color="#ccc" />}
          />
        </Form.Item>
      </div>
      <div className="col-12">
        <Form.Item
          label={
            <span className="C-heading size-6 semiBold color-light mb-0">
              Last Name
            </span>
          }
          name="last_name"
          rules={[{ required: true, message: "Please enter last name." }]}
          className="mb-2"
        >
          <Input
            placeholder="Last name"
            size="large"
            prefix={<Icon name="person" isFilled color="#ccc" />}
          />
        </Form.Item>
      </div>
      <div className="col-12">
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
        <Divider orientation="left">
          <span className="C-heading size-xss bold mb-0">ADDRESS</span>
        </Divider>
      </div>

      <div className={`col-${_isEmpty(states) ? "12" : "6"}`}>
        <Form.Item
          label={
            <span className="C-heading size-6 semiBold color-light mb-0">
              Country
            </span>
          }
          name={["address", "country"]}
          rules={[{ required: true, message: "Please select a country." }]}
          className="mb-2"
        >
          <Select
            placeholder="Select Country"
            size="large"
            showSearch
            optionFilterProp="children"
            onChange={handleCountryChange}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {countrySelectOptions}
          </Select>
        </Form.Item>
      </div>

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
              { required: true, message: "Please select a state/province." },
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
              optionFilterProp="children"
              disabled={!selectedCountry || states.length === 0}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {stateSelectOptions}
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
          name={["address", "location"]}
          rules={[{ required: true, message: "Please enter address." }]}
        >
          <Input.TextArea
            placeholder="Address"
            size="large"
            rows={3}
            prefix={<Icon name="home_pin" />}
          />
        </Form.Item>
      </div>
    </div>
  );

  const otpStep = (
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
            { required: true, message: "Please enter OTP." },
            { len: 6, message: "OTP must be 6 digits." },
            { pattern: /^\d{6}$/, message: "OTP must be numeric." },
          ]}
        >
          <Input
            placeholder="6-digit OTP"
            maxLength={6}
            size="large"
            prefix={<Icon name="pin" isFilled color="#ccc" />}
          />
        </Form.Item>
        <div className="row">
          <div className="col-6">
            <button
              type="button"
              onClick={sendOtp}
              className="C-button is-link"
            >
              Resend OTP
            </button>
          </div>
          <div className="col-6 text-right">
            <button
              type="button"
              onClick={verifyOtp}
              className="C-button is-bordered"
            >
              Verify OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const passwordStep = (
    <div className="row g-3">
      <div className="col-12">
        <Form.Item
          label={
            <span className="C-heading size-6 semiBold color-light mb-0">
              Username
            </span>
          }
          name="username"
          rules={[{ required: true, message: "Please enter username." }]}
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
            { required: true, message: "Please enter password." },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/,
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
            { required: true, message: "Please confirm password." },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match."));
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
  );

  const steps = [
    {
      title: (
        <span className="C-heading size-6 font-family-creative semiBold mt-2">
          User Details
        </span>
      ),
      icon: <Icon name="person" isFilled />,
      content: userDetailsStep,
    },
    {
      title: (
        <span className="C-heading size-6 font-family-creative semiBold mt-2">
          OTP Verification
        </span>
      ),
      content: otpStep,
      icon: <Icon name="pin" isFilled />,
    },
    {
      title: (
        <span className="C-heading size-6 font-family-creative semiBold mt-2">
          Create Password
        </span>
      ),
      content: passwordStep,
      icon: <Icon name="passkey" isFilled />,
    },
  ];

  return (
    <div className="">
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={onFinish}
        className="mb-4"
      >
        <div className="row justify-content-center d-none d-md-flex">
          <div className="col-md-10 d-none d-md-block">
            <Steps
              current={currentStep}
              className="formSteps mb-4"
              items={steps}
            />
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-7 col-sm-12">
            <div className="p-3 pb-0">{steps[currentStep]?.content}</div>
          </div>
        </div>

        <div className="text-center">
          {currentStep > 0 && (
            <button className="C-button is-bordered me-2" onClick={prev}>
              Previous
            </button>
          )}
          {currentStep < steps.length - 1 && (
            <button className="C-button is-filled" onClick={next}>
              Next
            </button>
          )}
          {currentStep === steps.length - 1 && (
            <button className="C-button is-filled" type="submit">
              Register
            </button>
          )}
        </div>
      </Form>
      <div className="text-center">
        <span className="C-heading size-xs semiBold mb-1">
          Already have account.? &nbsp;
          <button
            className="C-button is-link p-0 underline"
            type="button"
            onClick={() => router.push(ROUTES?.PUBLIC.LOGIN)}
          >
            Login
          </button>
        </span>
      </div>
    </div>
  );
};

export default memo(UserRegistration);
