"use client";

import { useEffect } from "react";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/utilities/AuthContext";

import { useRouter } from "next/navigation";
import PublicLayout from "@/layout/PublicLayout";
import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  Space,
  Upload,
  Select,
} from "antd";
import Icon from "@/components/Icon";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";

const { TextArea } = Input;

const props = {
  name: "file",
  action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
  headers: {
    authorization: "authorization-text",
  },
};

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

const SignUpPage = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const onChangeFoundYear = (date, dateString) => {
    console.log(date, dateString);
  };

  useEffect(() => {
    if (isLoggedIn) {
      router.replace(ROUTES?.PRIVATE?.DASHBOARD);
    }
  }, [isLoggedIn]);

  return (
    <PublicLayout>
      <PageHeadingBanner
        heading="Register a company"
        currentPageTitle="List of Equipments"
      />
      <section className="section-padding small">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-md-12 col-sm-12">
              <div className="bg-white shadow p-4 mt-4 rounded-3">
                <Form
                  name="layout-multiple-horizontal"
                  form={form}
                  layout="vertical"
                  autoComplete="off"
                >
                  <Divider
                    style={{
                      borderColor: "#e1e1e1ff",
                      marginBottom: "24px",
                    }}
                    orientation="left"
                    orientationMargin="0"
                  >
                    <h4 className="C-heading size-xs extraBold color-dark mb-0">
                      Company Details
                    </h4>
                  </Divider>
                  <div className="row g-3 mb-4">
                    <div className="col-xl-4 col-md-6 col-sm-6 col-xs-12">
                      <Form.Item
                        label={
                          <span className="C-heading size-xss color-light mb-0">
                            Company Name
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Please enter company name.",
                          },
                        ]}
                        required
                        tooltip="As per Company Registration Certificate"
                        className="mb-0"
                      >
                        <Input placeholder="input placeholder" size="large" />
                      </Form.Item>
                    </div>
                    <div className="col-xl-4 col-md-6 col-sm-6 col-xs-12">
                      <Form.Item
                        label={
                          <span className="C-heading size-xss color-light mb-0">
                            Company Title
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Please enter company title.",
                          },
                        ]}
                        required
                        className="mb-0"
                      >
                        <Input placeholder="input placeholder" size="large" />
                      </Form.Item>
                    </div>
                    <div className="col-xl-4 col-md-6 col-sm-6 col-xs-12">
                      <Form.Item
                        label={
                          <span className="C-heading size-xss color-light mb-0">
                            Company found year
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Please enter company title.",
                          },
                        ]}
                        required
                        className="mb-0"
                      >
                        <DatePicker
                          onChange={onChangeFoundYear}
                          picker="year"
                          className="w-100"
                          size="large"
                        />
                      </Form.Item>
                    </div>
                    <div className="col-xl-4 col-md-6 col-sm-6 col-xs-12">
                      <Form.Item
                        label={
                          <span className="C-heading size-xss color-light mb-0">
                            Website URL
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Please enter company website URL.",
                          },
                        ]}
                        required
                        className="mb-0"
                      >
                        <Input placeholder="Turnover" size="large" />
                      </Form.Item>
                    </div>
                    <div className="col-xl-4 col-md-6 col-sm-6 col-xs-12">
                      <Form.Item
                        label={
                          <span className="C-heading size-xss color-light mb-0">
                            Phone Number
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Please enter company Phone Number.",
                          },
                        ]}
                        required
                        className="mb-0"
                      >
                        <Input placeholder="Phone Number" size="large" />
                      </Form.Item>
                    </div>
                    <div className="col-xl-4 col-md-6 col-sm-6 col-xs-12">
                      <Form.Item
                        label={
                          <span className="C-heading size-xss color-light mb-0">
                            Contact Email
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Please enter company Contact Email.",
                          },
                        ]}
                        required
                        className="mb-0"
                      >
                        <Input placeholder="Contact Email" size="large" />
                      </Form.Item>
                    </div>
                    <div className="col-xl-8 col-md-8 col-sm-12 col-xs-12">
                      <Form.Item
                        label={
                          <span className="C-heading size-xss color-light mb-0">
                            About company
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Please enter company title.",
                          },
                        ]}
                        required
                        className="mb-0"
                      >
                        <TextArea
                          rows={3}
                          placeholder="About company"
                          maxLength={6}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-xl-4 col-md-6 col-sm-6 col-xs-12">
                      <Form.Item
                        label={
                          <span className="C-heading size-xss color-light mb-0">
                            Company Logo
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Please enter company title.",
                          },
                        ]}
                        required
                        className="mb-0"
                        tooltip="As per Company Registration Certificate"
                      >
                        <Upload {...props}>
                          <button className="C-button is-bordered small">
                            <Space size={2}>
                              <Icon name="upload" size="small" />
                              Click here to upload logo
                            </Space>
                          </button>
                        </Upload>
                      </Form.Item>
                    </div>
                  </div>

                  <Divider
                    style={{
                      borderColor: "#e1e1e1ff",
                      marginBottom: "24px",
                    }}
                    orientation="left"
                    orientationMargin="0"
                  >
                    <h4 className="C-heading size-xs extraBold color-dark mb-0">
                      Company Categories
                    </h4>
                  </Divider>

                  <div className="row align-items-center g-3">
                    <Form.List name="categories">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }, idx) => {
                            const values =
                              form.getFieldValue("categories") || [];

                            return (
                              <>
                                <div className="col-md-5 col-sm-12">
                                  {/* Main Category */}
                                  <Form.Item
                                    {...restField}
                                    name={[name, "main"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: "Select category",
                                      },
                                    ]}
                                    className="mb-0"
                                  >
                                    <Select
                                      placeholder="Select Main Category"
                                      showSearch
                                      optionFilterProp="children"
                                      onChange={(val) => {
                                        const newValues = [
                                          ...(form.getFieldValue(
                                            "categories"
                                          ) || []),
                                        ];
                                        newValues[idx] = {
                                          main: val,
                                          sub: undefined,
                                        }; // reset sub
                                        form.setFieldsValue({
                                          categories: newValues,
                                        });
                                      }}
                                      size="large"
                                    >
                                      {categories.map((cat) => (
                                        <Option
                                          key={cat.id}
                                          value={cat.id}
                                          disabled={values.some(
                                            (c, i) =>
                                              i !== idx && c?.main === cat.id
                                          )}
                                        >
                                          {cat.title}
                                        </Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                </div>
                                <div className="col-md-5 col-sm-12">
                                  {/* Sub Category */}
                                  <Form.Item
                                    {...restField}
                                    name={[name, "sub"]}
                                    rules={[
                                      {
                                        required: true,
                                        message: "Select subcategory",
                                      },
                                    ]}
                                    className="mb-0"
                                  >
                                    <Select
                                      placeholder="Select Subcategory"
                                      showSearch
                                      optionFilterProp="children"
                                      disabled={!values[idx]?.main}
                                      size="large"
                                    >
                                      {categories
                                        .find(
                                          (cat) => cat.id === values[idx]?.main
                                        )
                                        ?.list.map((sub, i) => (
                                          <Option
                                            key={i}
                                            value={sub}
                                            disabled={values.some(
                                              (c, i2) =>
                                                i2 !== idx && c?.sub === sub
                                            )}
                                          >
                                            {sub}
                                          </Option>
                                        ))}
                                    </Select>
                                  </Form.Item>
                                </div>
                                <div className="col-md-2 col-sm-12">
                                  <MinusCircleOutlined
                                    onClick={() => remove(name)}
                                  />
                                </div>
                              </>
                            );
                          })}

                          {/* Add Button */}
                          <Form.Item>
                            <Button
                              type="dashed"
                              onClick={() => add()}
                              block
                              icon={<PlusOutlined />}
                            >
                              Add Category
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                  </div>

                  <Divider
                    style={{
                      borderColor: "#e1e1e1ff",
                      marginBottom: "24px",
                    }}
                    orientation="left"
                    orientationMargin="0"
                  >
                    <h4 className="C-heading size-xs extraBold color-dark mb-0">
                      Company Details
                    </h4>
                  </Divider>

                  <div className="row g-3 mb-4">
                    <div className="col-xl-4 col-md-6 col-sm-6 col-xs-12">
                      <Form.Item
                        label={
                          <span className="C-heading size-xss color-light mb-0">
                            Employees Count
                          </span>
                        }
                        className="mb-0"
                      >
                        <Input placeholder="Employees Count" size="large" />
                      </Form.Item>
                    </div>
                    <div className="col-xl-4 col-md-6 col-sm-6 col-xs-12">
                      <Form.Item
                        label={
                          <span className="C-heading size-xss color-light mb-0">
                            Turnover
                          </span>
                        }
                        className="mb-0"
                        tooltip="As per Company Registration Certificate"
                      >
                        <Input placeholder="Turnover" size="large" />
                      </Form.Item>
                    </div>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default SignUpPage;
