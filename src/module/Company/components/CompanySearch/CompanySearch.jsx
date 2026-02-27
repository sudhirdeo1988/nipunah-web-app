"use client";

import React, { useMemo } from "react";
import { DatePicker, Divider, Input, Space, Button, Form, Select } from "antd";
import Icon from "@/components/Icon";
import { useAppSelector } from "@/store/hooks";

const MIN_SEARCH_LENGTH = 4;
const COMPANY_TYPE_ALL_VALUE = "all";

const CompanySearch = ({
  searchQuery,
  companyType,
  location,
  onSearchChange,
  onCompanyTypeChange,
  onLocationChange,
  onCreateCompany,
  onBulkDelete,
  selectedCompanies,
  permissions = {},
}) => {
  const canAdd = Boolean(permissions.add);
  const canDelete = Boolean(permissions.delete);

  const categories = useAppSelector((state) => state.categories?.list ?? []);

  const companyTypeOptions = useMemo(() => {
    const list = [
      { label: "All", value: COMPANY_TYPE_ALL_VALUE },
      ...categories.map((cat) => ({
        label: cat.name || cat.title || cat.categoryName || String(cat.id),
        value: String(cat.id ?? cat.categoryId ?? ""),
      })),
    ].filter((o) => o.value !== undefined && o.value !== "");
    return list;
  }, [categories]);

  const companyTypeLabel = useMemo(() => {
    const opt = companyTypeOptions.find(
      (o) => o.value === (companyType || COMPANY_TYPE_ALL_VALUE)
    );
    return opt?.label ?? "All";
  }, [companyTypeOptions, companyType]);

  /** Search section title: with query "{search} - {type} in {location}", without "Top {type} in {location}" */
  const searchSectionTitle = useMemo(() => {
    const typePart = companyTypeLabel;
    const locationPart = location?.trim() ? ` in ${location.trim()}` : "";
    const hasSearch = searchQuery?.trim().length >= MIN_SEARCH_LENGTH;
    if (hasSearch) {
      return `${searchQuery.trim()} - ${typePart}${locationPart}`;
    }
    return `Top ${typePart}${locationPart}`;
  }, [searchQuery, companyTypeLabel, location]);

  const searchError =
    searchQuery.length > 0 && searchQuery.length < MIN_SEARCH_LENGTH
      ? `Enter at least ${MIN_SEARCH_LENGTH} characters`
      : null;

  return (
    <div className="mb-4">
      <h2 className="C-heading size-5 semiBold color-dark mb-3">
        {searchSectionTitle}
      </h2>
      <div className="row align-items-center">
      <div className="col-12 col-lg-7">
        <Space wrap size="middle">
          <Space>
            <span className="C-heading size-xs semiBold mb-0">
              Registered On:
            </span>
            <DatePicker size="large" />
          </Space>
          <Divider orientation="vertical" />

          <Form.Item
            noStyle
            validateStatus={searchError ? "error" : undefined}
            help={searchError}
          >
            <Space.Compact style={{ width: 220 }}>
              <Input
                size="large"
                placeholder="Search company (min 4 characters)"
                prefix={<Icon name="search" />}
                value={searchQuery}
                onChange={(e) => onSearchChange(e)}
                maxLength={100}
                allowClear
              />
            </Space.Compact>
          </Form.Item>

          <Form.Item
            label={<span className="C-heading size-xs semiBold mb-0">Company type</span>}
            style={{ marginBottom: 0 }}
            required
          >
            <Select
              size="large"
              placeholder="Select company type"
              value={companyType || COMPANY_TYPE_ALL_VALUE}
              onChange={onCompanyTypeChange}
              options={companyTypeOptions}
              style={{ minWidth: 200 }}
              showSearch
              optionFilterProp="label"
              loading={!categories.length && undefined}
            />
          </Form.Item>

          <Form.Item
            label={<span className="C-heading size-xs semiBold mb-0">Location</span>}
            style={{ marginBottom: 0 }}
          >
            <Input
              size="large"
              placeholder="Location (optional)"
              prefix={<Icon name="location_on" />}
              value={location}
              onChange={(e) => onLocationChange(e)}
              allowClear
              style={{ width: 200 }}
            />
          </Form.Item>
        </Space>
      </div>

      <div className="col-12 col-lg-5 text-lg-end mt-2 mt-lg-0">
        <Space wrap>
          {canAdd && (
            <Button
              type="primary"
              size="large"
              onClick={onCreateCompany}
              className="C-button is-filled small"
            >
              <Space>
                <Icon name="add" />
                Create Company
              </Space>
            </Button>
          )}

          {canDelete && !!selectedCompanies.length && (
            <Button
              size="large"
              onClick={onBulkDelete}
              className="C-button is-bordered small"
            >
              <Space>
                <Icon name="delete" />
                Delete ({selectedCompanies.length})
              </Space>
            </Button>
          )}
        </Space>
      </div>
      </div>
    </div>
  );
};

export default CompanySearch;
