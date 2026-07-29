"use client";

import React, { memo } from "react";
import { Form, Input, Checkbox, Button } from "antd";
import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_RANGES,
  WORK_MODES,
} from "@/module/Job/constants/jobFormOptions";
import "./JobFilters.scss";

const CheckboxFilterGroup = ({ label, options, value, onChange }) => (
  <div className="job-filters__group">
    <div className="job-filters__group-label">{label}</div>
    <Checkbox.Group
      className="job-filters__checkboxes"
      options={options}
      value={value}
      onChange={onChange}
    />
  </div>
);

const JobFilters = memo(({ filters, onChange, onReset }) => {
  return (
    <aside className="job-filters">
      <div className="job-filters__head">
        <h2 className="job-filters__title">Filters</h2>
        <button
          type="button"
          className="job-filters__reset"
          onClick={onReset}
        >
          Clear all
        </button>
      </div>

      <Form layout="vertical" className="job-filters__form">
        <Form.Item label="Search">
          <Input
            allowClear
            size="large"
            placeholder="Job title, skills, company"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
          />
        </Form.Item>

        <CheckboxFilterGroup
          label="Experience"
          options={EXPERIENCE_RANGES}
          value={filters.experienceRequired}
          onChange={(value) => onChange({ experienceRequired: value })}
        />

        <CheckboxFilterGroup
          label="Employment Type"
          options={EMPLOYMENT_TYPES}
          value={filters.employmentType}
          onChange={(value) => onChange({ employmentType: value })}
        />

        <CheckboxFilterGroup
          label="Work Mode"
          options={WORK_MODES}
          value={filters.workMode}
          onChange={(value) => onChange({ workMode: value })}
        />

        <Form.Item label="Location">
          <Input
            allowClear
            size="large"
            placeholder="City or country"
            value={filters.location}
            onChange={(e) => onChange({ location: e.target.value })}
          />
        </Form.Item>

        <Button
          type="default"
          block
          className="C-button is-bordered"
          onClick={onReset}
        >
          Reset filters
        </Button>
      </Form>
    </aside>
  );
});

JobFilters.displayName = "JobFilters";

export default JobFilters;
