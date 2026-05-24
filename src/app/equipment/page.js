"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Tag, Space, Drawer, Spin, Empty } from "antd";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import EquipmentCard from "@/components/EquipmentCard";
import CardListing from "@/components/CardListing";
import { map as _map } from "lodash-es";
import SearchContainer from "@/components/SearchContainer";
import CountryDetails from "@/utilities/CountryDetails.json";
import Icon from "@/components/Icon";
import { useEquipment } from "@/module/Equipment/hooks/useEquipment";
import { HOME_SEARCH_PARAMS } from "@/constants/homeSearch";
import { buildListingSearchTitle } from "@/utilities/listingSearchTitle";

const MIN_SEARCH_LENGTH = 4;
const AVAILABLE_FOR_ALL = "all";
const DEFAULT_FILTERS = {
  search: "",
  availableFor: "",
  countrySelect: "",
};

/** Available for options: Sale, Rent, Lease. All is default. */
const AVAILABLE_FOR_OPTIONS = [
  { value: AVAILABLE_FOR_ALL, label: "All" },
  { value: "Sale", label: "Sale" },
  { value: "Rent", label: "Rent" },
  { value: "Lease", label: "Lease" },
];

/**
 * Parse URL query into filter state (search, availableFor, location).
 * No preselected defaults — values come only from the URL when present.
 */
function getFiltersFromSearchParams(searchParams) {
  return {
    search: searchParams.get(HOME_SEARCH_PARAMS.SEARCH) || "",
    availableFor: searchParams.get(HOME_SEARCH_PARAMS.TYPE) || "",
    countrySelect: searchParams.get(HOME_SEARCH_PARAMS.LOCATION) || "",
  };
}

/**
 * Build API params from filters for useEquipment.fetchEquipment
 */
function buildEquipmentParams(filters, page = 1, limit = 10) {
  const params = { page, limit, search: filters.search || "" };
  if (filters.availableFor) {
    params.availableFor = filters.availableFor;
  }
  if (filters.countrySelect?.trim()) {
    params.location = filters.countrySelect.trim();
  }
  return params;
}

const EquipmentListPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState(() =>
    getFiltersFromSearchParams(searchParams)
  );

  const { equipment, loading, error, pagination, fetchEquipment } = useEquipment();

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  /** Resolve "Available for" label for title */
  const availableForLabel = useMemo(() => {
    if (!filters.availableFor) return "";
    const opt = AVAILABLE_FOR_OPTIONS.find(
      (o) => o.value === filters.availableFor
    );
    return opt?.label ?? "";
  }, [filters.availableFor]);

  const searchSectionTitle = useMemo(() => {
    const typeLabel =
      filters.availableFor === AVAILABLE_FOR_ALL ? "" : availableForLabel;
    return buildListingSearchTitle({
      entityPlural: "Equipment",
      entitySingular: "Equipment",
      search: filters.search,
      minSearchLength: MIN_SEARCH_LENGTH,
      typeLabel,
      location: filters.countrySelect,
    });
  }, [filters.search, availableForLabel, filters.availableFor, filters.countrySelect]);

  /* Run search on mount and when filters change */
  useEffect(() => {
    const fromUrl = getFiltersFromSearchParams(searchParams);
    const hasParams =
      fromUrl.search || fromUrl.availableFor || fromUrl.countrySelect;
    setFilters(fromUrl);
    fetchEquipment(buildEquipmentParams(fromUrl, 1, pagination.pageSize));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Memoized search field options: search (min 4), Available for (Sale/Rent/Lease/All), Location optional */
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
        formFieldValue: "availableFor",
        defaultValue: filters.availableFor,
        placeholder: "Available for",
        options: AVAILABLE_FOR_OPTIONS,
        rules: [{ required: true, message: "Available for is required" }],
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
    [filters.search, filters.availableFor, filters.countrySelect]
  );

  const handleSearch = useCallback(
    (values) => {
      const next = {
        search: values.search || "",
        availableFor:
          values.availableFor === undefined || values.availableFor === null
            ? ""
            : values.availableFor,
        countrySelect: values.countrySelect || "",
      };
      setFilters(next);
      fetchEquipment(buildEquipmentParams(next, 1, pagination.pageSize));
    },
    [fetchEquipment, pagination.pageSize]
  );

  const handlePageChange = useCallback(
    (page, pageSize) => {
      fetchEquipment(buildEquipmentParams(filters, page, pageSize));
    },
    [fetchEquipment, filters]
  );

  const handleClearFilters = useCallback(
    (values) => {
      const next = {
        search: values.search || "",
        availableFor: values.availableFor || "",
        countrySelect: values.countrySelect || "",
      };
      setFilters(next);
      fetchEquipment(buildEquipmentParams(next, 1, pagination.pageSize));
      router.replace(pathname);
    },
    [fetchEquipment, pagination.pageSize, router, pathname]
  );

  return (
    <PublicLayout>
      <PageHeadingBanner
        heading="Equipments"
        currentPageTitle="List of Equipments"
      />
      <section className="section-padding small pt-0">
        <div className="container">
          <div className="d-none d-md-block">
            <SearchContainer
              forListingPage
              floatingEnable
              searchFieldOptions={searchFieldOptions}
              onSearch={handleSearch}
              onClear={handleClearFilters}
              clearValues={DEFAULT_FILTERS}
            />
          </div>

          <div className="row align-items-center my-2">
            <div className="col-10">
              <h3 className="C-heading size-4 bold mb-4 font-family-creative">
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
                <strong>{pagination.total || 0}</strong> equipments found
              </span>
            </div>
            <div className="col-md-8 col-sm-12 text-right">
              <Space>
                {filters.availableFor && (
                  <Tag
                    closable
                    onClose={() => {
                      const newFilters = { ...filters, availableFor: "" };
                      setFilters(newFilters);
                      handleSearch(newFilters);
                    }}
                    className="C-tag is-low small"
                  >
                    Available for: {availableForLabel || filters.availableFor}
                  </Tag>
                )}
                {filters.countrySelect && (
                  <Tag
                    closable
                    onClose={() => {
                      const newFilters = { ...filters, countrySelect: "" };
                      setFilters(newFilters);
                      handleSearch(newFilters);
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
            {/* Main Content */}
            <div className="col-12">
              {loading ? (
                <div className="text-center py-5">
                  <Spin size="large" />
                  <p className="C-heading size-6 color-light mt-3">
                    Loading equipments...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-5">
                  <Empty
                    description={
                      <span className="C-heading size-6 color-light">
                        Unable to load equipments. Please try again later.
                      </span>
                    }
                  />
                </div>
              ) : equipment.length === 0 ? (
                <div className="text-center py-5">
                  <Empty
                    description={
                      <span className="C-heading size-6 color-light">
                        No equipments found.
                      </span>
                    }
                  />
                </div>
              ) : (
                <CardListing
                  data={equipment}
                  CardComponent={EquipmentCard}
                  size={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                  loading={loading}
                  onPageChange={handlePageChange}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  current={pagination.current}
                />
              )}
            </div>
          </div>
        </div>
      </section>
      <Drawer
        title="Filter Equipments"
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
          onClear={(values) => {
            handleClearFilters(values);
            onClose();
          }}
          clearValues={DEFAULT_FILTERS}
          inSidebar
        />
      </Drawer>
    </PublicLayout>
  );
};

export default EquipmentListPage;
