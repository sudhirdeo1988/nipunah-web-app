"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Tag, Space, Drawer, Spin, Empty, message } from "antd";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import CardListing from "@/components/CardListing";
import ExpertCard from "@/components/ExpertCard";
import { map as _map } from "lodash-es";
import SearchContainer from "@/components/SearchContainer";
import CountryDetails from "@/utilities/CountryDetails.json";
import Icon from "@/components/Icon";
import {
  EXPERT_CATEGORIES,
} from "@/module/Experts/constants/expertConstants";
import { expertService } from "@/utilities/apiServices";

const ExpertsPage = () => {
  const [open, setOpen] = useState(false);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  // Fetch experts from API
  const fetchExperts = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await expertService.getExperts({
        page,
        limit,
      });

      // Handle different response structures
      let expertsData = [];
      let total = 0;

      if (response?.success && response?.data) {
        if (response.data.items && Array.isArray(response.data.items)) {
          expertsData = response.data.items;
          total = response.data.total || response.data.totalItems || expertsData.length;
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

      // Transform expert data to match component format
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
          createdAt: expert.created_on || expert.createdAt || expert.created_at,
          createDate: expert.created_on || expert.createdAt || expert.created_at,
        };
      });

      setExperts(transformedExperts);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize: limit,
        total: total,
      }));
    } catch (err) {
      console.error("Error fetching experts:", err);
      setError(err);
      message.error("Failed to load experts. Please try again later.");
      setExperts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch experts on component mount
  useEffect(() => {
    fetchExperts(1, 10);
  }, [fetchExperts]);

  // Handle pagination change
  const handlePageChange = useCallback((page, pageSize) => {
    fetchExperts(page, pageSize);
  }, [fetchExperts]);
  // Search field configuration
  const searchFieldOptions = [
    {
      type: "search",
      label: "",
      formFieldValue: "search",
      defaultValue: "",
      placeholder: "Search",
      icon: "",
    },
    {
      type: "select",
      label: "",
      formFieldValue: "expertType",
      defaultValue: "",
      placeholder: "Select expert type",
      options: _map(EXPERT_CATEGORIES, (category) => ({
        value: category.value,
        label: category.label,
      })),
    },

    {
      type: "countrySelect",
      label: "",
      icon: "",
      formFieldValue: "countrySelect",
      defaultValue: "",
      placeholder: "Select Location",
      options: _map(CountryDetails, (country) => {
        return {
          value: country?.countryName,
          label: country?.countryName,
        };
      }),
    },
  ];

  // Handle search form submission
  const handleSearch = (values) => {
    console.log("Search values:", values);
    // Here you can implement your search logic
    // Example: filter data based on values
    // values.expertType, values.search, values.countrySelect
  };

  return (
    <>
      <PublicLayout>
        <PageHeadingBanner
          heading="Experts"
          currentPageTitle="List of companies"
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
                  Top shipping experts in india
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
                  <Tag closeIcon className="C-tag is-low small">
                    Top Product Development
                  </Tag>
                  <Tag closeIcon className="C-tag is-low small">
                    Top Product Development
                  </Tag>
                </Space>
              </div>
            </div>
            <div className="row">
              {/* Main Content */}
              <div className="col-12 col-md-12">
                {loading ? (
                  <div className="text-center py-5">
                    <Spin size="large" />
                    <p className="C-heading size-6 color-light mt-3">Loading experts...</p>
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
            onSearch={handleSearch}
            inSidebar
          />
        </Drawer>
      </PublicLayout>
    </>
  );
};

export default ExpertsPage;
