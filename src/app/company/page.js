"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tag, Space, Drawer, Spin, Empty, message } from "antd";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import CardListing from "@/components/CardListing";
import CompanyCard from "@/components/CompanyCard";
import { map as _map } from "lodash-es";
import SearchContainer from "@/components/SearchContainer";
import CountryDetails from "@/utilities/CountryDetails.json";
import Icon from "@/components/Icon";
import { HOME_SEARCH_PARAMS } from "@/constants/homeSearch";
import { companyService } from "@/utilities/apiServices";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  setCategories,
  setCategoriesLoading,
  setCategoriesError,
} from "@/store/slices/categoriesSlice";

const MIN_SEARCH_LENGTH = 4;
const COMPANY_TYPE_ALL_VALUE = "all";
const DEFAULT_LOCATION = "India";

/**
 * Parses URL search params into filter state (search, type, location).
 * Default company type is "all".
 */
function getFiltersFromSearchParams(searchParams) {
  const search = searchParams.get(HOME_SEARCH_PARAMS.SEARCH) || "";
  const type =
    searchParams.get(HOME_SEARCH_PARAMS.TYPE) || COMPANY_TYPE_ALL_VALUE;
  const location =
    searchParams.get(HOME_SEARCH_PARAMS.LOCATION) || DEFAULT_LOCATION;
  return { search, companyType: type, countrySelect: location };
}

/** Parse categories from API response */
function parseCategoriesFromResponse(response) {
  return (
    response?.data?.items ||
    response?.items ||
    response?.categories ||
    response?.data?.categories ||
    (Array.isArray(response?.data) ? response.data : []) ||
    (Array.isArray(response) ? response : [])
  );
}

