"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Select,
  Space,
  Spin,
  message,
  DatePicker,
  Upload,
  Tooltip,
} from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { map as _map } from "lodash-es";
import Icon from "@/components/Icon";
import DigitsOnlyInput from "@/components/DigitsOnlyInput";
import countryDetails from "@/utilities/CountryDetails.json";
import { startsWithSelectFilter } from "@/utilities/selectFilters";
import { digitsOnlyNormalize } from "@/utilities/numericInput";
import axiosPublicInstance from "@/utilities/axiosPublicInstance";
import axiosInstance from "@/utilities/axiosInstance";
import { coerceSelectId } from "@/utilities/companyProfileNormalize";
import { EMPLOYEE_COUNT_RANGES } from "@/module/Company/constants/companyConstants";
import "@/components/Profile/ProfileDetails.scss";

const { TextArea } = Input;

function getNestedSubcategories(cat) {
  if (Array.isArray(cat?.subCategories?.items)) {
    return cat.subCategories.items;
  }
  if (Array.isArray(cat?.subCategories)) return cat.subCategories;
  if (Array.isArray(cat?.subcategories)) return cat.subcategories;
  return null;
}

export default function CompanyProfileForm({
  initialValues,
  onSubmit,
  onCancel,
  cancelText = "Cancel",
  okText = "Save Profile",
}) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const loadedSubcategoryIdsRef = useRef(new Set());
  const [categoriesData, setCategoriesData] = useState([]);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const [subcategoriesLoading, setSubcategoriesLoading] = useState({});

  const countries = useMemo(
    () => _map(countryDetails, (country) => country.countryName) || [],
    []
  );

  const countryOptions = useMemo(
    () =>
      _map(countryDetails, (c) => ({
        label: (
          <span className="C-heading size-xs color-light mb-0">
            {c.countryName} ({c.dailCode})
          </span>
        ),
        value: c.dailCode,
        searchLabel: `${c.countryName} ${c.dailCode}`,
      })),
    []
  );

  const currencyOptions = useMemo(() => {
    const seenCurrencyCodes = new Set();
    return _map(countryDetails, (c) => {
      const code = String(c?.currencyCode || "").trim();
      if (!code || seenCurrencyCodes.has(code)) return null;
      seenCurrencyCodes.add(code);
      const symbol = String(c?.currencySymbol || "").trim();
      return {
        label: (
          <span className="C-heading size-xs color-light mb-0">
            {code}
            {symbol ? ` (${symbol})` : ""}
          </span>
        ),
        value: code,
        searchLabel: `${code} ${symbol}`.trim(),
      };
    }).filter(Boolean);
  }, []);

  const fetchSubcategoriesForId = useCallback(
    async (categoryId, categoriesData = []) => {
      const id = coerceSelectId(categoryId);
      if (id == null || loadedSubcategoryIdsRef.current.has(String(id))) {
        return null;
      }

      const selectedCategory = categoriesData.find(
        (cat) => coerceSelectId(cat.id || cat.categoryId) === id
      );

      const nestedSubs = selectedCategory
        ? getNestedSubcategories(selectedCategory)
        : null;

      if (nestedSubs) {
        loadedSubcategoryIdsRef.current.add(String(id));
        return nestedSubs;
      }

      try {
        setSubcategoriesLoading((prev) => ({ ...prev, [id]: true }));
        const response = await axiosPublicInstance.get(
          `/categories/${id}/subcategories`,
          {
            params: {
              page: 1,
              limit: 100,
              sortBy: "name",
              order: "asc",
            },
          }
        );

        const subcategoriesData =
          response?.data?.items ||
          response?.items ||
          response?.subcategories ||
          response?.data?.subcategories ||
          (Array.isArray(response?.data) ? response.data : []) ||
          (Array.isArray(response) ? response : []);

        loadedSubcategoryIdsRef.current.add(String(id));
        return Array.isArray(subcategoriesData) ? subcategoriesData : [];
      } catch (error) {
        console.error(
          `Error fetching subcategories for category ${id}:`,
          error
        );
        loadedSubcategoryIdsRef.current.add(String(id));
        return [];
      } finally {
        setSubcategoriesLoading((prev) => ({ ...prev, [id]: false }));
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function prepareForm() {
      if (!initialValues) return;

      setFormReady(false);
      loadedSubcategoryIdsRef.current = new Set();

      try {
        setCategoriesLoading(true);
        const response = await axiosPublicInstance.get(
          "/categories/getAllCategories",
          {
            params: {
              page: 1,
              limit: 100,
              sortBy: "name",
              order: "asc",
            },
          }
        );

        const categoriesData =
          response?.data?.items ||
          response?.items ||
          response?.categories ||
          response?.data?.categories ||
          (Array.isArray(response?.data) ? response.data : []) ||
          (Array.isArray(response) ? response : []);

        if (cancelled) return;

        let nextSubcategoriesMap = {};
        if (Array.isArray(categoriesData)) {
          categoriesData.forEach((cat) => {
            const catId = coerceSelectId(cat.id || cat.categoryId);
            const nestedSubs = getNestedSubcategories(cat);
            if (catId != null && nestedSubs) {
              nextSubcategoriesMap[catId] = nestedSubs;
              loadedSubcategoryIdsRef.current.add(String(catId));
            }
          });
          setCategoriesList(categoriesData);
        }

        const mainIds = [
          ...new Set(
            (initialValues.categories || [])
              .map((c) => coerceSelectId(c?.mainCategoryId))
              .filter((id) => id != null)
          ),
        ];

        for (const mainId of mainIds) {
          if (nextSubcategoriesMap[mainId]) continue;
          const subs = await fetchSubcategoriesForId(mainId, categoriesData);
          if (cancelled) return;
          if (subs) {
            nextSubcategoriesMap[mainId] = subs;
          }
        }

        setSubcategoriesMap(nextSubcategoriesMap);
        setCategoriesData(
          initialValues.categories || [
            { mainCategoryId: undefined, subCategoryId: undefined },
          ]
        );
        setLogoPreview(initialValues.logo_url || null);

        form.resetFields();
        form.setFieldsValue(initialValues);

        if (!cancelled) {
          setFormReady(true);
        }
      } catch (error) {
        console.error("Error preparing company profile form:", error);
        message.error(
          error?.message || "Failed to load profile data. Please try again."
        );
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    }

    prepareForm();

    return () => {
      cancelled = true;
    };
  }, [form, initialValues, fetchSubcategoriesForId]);

  const fetchSubcategories = useCallback(
    async (categoryId) => {
      const id = coerceSelectId(categoryId);
      if (id == null || subcategoriesMap[id]) return;

      const subs = await fetchSubcategoriesForId(id, categoriesList);
      if (subs) {
        setSubcategoriesMap((prev) => ({ ...prev, [id]: subs }));
      }
    },
    [categoriesList, fetchSubcategoriesForId, subcategoriesMap]
  );

  const handleLogoUpload = useCallback(
    async (file) => {
      try {
        const isValidType =
          file.type === "image/png" ||
          file.type === "image/jpeg" ||
          file.type === "image/jpg" ||
          file.type === "image/webp";

        if (!isValidType) {
          message.error("You can only upload PNG, JPG, or WEBP files!");
          return false;
        }

        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
          message.error("Image must be smaller than 5MB!");
          return false;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result);
        };
        reader.readAsDataURL(file);

        setLogoUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "company-logo");

        const response = await axiosInstance.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const s3Path =
          response?.data?.url ||
          response?.data?.path ||
          response?.data?.location ||
          response?.data?.s3Path ||
          response?.data?.data?.url;

        if (s3Path) {
          form.setFieldValue("logo_url", s3Path);
          message.success("Logo uploaded successfully!");
        } else {
          throw new Error("Upload response missing file path");
        }

        setLogoUploading(false);
        return false;
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

  const handleLogoRemove = useCallback(() => {
    setLogoPreview(null);
    form.setFieldValue("logo_url", undefined);
  }, [form]);

  const handleFinish = useCallback(
    async (values) => {
      setSaving(true);
      try {
        await onSubmit?.(values);
        message.success("Profile updated successfully.");
      } catch (error) {
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Failed to update profile. Please try again.";
        message.error(errorMessage);
      } finally {
        setSaving(false);
      }
    },
    [onSubmit]
  );

  if (!formReady) {
    return (
      <div className="text-center py-5">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      className="companyProfileForm"
    >
      <Card size="small" className="profileDetails__sectionCard">
        <h4 className="profileDetails__sectionTitle">Company Details</h4>
        <Divider className="profileDetails__sectionDivider" />
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
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
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
                    showSearch
                    placeholder="Code"
                    size="large"
                    style={{ width: "30%" }}
                    options={countryOptions}
                    filterOption={startsWithSelectFilter}
                    optionFilterProp="label"
                  />
                </Form.Item>
                <Form.Item
                  name="contact_number"
                  noStyle
                  normalize={digitsOnlyNormalize(15)}
                  rules={[
                    { required: true, message: "Enter contact number" },
                    {
                      pattern: /^\d{7,15}$/,
                      message: "Enter a valid phone number (7-15 digits)",
                    },
                  ]}
                >
                  <DigitsOnlyInput
                    placeholder="Phone number"
                    maxLength={15}
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
              <span
                className="C-heading size-xss extraBold color-light mb-0"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                ADDRESSES
                <Tooltip title="The address you provide in this section will be publicly visible on your profile page.">
                  <button
                    type="button"
                    className="C-settingButton extra-small is-clean"
                  >
                    <Icon name="info" size="small" />
                  </button>
                </Tooltip>
              </span>
            </Divider>
          </div>

          <Form.List name="addresses">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, idx) => (
                  <div key={key} className="col-12">
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
                              onClick={() => remove(name)}
                              icon={<Icon name="delete" />}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6 col-12">
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
                            filterOption={startsWithSelectFilter}
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

                      <div className="col-md-6 col-12">
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
                              required: true,
                              message: "Please enter state/province.",
                            },
                            {
                              pattern: /^[A-Za-z\s]+$/,
                              message: "Only alphabets and spaces are allowed.",
                            },
                          ]}
                          className="mb-2"
                        >
                          <Input
                            placeholder="State/Province"
                            size="large"
                            prefix={
                              <Icon name="location_on" isFilled color="#ccc" />
                            }
                          />
                        </Form.Item>
                      </div>

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

                      <div className="col-md-6 col-12">
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

                      <div className="col-md-6 col-12">
                        <Form.Item
                          label={
                            <span className="C-heading size-6 semiBold color-light mb-0">
                              Postal Code / Pincode
                            </span>
                          }
                          {...restField}
                          name={[name, "postal_code"]}
                          normalize={digitsOnlyNormalize(10)}
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
                          <DigitsOnlyInput
                            placeholder="Postal Code / Pincode"
                            maxLength={10}
                            size="large"
                            prefix={
                              <Icon name="pin_drop" isFilled color="#ccc" />
                            }
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
                      <Divider className="my-3" />
                    )}
                  </div>
                ))}

                <div className="col-12">
                  <Button
                    type="dashed"
                    onClick={() => {
                      const addresses = form.getFieldValue("addresses") || [];
                      const newId =
                        Math.max(...addresses.map((addr) => addr.id || 0), 0) +
                        1;
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
        </div>
      </Card>

      <Card size="small" className="profileDetails__sectionCard">
        <h4 className="profileDetails__sectionTitle">Categories</h4>
        <Divider className="profileDetails__sectionDivider" />
        <Form.List name="categories">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, idx) => {
                const values = form.getFieldValue("categories") || [];
                const currentMainCategory = values[idx]?.mainCategoryId;

                return (
                  <div className="row g-2 align-items-center" key={key}>
                    <div className="col-md-5">
                      <Form.Item
                        {...restField}
                        name={[name, "mainCategoryId"]}
                        rules={[
                          { required: true, message: "Select category" },
                        ]}
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
                            form.setFieldValue(
                              ["categories", name, "subCategoryId"],
                              undefined
                            );
                            const newValues = [...values];
                            newValues[idx] = {
                              mainCategoryId: value,
                              subCategoryId: undefined,
                            };
                            setCategoriesData(newValues);
                            if (value && !subcategoriesMap[value]) {
                              const selectedCategory = categoriesList.find(
                                (cat) =>
                                  coerceSelectId(cat.id || cat.categoryId) ===
                                  value
                              );
                              const nestedSubs = selectedCategory
                                ? getNestedSubcategories(selectedCategory)
                                : null;
                              if (nestedSubs) {
                                setSubcategoriesMap((prev) => ({
                                  ...prev,
                                  [value]: nestedSubs,
                                }));
                              } else {
                                fetchSubcategories(value);
                              }
                            }
                          }}
                          options={categoriesList.map((cat) => {
                            const catId = coerceSelectId(
                              cat.id || cat.categoryId
                            );
                            return {
                              label: cat.name || cat.title || cat.categoryName,
                              value: catId,
                              disabled: values.some(
                                (c, i) =>
                                  i !== idx &&
                                  coerceSelectId(c?.mainCategoryId) === catId
                              ),
                            };
                          })}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-md-5">
                      <Form.Item
                        {...restField}
                        name={[name, "subCategoryId"]}
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
                          key={currentMainCategory}
                          options={
                            currentMainCategory &&
                            subcategoriesMap[currentMainCategory]
                              ? subcategoriesMap[currentMainCategory].map(
                                  (sub) => {
                                    const subId = coerceSelectId(
                                      sub.id || sub.subcategoryId
                                    );
                                    return {
                                      label:
                                        sub.name ||
                                        sub.subcategoryName ||
                                        sub.title,
                                      value: subId,
                                      disabled: values.some(
                                        (c, i2) =>
                                          i2 !== idx &&
                                          coerceSelectId(c?.subCategoryId) ===
                                            subId
                                      ),
                                    };
                                  }
                                )
                              : []
                          }
                        />
                      </Form.Item>
                    </div>
                    <div className="col-md-2">
                      {fields.length > 1 && (
                        <button
                          type="button"
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
                      {
                        mainCategoryId: undefined,
                        subCategoryId: undefined,
                      },
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
      </Card>

      <Card size="small" className="profileDetails__sectionCard">
        <h4 className="profileDetails__sectionTitle">Statistics</h4>
        <Divider className="profileDetails__sectionDivider" />
        <div className="row g-3">
          <div className="col-md-6 col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Found Year
                </span>
              }
              name="found_year"
              className="mb-2"
            >
              <DatePicker picker="year" size="large" className="w-100" />
            </Form.Item>
          </div>
          <div className="col-md-6 col-12">
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
              rules={[
                { required: true, message: "Please enter about company" },
              ]}
              className="mb-2"
            >
              <TextArea rows={3} placeholder="About company" size="large" />
            </Form.Item>
          </div>
          <div className="col-md-6 col-12">
            <Form.Item
              label={
                <span className="C-heading size-6 semiBold color-light mb-0">
                  Employee count
                </span>
              }
              name="employees_count"
              rules={[
                {
                  required: true,
                  message: "Please select employee count range",
                },
              ]}
              className="mb-2"
            >
              <Select
                placeholder="Select employee count range"
                size="large"
                options={EMPLOYEE_COUNT_RANGES.map((range) => ({
                  label: range.label,
                  value: range.value,
                }))}
              />
            </Form.Item>
          </div>
          <div className="col-md-6 col-12">
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
                    showSearch
                    optionFilterProp="searchLabel"
                    filterOption={(input, option) =>
                      String(option?.searchLabel ?? "")
                        .toLowerCase()
                        .includes(String(input ?? "").toLowerCase())
                    }
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

          <div className="col-md-4 col-12">
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
          <div className="col-md-4 col-12">
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
          <div className="col-md-4 col-12">
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
      </Card>

      <div className="profileDetails__footer">
        <Button onClick={onCancel} disabled={saving}>
          {cancelText}
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={saving}
          className="C-button is-filled"
        >
          {okText}
        </Button>
      </div>
    </Form>
  );
}
