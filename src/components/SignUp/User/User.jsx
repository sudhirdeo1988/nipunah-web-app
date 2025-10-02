"use client";

import React, { useState } from "react";
import { Form, Input, Steps, message } from "antd";
import Icon from "@/components/Icon";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

const UserRegistration = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [otpVerified, setOtpVerified] = useState(true);
  const [otpSent, setOtpSent] = useState("123456"); // temp OTP for dev mode

  const [form] = Form.useForm();

  // --- OTP Functions ---
  const sendOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpSent(newOtp);
    message.success(`OTP sent (for dev mode): ${newOtp}`);
    setOtpVerified(false);
    form.setFieldsValue({ otp: "" });
  };

  const verifyOtp = async () => {
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
  };

  // --- Step Navigation ---
  const next = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields([
          "first_name",
          "last_name",
          "email",
          "contact",
          "address",
        ]);
        setCurrentStep(currentStep + 1);
      } else if (currentStep === 1) {
        if (!otpVerified) {
          message.error("Please verify OTP before proceeding.");
          return;
        }
        setCurrentStep(currentStep + 1);
      }
    } catch (err) {}
  };

  const prev = () => setCurrentStep(currentStep - 1);

  const onFinish = async () => {
    try {
      await form.validateFields();
      if (!otpVerified) {
        message.error("OTP is not verified.");
        setCurrentStep(1);
        return;
      }

      const finalData = form.getFieldsValue();
      console.log("Final Registration Data:", finalData);
      message.success("User registered successfully!");
    } catch (err) {}
  };

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
          name="contact"
          rules={[
            { required: true, message: "Please enter contact number." },
            { pattern: /^\d{10}$/, message: "Enter a valid 10-digit number." },
          ]}
          className="mb-1"
        >
          <Input
            placeholder="Contact number"
            size="large"
            prefix={<Icon name="call" isFilled color="#ccc" />}
          />
        </Form.Item>
      </div>

      <div className="col-12">
        <Form.Item
          label={
            <span className="C-heading size-6 semiBold color-light mb-0">
              Address
            </span>
          }
          name="address"
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
        >
          <Input
            placeholder="Username"
            size="large"
            prefix={<Icon name="person" isFilled color="#ccc" />}
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
          <div className="col-md-8 col-sm-12 col-xs-12">
            <Steps
              current={currentStep}
              className="formSteps mb-4"
              items={steps}
            />
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-6 col-sm-12 col-xs-12">
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

export default UserRegistration;
