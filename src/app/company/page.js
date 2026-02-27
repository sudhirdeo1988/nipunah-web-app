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

/**
 * Parses URL search params into filter state (search, type, location).
 * Used to pre-fill filters when arriving from home page search.
 */
function getFiltersFromSearchParams(searchParams) {
  const search = searchParams.get(HOME_SEARCH_PARAMS.SEARCH) || "";
  const type = searchParams.get(HOME_SEARCH_PARAMS.TYPE) || "";
  const location = searchParams.get(HOME_SEARCH_PARAMS.LOCATION) || "";
  return { search, companyType: type, countrySelect: location };
}

const CompanyListPage = () => {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState(() => getFiltersFromSearchParams(searchParams));

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  /**
   * Fetch companies with current filters. Used on mount (with URL params) and on search submit.
   */
  const fetchCompanies = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (filters.search) params.search = filters.search;
      if (filters.countrySelect) params.country = filters.countrySelect;
      const response = await companyService.getCompanies(params);

      let items = [];
      let total = 0;
      if (response?.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
        total = response.data.total ?? response.data.totalItems ?? items.length;
      } else if (Array.isArray(response?.data)) {
        items = response.data;
        total = response.total ?? items.length;
      } else if (Array.isArray(response)) {
        items = response;
        total = response.length;
      }

      setCompanies(items);
      setPagination((prev) => ({ ...prev, current: page, pageSize: limit, total }));
    } catch (err) {
      console.error("Fetch companies error:", err);
      setError(err);
      message.error("Failed to load companies. Please try again.");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.countrySelect]);

  /* Run search API on mount and when filters or pagination change */
  useEffect(() => {
    fetchCompanies(pagination.current, pagination.pageSize);
  }, [fetchCompanies, pagination.current, pagination.pageSize]);

  /**
   * Search field options with default values from current filters.
   * Memoized so we only recompute when filters change.
   */
  const searchFieldOptions = useMemo(
    () => [
      {
        type: "search",
        label: "",
        formFieldValue: "search",
        defaultValue: filters.search,
        placeholder: "Search",
        icon: "",
      },
      {
        type: "select",
        label: "",
        formFieldValue: "companyType",
        defaultValue: filters.companyType,
        placeholder: "Select company type",
        options: [
          { value: "Companies", label: "Marine Engineering" },
          { value: "Equipments", label: "Marine Equipments" },
        ],
      },
      {
        type: "countrySelect",
        label: "",
        icon: "",
        formFieldValue: "countrySelect",
        defaultValue: filters.countrySelect,
        placeholder: "Select Location",
        options: _map(CountryDetails, (c) => ({ value: c?.countryName, label: c?.countryName })),
      },
    ],
    [filters.search, filters.companyType, filters.countrySelect]
  );

  const handleSearch = useCallback((values) => {
    setFilters({
      search: values.search || "",
      companyType: values.companyType || "",
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
                Top shipping companies in india
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
                      const next = { ...filters, countrySelect: "" };
                      setFilters(next);
                      handleSearch(next);
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
                  <p className="C-heading size-6 color-light mt-3">Loading companies...</p>
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
                      <span className="C-heading size-6 color-light">No companies found.</span>
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
          onSearch={handleSearch}
          inSidebar
        />
      </Drawer>
    </PublicLayout>
  );
};

export default CompanyListPage;
