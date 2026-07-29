"use client";

import React, { useState } from "react";
import { Drawer, Empty, Space, Tag } from "antd";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import Icon from "@/components/Icon";
import { usePublicJobs } from "./hooks/usePublicJobs";
import { useApplyJob } from "./hooks/useApplyJob";
import JobFilters from "./components/JobFilters";
import JobBrowseCard from "./components/JobBrowseCard";
import ApplyJobModal from "./components/ApplyJobModal";
import "./PublicJobs.scss";

const PublicJobs = () => {
  const {
    filters,
    jobs,
    total,
    updateFilters,
    resetFilters,
    removeFilterValue,
  } = usePublicJobs();
  const {
    applyJob,
    isApplyOpen,
    openApply,
    closeApply,
    submitApplication,
    hasApplied,
  } = useApplyJob();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeFilterTags = [
    ...(filters.experienceRequired || []).map((value) => ({
      key: `experienceRequired:${value}`,
      filterKey: "experienceRequired",
      value,
      label: `Exp: ${value}`,
    })),
    ...(filters.employmentType || []).map((value) => ({
      key: `employmentType:${value}`,
      filterKey: "employmentType",
      value,
      label: `Type: ${value}`,
    })),
    ...(filters.workMode || []).map((value) => ({
      key: `workMode:${value}`,
      filterKey: "workMode",
      value,
      label: `Mode: ${value}`,
    })),
    filters.location
      ? {
          key: "location",
          filterKey: "location",
          value: "",
          label: `Location: ${filters.location}`,
        }
      : null,
    filters.search
      ? {
          key: "search",
          filterKey: "search",
          value: "",
          label: `Search: ${filters.search}`,
        }
      : null,
  ].filter(Boolean);

  return (
    <div className="public-jobs">
      <PageHeadingBanner heading="Jobs" />

      <div className="container py-4">
        <div className="row align-items-center mb-3">
          <div className="col-10">
            <h2 className="C-heading size-4 bold mb-0 font-family-creative">
              Find your next opportunity
            </h2>
          </div>
          <div className="col-2 text-right d-lg-none">
            <button
              type="button"
              className="C-settingButton"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open filters"
            >
              <Icon name="filter_alt" isFilled />
            </button>
          </div>
        </div>

        <div className="row border-bottom pb-2 mb-3">
          <div className="col-md-4 col-sm-12">
            <span className="C-heading size-6 semiBold mb-0">
              <strong>{total}</strong> jobs found
            </span>
          </div>
          <div className="col-md-8 col-sm-12 text-right">
            <Space wrap size={[8, 8]}>
              {activeFilterTags.map((tag) => (
                <Tag
                  key={tag.key}
                  closable
                  className="C-tag is-low small"
                  onClose={() => {
                    if (tag.filterKey === "search" || tag.filterKey === "location") {
                      updateFilters({ [tag.filterKey]: "" });
                    } else {
                      removeFilterValue(tag.filterKey, tag.value);
                    }
                  }}
                >
                  {tag.label}
                </Tag>
              ))}
            </Space>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-lg-3 d-none d-lg-block">
            <div className="public-jobs__filters-sticky">
              <JobFilters
                filters={filters}
                onChange={updateFilters}
                onReset={resetFilters}
              />
            </div>
          </div>

          <div className="col-lg-9 col-12">
            {jobs.length === 0 ? (
              <div className="text-center py-5">
                <Empty
                  description={
                    <span className="C-heading size-6 color-light">
                      No jobs match your filters. Try adjusting them.
                    </span>
                  }
                />
              </div>
            ) : (
              <div className="public-jobs__list">
                {jobs.map((job) => (
                  <JobBrowseCard
                    key={job.id}
                    job={job}
                    onApply={openApply}
                    hasApplied={hasApplied(job)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ApplyJobModal
        open={isApplyOpen}
        job={applyJob}
        onCancel={closeApply}
        onSubmit={submitApplication}
      />

      <Drawer
        title="Filters"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={320}
      >
        <JobFilters
          filters={filters}
          onChange={updateFilters}
          onReset={() => {
            resetFilters();
            setDrawerOpen(false);
          }}
        />
      </Drawer>
    </div>
  );
};

export default PublicJobs;
