"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Tag, Space, Drawer, Spin, Empty, message } from "antd";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import CardListing from "@/components/CardListing";
import ExpertCard from "@/components/ExpertCard";
import { map as _map } from "lodash-es";
import SearchContainer from "@/components/SearchContainer";
import CountryDetails from "@/utilities/CountryDetails.json";
import Icon from "@/components/Icon";
import { expertService } from "@/utilities/apiServices";
import { HOME_SEARCH_PARAMS } from "@/constants/homeSearch";
import { EXPERT_CATEGORIES } from "@/module/Experts/constants/expertConstants";

const MIN_SEARCH_LENGTH = 4;
const DEFAULT_LOCATION = "India";

/** Parse URL query into filter state. Defaults: location "India". */
function getFiltersFromSearchParams(searchParams) {
  return {
    search: searchParams.get(HOME_SEARCH_PARAMS.SEARCH) || "",
    expertType: searchParams.get(HOME_SEARCH_PARAMS.TYPE) || "",
    countrySelect:
      searchParams.get(HOME_SEARCH_PARAMS.LOCATION) || DEFAULT_LOCATION,
  };
}

const ExpertsPage = () => {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [experts, setExperts] = useState([]);
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

  /** Resolve expert type label for title (from EXPERT_CATEGORIES) */
  const expertTypeLabel = useMemo(() => {
    if (!filters.expertType) return "";
    const cat = EXPERT_CATEGORIES.find((c) => c.value === filters.expertType);
    return cat?.label || "";
  }, [filters.expertType]);

  /** Title: "Expert in {search text} {expert type} in {location}" */
  const searchSectionTitle = useMemo(() => {
    const typePart = expertTypeLabel;
    const locationPart = filters.countrySelect?.trim()
      ? ` in ${filters.countrySelect.trim()}`
      : "";
    const hasSearch = filters.search?.trim().length >= MIN_SEARCH_LENGTH;
    if (hasSearch && typePart) {
      return `Expert in ${filters.search.trim()} ${typePart}${locationPart}`;
    }
    if (hasSearch) {
      return `Expert in ${filters.search.trim()}${locationPart}`;
    }
    if (typePart) {
      return `Expert in ${typePart}${locationPart}`;
    }
    return `Expert in${locationPart}`;
  }, [filters.search, expertTypeLabel, filters.countrySelect]);

  /**
   * Fetch experts with search, availableFor, and location.
   * Uses location (not country) in API params, same as company/equipment.
   */
  const fetchExperts = useCallback(
    async (page = 1, limit = 10, filterOverrides = null) => {
      const f = filterOverrides ?? filters;
      try {
        setLoading(true);
        setError(null);

        const params = { page, limit };
        if (f.search?.trim().length >= MIN_SEARCH_LENGTH)
          params.search = f.search.trim();
        if (f.expertType) params.expertType = f.expertType;
        if (f.countrySelect?.trim()) params.location = f.countrySelect.trim();

        const response = await expertService.getExperts(params);

        let expertsData = [];
        let total = 0;

        if (response?.success && response?.data) {
          if (response.data.items && Array.isArray(response.data.items)) {
            expertsData = response.data.items;
            total =
              response.data.total ||
              response.data.totalItems ||
              expertsData.length;
          } else if (Array.isArray(response.data)) {
            expertsData = response.data;
            total = expertsData.length;
          }
        } else if (Array.isArray(response)) {
          expertsData = response;
          total = response.length;
        } else if (response?.data && Array.isArray(response.data)) {
          expertsData = response.data;
          total = response.total || expertsData.length;
        }

        const transformedExperts = expertsData.map((expert) => {
          const fullName = [expert.first_name, expert.last_name]
            .filter(Boolean)
            .join(" ")
            .trim() || expert.name || "Expert";

          return {
            id: expert.id,
            name: fullName,
            firstName: expert.first_name,
            lastName: expert.last_name,
            email: expert.email || "",
            expertise: expert.expertise || expert.expert_type || "Expert",
            city: expert.address?.city || expert.city || "",
            state: expert.address?.state || expert.state || "",
            country: expert.address?.country || expert.country || "",
            socialMedia: expert.social_media || expert.socialMedia || {},
            createdAt:
              expert.created_on || expert.createdAt || expert.created_at,
            createDate:
              expert.created_on || expert.createdAt || expert.created_at,
          };
        });

        setExperts(transformedExperts);
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize: limit,
          total,
        }));
      } catch (err) {
        console.error("Error fetching experts:", err);
        setError(err);
        message.error("Failed to load experts. Please try again later.");
        setExperts([]);
      } finally {
        setLoading(false);
      }
    },
    [filters.search, filters.countrySelect, filters.expertType]
  );

  useEffect(() => {
    const fromUrl = getFiltersFromSearchParams(searchParams);
    setFilters(fromUrl);
    fetchExperts(1, 10, fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = useCallback(
    (page, pageSize) => {
      fetchExperts(page, pageSize, filters);
    },
    [fetchExperts, filters]
  );

  /** Search field options: search (min 4), expert type (from EXPERT_CATEGORIES), location optional */
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
        formFieldValue: "expertType",
        defaultValue: filters.expertType,
        placeholder: "Select expert type",
        options: _map(EXPERT_CATEGORIES, (cat) => ({
          value: cat.value,
          label: cat.label,
        })),
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
    [filters.search, filters.expertType, filters.countrySelect]
  );

  const handleSearch = useCallback(
    (values) => {
      const next = {
        search: values.search || "",
        expertType: values.expertType || "",
        countrySelect: values.countrySelect || "",
      };
      setFilters(next);
      fetchExperts(1, pagination.pageSize, next);
    },
    [fetchExperts, pagination.pageSize]
  );

  return (
    <>
      <PublicLayout>
        <PageHeadingBanner
          heading="Experts"
          currentPageTitle="List of Experts"
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
                  <strong>{pagination.total}</strong> experts found
                </span>
              </div>
              <div className="col-md-8 col-sm-12 text-right">
                <Space>
                  {filters.availableFor &&
                    filters.availableFor !== AVAILABLE_FOR_ALL && (
                      <Tag
                        closable
                        onClose={() => {
                          const newFilters = {
                            ...filters,
                            availableFor: AVAILABLE_FOR_ALL,
                          };
                          setFilters(newFilters);
                          handleSearch(newFilters);
                        }}
                        className="C-tag is-low small"
                      >
                        Available for: {filters.availableFor}
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
            <div className="row">
              <div className="col-12 col-md-12">
                {loading ? (
                  <div className="text-center py-5">
                    <Spin size="large" />
                    <p className="C-heading size-6 color-light mt-3">
                      Loading experts...
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-center py-5">
                    <Empty
                      description={
                        <span className="C-heading size-6 color-light">
                          Unable to load experts. Please try again later.
                        </span>
                      }
                    />
                  </div>
                ) : experts.length === 0 ? (
                  <div className="text-center py-5">
                    <Empty
                      description={
                        <span className="C-heading size-6 color-light">
                          No experts found.
                        </span>
                      }
                    />
                  </div>
                ) : (
                  <CardListing
                    data={experts}
                    CardComponent={ExpertCard}
                    loading={loading}
                    onPageChange={handlePageChange}
                    size={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                    total={pagination.total}
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
        <Drawer
          title="Filter Experts"
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
    </>
  );
};

export default ExpertsPage;
