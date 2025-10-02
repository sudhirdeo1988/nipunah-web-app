import React, { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Upload,
  Select,
  Steps,
  Space,
  message,
} from "antd";
import Icon from "@/components/Icon";

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
      const { otp } = await form.validateFields(["otp"]);
      if (otp === otpSent) {
        setOtpVerified(true);
        message.success("OTP verified successfully!");
      } else {
        message.error("Invalid OTP. Please try again.");
        setOtpVerified(false);
      }
    } catch (err) {}
  };

  // --- Step Navigation ---
  const next = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields([
          "company_name",
          "company_title",
          "email",
          "contact",
          "company_type",
          "logo",
        ]);
      }
      if (currentStep === 1 && !otpVerified) {
        message.error("Please verify OTP before proceeding.");
        return;
      }
      if (currentStep === 2) {
        await form.validateFields([
          "found_year",
          "website_url",
          "about_company",
        ]);
      }
      if (currentStep === 3) {
        await form.validateFields(["categories"]);
      }
      if (currentStep === 4) {
        await form.validateFields(["username", "password", "confirm_password"]);
        onFinish();
        return;
      }
      setCurrentStep(currentStep + 1);
    } catch (err) {
      // Validation errors handled by AntD
    }
  };

  const prev = () => setCurrentStep(currentStep - 1);

  // --- Form Submit ---
  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      const finalData = {
        company_name: values.company_name,
        company_title: values.company_title,
        email: values.email,
        contact: values.contact,
        company_type: values.company_type,
        logo: values.logo,
        found_year: values.found_year?.format("YYYY"),
        website_url: values.website_url,
        about_company: values.about_company,
        employees_count: values.employees_count,
        turnover: values.turnover,
        categories: values.categories || [],
        username: values.username,
        password: values.password,
      };
      console.log("Final Registration Data:", finalData);
      message.success("User registered successfully!");
    } catch (err) {}
  };

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
              name="contact"
              rules={[
                { required: true, message: "Enter contact number" },
                { pattern: /^\d{10}$/, message: "Enter 10-digit number" },
              ]}
            >
              <Input
                placeholder="Contact"
                size="large"
                prefix={<Icon name="phone" isFilled color="#ccc" />}
              />
            </Form.Item>
          </div>
          <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Contact Type
                </span>
              }
              name="company_type"
              rules={[{ required: true, message: "Select company type" }]}
              className="mb-2"
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
          </div>
        </div>
      ),
    },
    {
      title: <span className="C-heading size-6 semiBold mt-2">OTP</span>,
      icon: <Icon name="pin" isFilled />,
      content: (
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
      title: <span className="C-heading size-6 semiBold mt-2">Statistics</span>,
      icon: <Icon name="groups" isFilled />,
      content: (
        <div className="row g-3">
          <div className="col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Found year
                </span>
              }
              name="found_year"
              className="mb-2"
            >
              <DatePicker
                picker="year"
                className="w-100"
                size="large"
                prefix={<Icon name="calendar_month" isFilled color="#ccc" />}
              />
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
              name="turnover"
              className="mb-2"
            >
              <Input
                placeholder="Turnover"
                size="large"
                prefix={<Icon name="paid" isFilled color="#ccc" />}
              />
            </Form.Item>
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
                        <Select placeholder="Main Category" size="large">
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
                          disabled={!values[idx]?.main}
                        >
                          {categories
                            .find((cat) => cat.id === values[idx]?.main)
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
                      <button
                        className="C-settingButton small mt-1"
                        onClick={() => remove(name)}
                      >
                        <Icon name="remove" />
                      </button>
                    </div>
                  </div>
                );
              })}
              <Form.Item className="text-center">
                <button
                  type="button"
                  onClick={() => add()}
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
        <div className="col-md-11 d-none d-md-block">
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

export default Company;
