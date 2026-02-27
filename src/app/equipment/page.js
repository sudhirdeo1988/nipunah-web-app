"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
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

/**
 * Parse URL query into filter state for equipment (search, type, location).
 */
function getFiltersFromSearchParams(searchParams) {
  return {
    search: searchParams.get(HOME_SEARCH_PARAMS.SEARCH) || "",
    equipmentType: searchParams.get(HOME_SEARCH_PARAMS.TYPE) || "",
    countrySelect: searchParams.get(HOME_SEARCH_PARAMS.LOCATION) || "",
  };
}

/**
 * Build API params from filters for useEquipment.fetchEquipment
 */
function buildEquipmentParams(filters, page = 1, limit = 10) {
  const params = { page, limit, search: filters.search || "" };
  if (filters.equipmentType) params.type = filters.equipmentType;
  if (filters.countrySelect) params.country = filters.countrySelect;
  return params;
}

const EquipmentListPage = () => {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState(() => getFiltersFromSearchParams(searchParams));

  const { equipment, loading, error, pagination, fetchEquipment } = useEquipment();

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  /* Pre-fill filters from URL and run search API on mount / when filters from URL present */
  useEffect(() => {
    const fromUrl = getFiltersFromSearchParams(searchParams);
    const hasParams = fromUrl.search || fromUrl.equipmentType || fromUrl.countrySelect;
    setFilters(fromUrl);
    if (hasParams) {
      fetchEquipment(buildEquipmentParams(fromUrl, 1, pagination.pageSize));
    } else {
      fetchEquipment({ page: 1, limit: pagination.pageSize });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Memoized search field options with default values from filters */
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
        formFieldValue: "equipmentType",
        defaultValue: filters.equipmentType,
        placeholder: "Select equipment type",
        options: [
          { value: "Ship Building", label: "Ship Building" },
          { value: "Shipping", label: "Shipping" },
          { value: "Marine Engineering", label: "Marine Engineering" },
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
    [filters.search, filters.equipmentType, filters.countrySelect]
  );

  const handleSearch = useCallback(
    (values) => {
      const next = {
        search: values.search || "",
        equipmentType: values.equipmentType || "",
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
            />
          </div>

          <div className="row align-items-center my-2">
            <div className="col-10">
              <h3 className="C-heading size-4 bold mb-4 font-family-creative">
                Top equipments in marine Engineering
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
                {filters.equipmentType && (
                  <Tag
                    closable
                    onClose={() => {
                      const newFilters = { ...filters, equipmentType: "" };
                      setFilters(newFilters);
                      handleSearch(newFilters);
                    }}
                    className="C-tag is-low small"
                  >
                    Type: {filters.equipmentType}
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
                  <p className="C-heading size-6 color-light mt-3">Loading equipments...</p>
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
          onSearch={handleSearch}
          inSidebar
        />
      </Drawer>
    </PublicLayout>
  );
};

export default EquipmentListPage;
