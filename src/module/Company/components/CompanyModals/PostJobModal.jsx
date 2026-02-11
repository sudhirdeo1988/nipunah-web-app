"use client";

/**
 * PostJobModal Component
 *
 * A reusable, independent modal component for posting job listings.
 * This component handles all job posting functionality including form validation,
 * API submission, and state management.
 *
 * Features:
 * - Complete form validation
 * - Currency selection for salary range
 * - Single salary range input (e.g., "1-2M", "10-30M")
 * - Address section matching company registration pattern
 * - Skills input with default suggestions
 * - Loading, success, and error state handling
 * - Payload logging on submission
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onCancel - Handler for modal cancel/close
 * @param {Function} props.onSubmit - Optional callback after successful submission (receives payload)
 * @param {Object} props.companyInfo - Optional company information object (if not provided, will try to get from user context)
 * @param {number} props.companyInfo.company_id - Company ID
 * @param {string} props.companyInfo.company_name - Company name
 * @param {string} props.companyInfo.company_short_name - Company short name
 * @param {Object} props.selectedJob - Optional job object for edit mode (if provided, form will be populated with job data)
 * @param {Function} props.onUpdate - Optional callback for update operation (if provided, will use PUT instead of POST)
 *
 * @example
 * // Create mode
 * <PostJobModal
 *   isOpen={isModalOpen}
 *   onCancel={() => setIsModalOpen(false)}
 *   onSubmit={(payload) => console.log('Job posted:', payload)}
 * />
 * 
 * // Edit mode
 * <PostJobModal
 *   isOpen={isModalOpen}
 *   selectedJob={jobToEdit}
 *   onCancel={() => setIsModalOpen(false)}
 *   onUpdate={(jobId, payload) => console.log('Job updated:', payload)}
 * />
 */

import React, { memo, useCallback, useState, useEffect, useMemo } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Row,
  Col,
  Button,
  message,
  Spin,
} from "antd";
import Icon from "@/components/Icon";
import CountryDetails from "@/utilities/CountryDetails.json";
import { map as _map, find as _find, isEmpty as _isEmpty } from "lodash-es";
import { jobService } from "@/utilities/apiServices";
import dayjs from "dayjs";
import { useRole } from "@/hooks/useRole";

const { TextArea } = Input;

/**
 * Employment type options
 */
const EMPLOYMENT_TYPES = [
  { label: "Full-time", value: "Full-time" },
  { label: "Part-time", value: "Part-time" },
  { label: "Contract", value: "Contract" },
  { label: "Internship", value: "Internship" },
];

/**
 * Experience range options
 */
const EXPERIENCE_RANGES = [
  { label: "0-1 years", value: "0-1 years" },
  { label: "1-3 years", value: "1-3 years" },
  { label: "3-5 years", value: "3-5 years" },
  { label: "5-8 years", value: "5-8 years" },
  { label: "8-10 years", value: "8-10 years" },
  { label: "10+ years", value: "10+ years" },
];

/**
 * Default skills to show as suggestions (at least one skill appears 2 times)
 */
const DEFAULT_SKILLS = [
  "React",
  "JavaScript",
  "Node.js",
  "React", // Appears 2 times as requested
  "Python",
  "TypeScript",
];

