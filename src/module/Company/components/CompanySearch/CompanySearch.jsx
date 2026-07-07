"use client";

import React, { useMemo } from "react";
import { Input, Space, Button, Form, Select } from "antd";
import Icon from "@/components/Icon";
import { useAppSelector } from "@/store/hooks";
import { map as _map } from "lodash-es";
import countryDetails from "@/utilities/CountryDetails.json";
import { startsWithSelectFilter } from "@/utilities/selectFilters";
import {
  COMPANY_LIST_MIN_SEARCH_LENGTH,
  COMPANY_TYPE_ALL_VALUE,
} from "../../constants/companyConstants";

const MIN_SEARCH_LENGTH = COMPANY_LIST_MIN_SEARCH_LENGTH;

const CompanySearch = ({
  searchQuery,
  companyType,
  location,
  onSearchChange,
  onCompanyTypeChange,
  onLocationChange,
  onApplyFilters,
  onClearFilters,
  onCreateCompany,
  onBulkDelete,
  selectedCompanies,
  loading = false,
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

  const searchError =
    searchQuery.length > 0 && searchQuery.length < MIN_SEARCH_LENGTH
      ? `Enter at least ${MIN_SEARCH_LENGTH} characters`
      : null;

  return (
    <div className="mb-4">
      <div className="row align-items-center justify-content-center">
        <div className="col-12">
          <div className="d-flex flex-wrap align-items-end gap-3">
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
                style={{ minWidth: 180 }}
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
                onChange={(value) => onLocationChange(value ?? "")}
                options={_map(countryDetails, (c) => ({
                  label: c.countryName,
                  value: c.countryName,
                }))}
                style={{ minWidth: 180 }}
                showSearch
                optionFilterProp="label"
                allowClear
                filterOption={startsWithSelectFilter}
                suffixIcon={<Icon name="keyboard_arrow_down" />}
              />
            </Form.Item>

            <Form.Item
              label={<span className="C-heading size-xs semiBold mb-0">Search</span>}
              style={{ marginBottom: 0 }}
              validateStatus={searchError ? "error" : undefined}
              help={searchError}
            >
              <Input
                size="large"
                placeholder={`Search company (min ${MIN_SEARCH_LENGTH} characters)`}
                prefix={<Icon name="search" />}
                value={searchQuery}
                onChange={onSearchChange}
                onPressEnter={onApplyFilters}
                maxLength={100}
                allowClear
                style={{ width: 280 }}
              />
            </Form.Item>

            <Space>
              <Button
                type="primary"
                size="large"
                className="C-button is-filled small"
                onClick={onApplyFilters}
                loading={loading}
              >
                <Space>
                  <Icon name="search" />
                  Search
                </Space>
              </Button>
              <Button
                size="large"
                className="C-button is-bordered small"
                onClick={onClearFilters}
                disabled={loading}
              >
                Clear
              </Button>
            </Space>
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
