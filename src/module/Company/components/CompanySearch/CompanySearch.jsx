"use client";

import React, { useMemo } from "react";
import dayjs from "dayjs";
import { DatePicker, Input, Space, Button, Form, Select } from "antd";
import Icon from "@/components/Icon";
import { useAppSelector } from "@/store/hooks";
import { map as _map } from "lodash-es";
import countryDetails from "@/utilities/CountryDetails.json";

const MIN_SEARCH_LENGTH = 4;
const COMPANY_TYPE_ALL_VALUE = "all";

const CompanySearch = ({
  searchQuery,
  companyType,
  location,
  registeredOnRange,
  onSearchChange,
  onCompanyTypeChange,
  onLocationChange,
  onRegisteredOnRangeChange,
  onCreateCompany,
  onBulkDelete,
  selectedCompanies,
  permissions = {},
}) => {
  const canAdd = Boolean(permissions.add);
  const canDelete = Boolean(permissions.delete);

  const categories = useAppSelector((state) => state.categories?.list ?? []);
  const categoriesLoading = useAppSelector(
    (state) => state.categories?.loading
  );

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

  const countryOptions = useMemo(
    () =>
      _map(countryDetails, (c) => ({
        label: c.countryName,
        value: c.countryName,
      })),
    []
  );

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
      <div className="row align-items-center justify-content-center">
      <div className="col-12">
        <div className="d-flex flex-nowrap align-items-center gap-3">
          <Form.Item
            label={<span className="C-heading size-xs semiBold mb-0">Registered On</span>}
            style={{ marginBottom: 0 }}
          >
            <DatePicker.RangePicker
              size="large"
              value={
                registeredOnRange?.[0] && registeredOnRange?.[1]
                  ? [dayjs(registeredOnRange[0]), dayjs(registeredOnRange[1])]
                  : null
              }
              onChange={onRegisteredOnRangeChange}
              style={{ maxWidth: 280 }}
            />
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
              style={{ minWidth: 130 }}
              showSearch
              optionFilterProp="label"
              loading={categoriesLoading}
            />
          </Form.Item>

          <Form.Item
            label={<span className="C-heading size-xs semiBold mb-0">Location</span>}
            style={{ marginBottom: 0 }}
          >
            <Select
              size="large"
              placeholder="Select country"
              value={location || undefined}
              onChange={(value) =>
                onLocationChange({ target: { value: value ?? "" } })
              }
              options={countryOptions}
              style={{ minWidth: 180 }}
              showSearch
              optionFilterProp="label"
              allowClear
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .startsWith(input.toLowerCase())
              }
              suffixIcon={<Icon name="keyboard_arrow_down" />}
            />
          </Form.Item>

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
        </div>
      </div>

      <div className="col-12 text-lg-end mt-2 mt-lg-0">
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