const PostJobModal = memo(
  ({ isOpen, onCancel, onSubmit, onUpdate, companyInfo: propCompanyInfo, selectedJob }) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const { user } = useRole();
    
    // Determine if in edit mode - based on selectedJob (for UI purposes)
    const isEditMode = Boolean(selectedJob);

    /**
     * Get company information from props or user context
     */
    const companyInfo = useMemo(() => {
      // Use prop companyInfo if provided, otherwise try to get from user context
      if (propCompanyInfo) {
        return propCompanyInfo;
      }
      if (user) {
        return {
          company_id: user.company_id || user.id,
          company_name:
            user.company_name || user.name || user.companyName,
          company_short_name:
            user.company_short_name || user.shortName || user.companyShortName,
        };
      }
      return null;
    }, [propCompanyInfo, user]);

    /**
     * Country select options - using countryCode as value, countryName as label
     */
    const countrySelectOptions = useMemo(
      () =>
        _map(CountryDetails, (country) => ({
          label: country.countryName,
          value: country.countryCode,
        })),
      []
    );

    /**
     * Get selected country data by countryCode
     */
    const selectedCountryData = useMemo(
      () =>
        _find(
          CountryDetails,
          (country) => country.countryCode === selectedCountry
        ),
      [selectedCountry]
    );

    /**
     * Get states for selected country
     */
    const states = useMemo(
      () => (selectedCountryData ? selectedCountryData.states : []),
      [selectedCountryData]
    );

    /**
     * State select options
     */
    const stateSelectOptions = useMemo(
      () =>
        _map(states, (state) => ({
          label: state,
          value: state,
        })),
      [states]
    );

    /**
     * Currency options from country details
     */
    const currencyOptions = useMemo(
      () =>
        _map(CountryDetails, (c) => ({
          label: `${c.currencyCode} (${c.currencySymbol})`,
          value: c.currencyCode,
          symbol: c.currencySymbol,
        })),
      []
    );

    /**
     * Reset form when modal opens/closes or populate for edit mode
     */
    useEffect(() => {
      // Debug: Log selectedJob when modal opens
      console.log("📋 PostJobModal useEffect - Modal state:", {
        isOpen,
        selectedJob,
        isEditMode,
        hasOnUpdate: Boolean(onUpdate),
        selectedJobKeys: selectedJob ? Object.keys(selectedJob) : [],
        selectedJobId: selectedJob?.id,
        selectedJobJobId: selectedJob?.jobId,
      });

      if (isOpen) {
        if (selectedJob && isEditMode) {
          // Edit mode: Populate form with existing job data
          const job = selectedJob;
          
          // Parse salary range from min-max format back to "1-2M" format
          let salaryRangeValue = "";
          if (job.salaryRange) {
            // If salaryRange is a string like "$120,000 - $150,000"
            const match = job.salaryRange.match(/\$([\d,]+)\s*-\s*\$([\d,]+)/);
            if (match) {
              const min = parseInt(match[1].replace(/,/g, "")) / 1000000;
              const max = parseInt(match[2].replace(/,/g, "")) / 1000000;
              salaryRangeValue = `${min}-${max}M`;
            }
          } else if (job.salary_range) {
            // If salary_range is an object
            const minStr = job.salary_range.min?.replace(/[^0-9]/g, "") || "";
            const maxStr = job.salary_range.max?.replace(/[^0-9]/g, "") || "";
            if (minStr && maxStr) {
              const min = parseInt(minStr);
              const max = parseInt(maxStr);
              // Check if values are in millions (>= 1000000) or thousands
              if (min >= 1000000 || max >= 1000000) {
                const minM = min / 1000000;
                const maxM = max / 1000000;
                salaryRangeValue = `${minM}-${maxM}M`;
              } else {
                const minK = min / 1000;
                const maxK = max / 1000;
                salaryRangeValue = `${minK}-${maxK}K`;
              }
            }
          }
          
          // Parse location - use locationObj if available (preserved from API), otherwise try location
          const locationObj = job.locationObj || (typeof job.location === "object" ? job.location : {}) || {};
          
          // Get location fields - handle both camelCase and snake_case
          const city = locationObj.city || "";
          const state = locationObj.state || "";
          const pincode = locationObj.pinCode || locationObj.pincode || "";
          const address = locationObj.address || "";
          let countryCode = locationObj.countryCode || locationObj.country || "";
          
          // If country is a name (string), find the corresponding countryCode
          if (countryCode && countryCode.length > 2) {
            // Likely a country name, find the code
            const countryData = _find(
              CountryDetails,
              (c) => c.countryName === countryCode
            );
            if (countryData) {
              countryCode = countryData.countryCode;
            } else {
              // If not found, try to match by partial name
              const matchedCountry = _find(
                CountryDetails,
                (c) => c.countryName.toLowerCase().includes(countryCode.toLowerCase()) ||
                       countryCode.toLowerCase().includes(c.countryName.toLowerCase())
              );
              if (matchedCountry) {
                countryCode = matchedCountry.countryCode;
              } else {
                countryCode = ""; // Reset if no match found
              }
            }
          }
          
          console.log("📝 Populating form for edit mode:", {
            city,
            state,
            pincode,
            countryCode,
            address,
            locationObj,
            jobLocation: job.location,
            jobLocationObj: job.locationObj,
            originalCountry: locationObj.country || locationObj.countryCode,
          });
          
          // Set selected country state FIRST (needed for state dropdown to populate)
          // Use countryCode for the dropdown value
          if (countryCode) {
            setSelectedCountry(countryCode);
          }
          
          // Parse application deadline from timestamp or date string
          let deadlineValue = null;
          if (job.applicationDeadline) {
            if (typeof job.applicationDeadline === "number") {
              deadlineValue = dayjs(job.applicationDeadline);
            } else {
              deadlineValue = dayjs(job.applicationDeadline);
            }
          } else if (job.application_deadline) {
            if (typeof job.application_deadline === "number") {
              deadlineValue = dayjs(job.application_deadline);
            } else {
              deadlineValue = dayjs(job.application_deadline);
            }
          }
          
          // Set all form values including nested location object
          form.setFieldsValue({
            title: job.title || "",
            experience_required: job.experienceRequired || job.experience_required || "",
            employment_type: job.employmentType || job.employment_type || "",
            currency: "USD", // Default, can be extracted from salary if needed
            salary_range: salaryRangeValue,
            description: job.description || "",
            skills_required: job.skillsRequired || job.skills_required || [],
            application_deadline: deadlineValue,
            status: job.status || "pending",
            isActive: job.isActive !== undefined ? job.isActive : job.is_active !== undefined ? job.is_active : true,
            location: {
              city: city,
              state: state,
              pincode: pincode,
              address: address,
              country: countryCode, // Use countryCode instead of country name
            },
          });
          
          // Ensure location fields are set again after a delay to allow country dropdown to update
          // This is important because the state dropdown depends on the country being selected
          setTimeout(() => {
            form.setFieldsValue({
              location: {
                city: city,
                state: state,
                pincode: pincode,
                address: address,
                country: countryCode, // Use countryCode instead of country name
              },
            });
          }, 300);
        } else {
          // Create mode: Reset form with defaults
          form.resetFields();
          setSelectedCountry(null);
          form.setFieldsValue({
            status: "pending",
            isActive: true,
            currency: "USD",
            skills_required: ["React", "React"],
          });
        }
      }
    }, [isOpen, form, selectedJob, isEditMode]);

    /**
     * Handle country change - reset state when country changes
     */
    const handleCountryChange = useCallback(
      (value) => {
        setSelectedCountry(value);
        form.setFieldsValue({
          location: {
            ...form.getFieldValue("location"),
            state: undefined,
          },
        });
      },
      [form]
    );

    /**
     * Parse salary range string (e.g., "1-2M", "10-30M") to min and max values
     * Formats output to match payload structure: "$120,000", "$150,000"
     * @param {string} rangeString - Salary range string (e.g., "1-2M", "10-30M")
     * @param {string} currencySymbol - Currency symbol (e.g., "$", "€")
     * @returns {Object} Object with min and max salary strings formatted with commas
     */
    const parseSalaryRange = useCallback((rangeString, currencySymbol = "$") => {
      if (!rangeString) return { min: "", max: "" };

      // Normalize input: remove extra spaces, convert to uppercase for M/K detection
      const normalized = rangeString.trim().toUpperCase();
      
      // Extract multiplier (M for millions, K for thousands, or none)
      const hasM = normalized.includes("M");
      const hasK = normalized.includes("K");
      const multiplier = hasM ? 1000000 : hasK ? 1000 : 1;
      
      // Extract numbers: match pattern like "1-2", "10-30", "1.5-2.5"
      const match = normalized.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
      
      if (match) {
        const minValue = parseFloat(match[1]) * multiplier;
        const maxValue = parseFloat(match[2]) * multiplier;
        
        // Format with commas: 120000 -> "120,000"
        const formatNumber = (num) => {
          return num.toLocaleString("en-US", {
            maximumFractionDigits: 0,
          });
        };
        
        return {
          min: `${currencySymbol}${formatNumber(minValue)}`,
          max: `${currencySymbol}${formatNumber(maxValue)}`,
        };
      }

      // If no match found, try to parse single value
      const singleMatch = normalized.match(/(\d+(?:\.\d+)?)/);
      if (singleMatch) {
        const value = parseFloat(singleMatch[1]) * multiplier;
        const formatNumber = (num) => {
          return num.toLocaleString("en-US", {
            maximumFractionDigits: 0,
          });
        };
        return {
          min: `${currencySymbol}${formatNumber(value)}`,
          max: `${currencySymbol}${formatNumber(value)}`,
        };
      }

      // Fallback: return empty strings
      return { min: "", max: "" };
    }, []);

    /**
     * Handle form submission
     * - Validates form fields
     * - Builds payload structure
     * - Calls API to create job
     * - Handles loading, success, and error states
     */
    const handleSubmit = useCallback(async () => {
      try {
        setIsSubmitting(true);

        // Validate all form fields
        const values = await form.validateFields();

        // Get currency symbol for salary range
        const selectedCurrency = currencyOptions.find(
          (c) => c.value === values.currency
        );
        const currencySymbol = selectedCurrency?.symbol || "$";

        // Parse salary range
        const salaryRange = parseSalaryRange(
          values.salary_range,
          currencySymbol
        );

        // Build payload structure matching the API format (camelCase)
        const payload = {
          title: values.title,
          postedBy: {
            companyId:
              companyInfo?.company_id || values.company_id || null,
            companyName:
              companyInfo?.company_name || values.company_name || "",
            companyShortName:
              companyInfo?.company_short_name ||
              values.company_short_name ||
              "",
          },
          experienceRequired: values.experience_required,
          salaryRange: {
            min: salaryRange.min,
            max: salaryRange.max,
          },
          location: {
            city: values.location?.city || "",
            state: values.location?.state || "",
            pinCode: values.location?.pincode || "",
            address: values.location?.address || "",
            countryCode: values.location?.country || "", // Send countryCode to API
          },
          description: values.description,
          employmentType: values.employment_type,
          skillsRequired: values.skills_required || [],
          applicationDeadline: values.application_deadline
            ? dayjs(values.application_deadline).format("YYYY-MM-DD")
            : null,
          status: values.status || "pending",
          isActive: values.isActive !== undefined ? values.isActive : true,
        };

        // Display payload as requested
        console.log("=== JOB " + (isEditMode ? "UPDATE" : "POSTING") + " PAYLOAD ===");
        console.log(JSON.stringify(payload, null, 2));

        let response;
        let isSuccess = false;

        // Determine if we're in update mode:
        // - selectedJob MUST exist for update mode (it contains the job ID)
        // - onUpdate callback is optional but preferred
        const hasUpdateCallback = onUpdate && typeof onUpdate === "function";
        const hasSelectedJob = Boolean(selectedJob);
        // Only update mode if selectedJob exists (required for jobId)
        const isUpdateMode = hasSelectedJob;

        if (isUpdateMode) {
          // Edit mode: Update existing job
          // Get jobId from selectedJob (required for update)
          // Try multiple possible ID fields - handle both numeric IDs and string IDs like "JOB-123"
          let jobId = selectedJob?.id || 
                     selectedJob?.jobId || 
                     selectedJob?.job_id ||
                     null;
          
          // If jobId is a string like "JOB-123", extract the numeric part for API
          if (typeof jobId === 'string' && jobId.startsWith('JOB-')) {
            // Keep the full jobId string, but also try to extract numeric ID
            const numericId = jobId.replace('JOB-', '');
            // Use numeric ID if it's a valid number, otherwise use the full string
            jobId = /^\d+$/.test(numericId) ? numericId : jobId;
          }
          
          console.log("🔍 Debug selectedJob:", {
            selectedJob,
            hasSelectedJob,
            hasUpdateCallback,
            isUpdateMode,
            id: selectedJob?.id,
            jobId: selectedJob?.jobId,
            job_id: selectedJob?.job_id,
            extractedJobId: jobId,
            selectedJobKeys: selectedJob ? Object.keys(selectedJob) : [],
          });
          
          if (!jobId) {
            console.error("❌ No jobId found in selectedJob:", selectedJob);
            throw new Error(
              `Job ID is required for update. Please ensure selectedJob is provided with an id or jobId field. ` +
              `SelectedJob keys: ${selectedJob ? Object.keys(selectedJob).join(', ') : 'null'}`
            );
          }

          console.log("🔄 Edit mode: Updating job with ID:", jobId);

          // Call onUpdate callback if provided, otherwise use jobService directly
          if (hasUpdateCallback) {
            console.log("  → Using onUpdate callback");
            try {
              await onUpdate(jobId, payload);
              isSuccess = true;
              console.log("  ✅ onUpdate callback completed successfully");
            } catch (error) {
              console.error("  ❌ onUpdate callback failed:", error);
              throw error; // Re-throw to be caught by outer try-catch
            }
          } else {
            console.log("  → Using jobService.updateJob");
            response = await jobService.updateJob(jobId, payload);
            isSuccess =
              response?.success !== false &&
              (response?.data !== undefined ||
                response?.id !== undefined ||
                response?.job_id !== undefined);
          }
        } else {
          // Create mode: Create new job
          console.log("➕ Create mode: Creating new job");
          response = await jobService.createJob(payload);
          isSuccess =
            response?.success !== false &&
            (response?.data !== undefined ||
              response?.id !== undefined ||
              response?.job_id !== undefined);
        }

        if (isSuccess) {
          // Show success message
          message.success(
            isEditMode ? "Job updated successfully!" : "Job posted successfully!"
          );

          // Reset form
          form.resetFields();
          setSelectedCountry(null);

          // Call callback if provided
          if (isEditMode) {
            if (onUpdate && typeof onUpdate === "function") {
              // onUpdate already called above and handled refresh
              // Just close the modal - refresh is handled by onUpdate callback
              onCancel();
            } else {
              onCancel();
            }
          } else {
            if (onSubmit && typeof onSubmit === "function") {
              await onSubmit(payload);
            } else {
              onCancel();
            }
          }
        } else {
          // Handle API error response
          const errorMessage =
            response?.message ||
            response?.error ||
            (isEditMode
              ? "Failed to update job. Please try again."
              : "Failed to post job. Please try again.");
          message.error(errorMessage);
        }
      } catch (error) {
        console.error("Job posting error:", error);

        // Handle form validation errors
        if (error?.errorFields) {
          message.error("Please fill all required fields correctly");
          return;
        }

        // Handle API errors
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to post job. Please try again.";
        message.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }, [
      form,
      onSubmit,
      onCancel,
      companyInfo,
      currencyOptions,
      parseSalaryRange,
    ]);

    /**
     * Handle modal cancel
     */
    const handleCancel = useCallback(() => {
      if (!isSubmitting) {
        form.resetFields();
        setSelectedCountry(null);
        onCancel();
      }
    }, [form, onCancel, isSubmitting]);

    return (
      <Modal
        title={
          <span className="C-heaidng size-5 mb-0 bold">
            {isEditMode ? "Edit Job" : "Post a Job"}
          </span>
        }
        open={isOpen}
        onCancel={handleCancel}
        footer={[
          <Button
            key="cancel"
            onClick={handleCancel}
            className="C-button is-bordered"
            disabled={isSubmitting}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            className="C-button is-filled"
          >
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Posting..."
              : isEditMode
              ? "Update Job"
              : "Post Job"}
          </Button>,
        ]}
        width={900}
        centered
        closable={!isSubmitting}
        maskClosable={!isSubmitting}
      >
        <Spin spinning={isSubmitting} tip="Posting job...">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              status: "pending",
              isActive: true,
              currency: "USD",
              skills_required: ["React", "React"], // React appears 2 times as requested
            }}
            className="py-3"
          >
            <Row gutter={16}>
              {/* Job Title */}
              <Col span={24}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Job Title
                    </span>
                  }
                  name="title"
                  rules={[
                    { required: true, message: "Please enter job title" },
                    {
                      min: 3,
                      message: "Job title must be at least 3 characters",
                    },
                  ]}
                >
                  <Input
                    placeholder="e.g., Senior Software Engineer"
                    size="large"
                    prefix={<Icon name="work" isFilled color="#ccc" />}
                  />
                </Form.Item>
              </Col>

              {/* Experience Required */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Experience Required
                    </span>
                  }
                  name="experience_required"
                  rules={[
                    {
                      required: true,
                      message: "Please select experience range",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select experience range"
                    size="large"
                    options={EXPERIENCE_RANGES}
                  />
                </Form.Item>
              </Col>

              {/* Employment Type */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Employment Type
                    </span>
                  }
                  name="employment_type"
                  rules={[
                    {
                      required: true,
                      message: "Please select employment type",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select employment type"
                    size="large"
                    options={EMPLOYMENT_TYPES}
                  />
                </Form.Item>
              </Col>

              {/* Currency */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Currency
                    </span>
                  }
                  name="currency"
                  rules={[
                    { required: true, message: "Please select currency" },
                  ]}
                >
                  <Select
                    placeholder="Select Currency"
                    size="large"
                    showSearch
                    optionFilterProp="label"
                    options={currencyOptions}
                  />
                </Form.Item>
              </Col>

              {/* Salary Range */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Salary Range
                    </span>
                  }
                  name="salary_range"
                  rules={[
                    { required: true, message: "Please enter salary range" },
                    {
                      pattern: /^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?\s*[MK]?$/i,
                      message:
                        "Format: 1-2M or 10-30M (e.g., 1-2M, 10-30M)",
                    },
                  ]}
                  extra="Enter range like: 1-2M, 10-30M, 50-100K"
                >
                  <Input
                    placeholder="e.g., 1-2M or 10-30M"
                    size="large"
                    prefix={<Icon name="attach_money" isFilled color="#ccc" />}
                  />
                </Form.Item>
              </Col>

              {/* Address Section - Matching company registration pattern */}
              <Col span={24}>
                <div className="border-top pt-3 mt-2 mb-3">
                  <h5 className="C-heading size-xs bold mb-3">Job Location</h5>
                </div>
              </Col>

              {/* Country */}
              <Col span={!_isEmpty(states) ? 6 : 12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Country
                    </span>
                  }
                  name={["location", "country"]}
                  rules={[
                    { required: true, message: "Please select country" },
                  ]}
                >
                  <Select
                    placeholder="Select Country"
                    size="large"
                    showSearch
                    optionFilterProp="label"
                    onChange={handleCountryChange}
                    filterOption={(input, option) =>
                      (option?.label || "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={countrySelectOptions}
                  />
                </Form.Item>
              </Col>

              {/* State */}
              {!_isEmpty(states) && (
                <Col span={6}>
                  <Form.Item
                    label={
                      <span className="C-heading size-xs semiBold mb-0">
                        State/Province
                      </span>
                    }
                    name={["location", "state"]}
                    rules={[
                      { required: true, message: "Please select state" },
                    ]}
                  >
                    <Select
                      placeholder="Select State/Province"
                      size="large"
                      showSearch
                      optionFilterProp="label"
                      disabled={!selectedCountry || states.length === 0}
                      filterOption={(input, option) =>
                        (option?.label || "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={stateSelectOptions}
                    />
                  </Form.Item>
                </Col>
              )}

              {/* Detail Address */}
              <Col span={24}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Detail Address
                    </span>
                  }
                  name={["location", "address"]}
                  rules={[
                    { required: true, message: "Please enter address" },
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Enter detailed address"
                    size="large"
                  />
                </Form.Item>
              </Col>

              {/* City */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">City</span>
                  }
                  name={["location", "city"]}
                  rules={[
                    { required: true, message: "Please enter city" },
                  ]}
                >
                  <Input
                    placeholder="Enter City"
                    size="large"
                    prefix={
                      <Icon name="location_city" isFilled color="#ccc" />
                    }
                  />
                </Form.Item>
              </Col>

              {/* Pincode */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Pincode/ZIP Code
                    </span>
                  }
                  name={["location", "pincode"]}
                  rules={[
                    { required: true, message: "Please enter pincode" },
                    {
                      pattern: /^[0-9A-Za-z\s-]{3,10}$/,
                      message: "Please enter a valid pincode",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter Pincode"
                    size="large"
                    prefix={<Icon name="pin_drop" isFilled color="#ccc" />}
                  />
                </Form.Item>
              </Col>

              {/* Description */}
              <Col span={24}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Job Description
                    </span>
                  }
                  name="description"
                  rules={[
                    {
                      required: true,
                      message: "Please enter job description",
                    },
                    {
                      min: 20,
                      message: "Description must be at least 20 characters",
                    },
                  ]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Enter detailed job description..."
                    size="large"
                  />
                </Form.Item>
              </Col>

              {/* Skills Required */}
              <Col span={24}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Skills Required
                    </span>
                  }
                  name="skills_required"
                  rules={[
                    {
                      type: "array",
                      min: 1,
                      message: "Please add at least one skill",
                    },
                  ]}
                  extra="Press Enter or comma to add skills"
                >
                  <Select
                    mode="tags"
                    placeholder="Add skills (press Enter to add)"
                    size="large"
                    tokenSeparators={[","]}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>

              {/* Application Deadline */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Application Deadline
                    </span>
                  }
                  name="application_deadline"
                  rules={[
                    {
                      required: true,
                      message: "Please select application deadline",
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    size="large"
                    placeholder="Select deadline date"
                    disabledDate={(current) => {
                      if (!current) return false;
                      // Disable past dates
                      return (
                        current && current < dayjs().startOf("day")
                      );
                    }}
                  />
                </Form.Item>
              </Col>

              {/* Status */}
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Status
                    </span>
                  }
                  name="status"
                  rules={[
                    { required: true, message: "Please select status" },
                  ]}
                >
                  <Select size="large" placeholder="Select status">
                    <Select.Option value="pending">Pending</Select.Option>
                    <Select.Option value="approved">Approved</Select.Option>
                    <Select.Option value="blocked">Blocked</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              {/* Is Active */}
              <Col span={24}>
                <Form.Item
                  label={
                    <span className="C-heading size-xs semiBold mb-0">
                      Active Status
                    </span>
                  }
                  name="isActive"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>
    );
  }
);

PostJobModal.displayName = "PostJobModal";

export default PostJobModal;