const CompanyListPage = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories?.list ?? []);

  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState(() =>
    getFiltersFromSearchParams(searchParams)
  );

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  /** Load categories into Redux when list is empty (e.g. public user on /company) */
  useEffect(() => {
    if (categories.length > 0) return;

    const loadCategories = async () => {
      dispatch(setCategoriesLoading(true));
      try {
        const res = await fetch(
          "/api/categories/getAllCategories?page=1&limit=500&sortBy=name&order=asc",
          { credentials: "include" }
        );
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(parseCategoriesFromResponse(data))
          ? parseCategoriesFromResponse(data)
          : [];
        dispatch(setCategories(list));
      } catch (err) {
        console.error("Failed to load categories", err);
        dispatch(
          setCategoriesError(err?.message || "Failed to load categories")
        );
        dispatch(setCategories([]));
      }
    };

    loadCategories();
  }, [categories.length, dispatch]);

  /** Company type dropdown options: All + categories from Redux */
  const companyTypeOptions = useMemo(() => {
    const list = [
      { value: COMPANY_TYPE_ALL_VALUE, label: "All" },
      ...categories.map((cat) => ({
        value: String(cat.id ?? cat.categoryId ?? ""),
        label:
          cat.name || cat.title || cat.categoryName || String(cat.id ?? ""),
      })),
    ].filter((o) => o.value !== undefined && o.value !== "");
    return list;
  }, [categories]);

  /** Resolve company type label for title */
  const companyTypeLabel = useMemo(() => {
    const opt = companyTypeOptions.find(
      (o) => o.value === (filters.companyType || COMPANY_TYPE_ALL_VALUE)
    );
    return opt?.label ?? "All";
  }, [companyTypeOptions, filters.companyType]);

  /** Search section title: "{type} companies in {location}" (with optional "{search} - " prefix) */
  const searchSectionTitle = useMemo(() => {
    const typePart = companyTypeLabel;
    const locationPart = filters.countrySelect?.trim()
      ? ` in ${filters.countrySelect.trim()}`
      : "";
    const hasSearch =
      filters.search?.trim().length >= MIN_SEARCH_LENGTH;
    if (hasSearch) {
      return `${filters.search.trim()} - ${typePart} companies${locationPart}`;
    }
    return `${typePart} companies${locationPart}`;
  }, [filters.search, companyTypeLabel, filters.countrySelect]);

  /** Fetch companies with current filters */
  const fetchCompanies = useCallback(
    async (page = 1, limit = 10) => {
      setLoading(true);
      setError(null);
      try {
        const params = { page, limit };
        if (filters.search?.trim().length >= MIN_SEARCH_LENGTH) {
          params.search = filters.search.trim();
        }
        if (filters.countrySelect?.trim()) {
          params.country = filters.countrySelect.trim();
        }
        // Always send companyType to API (default "all") so backend receives it consistently.
        params.type = filters.companyType || COMPANY_TYPE_ALL_VALUE;
        if (params.type !== COMPANY_TYPE_ALL_VALUE) {
          params.categoryId = params.type;
        }

        const response = await companyService.getCompanies(params);

        let items = [];
        let total = 0;
        if (response?.data?.items && Array.isArray(response.data.items)) {
          items = response.data.items;
          total =
            response.data.total ?? response.data.totalItems ?? items.length;
        } else if (Array.isArray(response?.data)) {
          items = response.data;
          total = response.total ?? items.length;
        } else if (Array.isArray(response)) {
          items = response;
          total = response.length;
        }

        setCompanies(items);
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize: limit,
          total,
        }));
      } catch (err) {
        console.error("Fetch companies error:", err);
        setError(err);
        message.error("Failed to load companies. Please try again.");
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    },
    [
      filters.search,
      filters.countrySelect,
      filters.companyType,
    ]
  );

  useEffect(() => {
    fetchCompanies(pagination.current, pagination.pageSize);
  }, [fetchCompanies, pagination.current, pagination.pageSize]);

  /** Search field config: search (min 4 chars), company type (default All), location optional; both search and company type mandatory */
  const searchFieldOptions = useMemo(
    () => [
      {
        type: "search",
        label: "",
        formFieldValue: "search",
        defaultValue: filters.search,
        placeholder: `Search (min ${MIN_SEARCH_LENGTH} characters)`,
        icon: "",
        rules: [
          { required: true, message: "Search is required" },
          {
            min: MIN_SEARCH_LENGTH,
            message: `Enter at least ${MIN_SEARCH_LENGTH} characters`,
          },
        ],
      },
      {
        type: "select",
        label: "",
        formFieldValue: "companyType",
        defaultValue: filters.companyType || COMPANY_TYPE_ALL_VALUE,
        placeholder: "Select company type",
        options: companyTypeOptions,
        rules: [{ required: true, message: "Company type is required" }],
      },
      {
        type: "countrySelect",
        label: "",
        icon: "",
        formFieldValue: "countrySelect",
        defaultValue: filters.countrySelect,
        placeholder: "Select Location (optional)",
        options: _map(CountryDetails, (c) => ({
          value: c?.countryName,
          label: c?.countryName,
        })),
      },
    ],
    [
      filters.search,
      filters.companyType,
      filters.countrySelect,
      companyTypeOptions,
    ]
  );

  const handleSearch = useCallback((values) => {
    setFilters({
      search: values.search || "",
      companyType:
        values.companyType === undefined || values.companyType === null
          ? COMPANY_TYPE_ALL_VALUE
          : values.companyType,
      countrySelect: values.countrySelect || "",
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handlePageChange = useCallback(
    (page, pageSize) => {
      setPagination((prev) => ({ ...prev, current: page, pageSize }));
      fetchCompanies(page, pageSize);
    },
    [fetchCompanies]
  );

  return (
    <PublicLayout>
      <PageHeadingBanner
        heading="Companies"
        currentPageTitle="List of companies"
      />
      <section className="section-padding small pt-0 mt-md-4">
        <div className="container">
          <div className="d-none d-md-block">
            <SearchContainer
              forListingPage
              floatingEnable
              searchFieldOptions={searchFieldOptions}
              onSearch={handleSearch}
            />
          </div>

          <div className="row align-items-center my-2">
            <div className="col-10">
              <h3 className="C-heading size-4 bold mb-0 font-family-creative">
                {searchSectionTitle}
              </h3>
            </div>
            <div className="col-2 text-right d-md-none">
              <button className="C-settingButton" onClick={showDrawer}>
                <Icon name="filter_alt" isFilled />
              </button>
            </div>
          </div>

          <div className="row border-bottom pb-2 mb-3">
            <div className="col-md-4 col-sm-12">
              <span className="C-heading size-6 semiBold mb-0">
                <strong>{pagination.total}</strong> Companies found
              </span>
            </div>
            <div className="col-md-8 col-sm-12 text-right">
              <Space>
                {filters.countrySelect && (
                  <Tag
                    closable
                    onClose={() => {
                      handleSearch({
                        ...filters,
                        countrySelect: "",
                      });
                      setFilters((prev) => ({ ...prev, countrySelect: "" }));
                    }}
                    className="C-tag is-low small"
                  >
                    Location: {filters.countrySelect}
                  </Tag>
                )}
              </Space>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-12">
              {loading ? (
                <div className="text-center py-5">
                  <Spin size="large" />
                  <p className="C-heading size-6 color-light mt-3">
                    Loading companies...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-5">
                  <Empty
                    description={
                      <span className="C-heading size-6 color-light">
                        Unable to load companies. Please try again later.
                      </span>
                    }
                  />
                </div>
              ) : companies.length === 0 ? (
                <div className="text-center py-5">
                  <Empty
                    description={
                      <span className="C-heading size-6 color-light">
                        No companies found.
                      </span>
                    }
                  />
                </div>
              ) : (
                <CardListing
                  data={companies}
                  CardComponent={CompanyCard}
                  loading={loading}
                  onPageChange={handlePageChange}
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                />
              )}
            </div>
          </div>
        </div>
      </section>
      <Drawer
        title="Filter Companies"
        closable={{ "aria-label": "Close Button" }}
        onClose={onClose}
        open={open}
      >
        <SearchContainer
          forListingPage
          floatingEnable
          searchFieldOptions={searchFieldOptions}
          onSearch={(values) => {
            handleSearch(values);
            onClose();
          }}
          inSidebar
        />
      </Drawer>
    </PublicLayout>
  );
};

export default CompanyListPage;
