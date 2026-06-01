import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Input, Select, Form } from "antd";
import { map as _map } from "lodash-es";
import Icon from "../Icon";
import { startsWithSelectFilter } from "@/utilities/selectFilters";
import "./SearchContainer.scss";

/** Ant Design shows placeholders only when the field value is unset, not `""`. */
function toEmptyFormValues(values) {
  if (!values || typeof values !== "object") return {};
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      value === "" || value === null ? undefined : value,
    ])
  );
}

function isSearchFieldFilled(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim() !== "";
  return true;
}

/**
 * SearchContainer Component
 *
 * A reusable search form container that dynamically renders form fields based on configuration.
 * Supports floating/fixed positioning on scroll and works seamlessly on listing pages.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.forListingPage - Applies listing page specific styling
 * @param {boolean} props.floatingEnable - Enables fixed positioning on scroll
 * @param {Array} props.searchFieldOptions - Array of field configuration objects.
 *   Each field may include optional `rules` (Ant Design Form.Item rules) for validation.
 * @param {Function} props.onSearch - Callback function called when form is submitted
 * @param {boolean} [props.submitLoading] - If true, submit button shows "Searching..." and is disabled
 *
 * @example
 * <SearchContainer
 *   forListingPage
 *   floatingEnable
 *   searchFieldOptions={[
 *     { type: "select", formFieldValue: "type", options: [...] },
 *     { type: "search", formFieldValue: "search" },
 *     { type: "countrySelect", formFieldValue: "location", options: [...] }
 *   ]}
 *   onSearch={(values) => console.log(values)}
 * />
 */
const SearchContainer = (props) => {
  const {
    forListingPage,
    floatingEnable,
    searchFieldOptions = [],
    onSearch,
    onClear,
    clearValues,
    inSidebar,
    submitLoading = false, // Optional: show loading state on submit button (e.g. home page API + redirect)
  } = props;

  const [form] = Form.useForm();

  const containerRef = useRef(null);
  const [isFixed, setIsFixed] = useState(false);
  const [fixedStyles, setFixedStyles] = useState({});
  const initialOffset = useRef(0);

  /**
   * Handles form submission
   * @param {Object} values - Form values object containing all field values
   * @returns {Object} Form values
   */
  const handleSubmit = useCallback(
    (values) => {
      if (onSearch && typeof onSearch === "function") {
        onSearch(values);
      }
      return values;
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    const rawReset =
      clearValues && typeof clearValues === "object"
        ? clearValues
        : searchFieldOptions.reduce((acc, field) => {
            acc[field.formFieldValue] =
              field.defaultValue !== undefined ? field.defaultValue : undefined;
            return acc;
          }, {});

    const resetValues = toEmptyFormValues(rawReset);
    form.resetFields();
    form.setFieldsValue(resetValues);
    if (onClear && typeof onClear === "function") {
      onClear(resetValues);
    }
  }, [form, onClear, clearValues, searchFieldOptions]);

  /**
   * Memoized column classes based on field index
   * Optimizes column width distribution for responsive layout
   */
  const getFieldColumnClasses = useCallback(
    () => "col-12 col-md-6 col-lg-3 searchContainer__fieldCol p-2 p-md-3",
    []
  );

  const actionsColumnClasses =
    "col-12 col-md-6 col-lg-3 searchContainer__actionsCol p-2 p-md-3";

  /**
   * Memoized form initial values from field configurations
   * Prevents unnecessary re-renders when form initializes
   */
  const formInitialValues = useMemo(() => {
    const initialValues = {};
    searchFieldOptions.forEach((field) => {
      const value = field.defaultValue;
      initialValues[field.formFieldValue] =
        value !== undefined && value !== "" ? value : undefined;
    });
    return toEmptyFormValues(initialValues);
  }, [searchFieldOptions]);

  /** Keep form in sync with listing filters so empty fields show placeholders. */
  useEffect(() => {
    form.setFieldsValue(formInitialValues);
  }, [form, formInitialValues]);

  const watchedValues = Form.useWatch([], form);

  const showClearButton = useMemo(() => {
    if (!forListingPage) return false;
    const values =
      watchedValues && typeof watchedValues === "object"
        ? watchedValues
        : form.getFieldsValue();
    return searchFieldOptions.some((field) => {
      const key = field.formFieldValue;
      const value = values?.[key] ?? formInitialValues[key];
      return isSearchFieldFilled(value);
    });
  }, [forListingPage, watchedValues, searchFieldOptions, form, formInitialValues]);

  /**
   * Resolve a tiny field label to render above each input.
   *
   * Priority:
   * 1. Explicit non-empty `fieldConfig.label` from the caller.
   * 2. Sensible default derived from `type` + placeholder
   *    (e.g. "Select company type" → "Company type", "Search (min 4)" → "Search").
   *
   * Returns "" to opt out of rendering a label.
   */
  const resolveFieldLabel = useCallback((fieldConfig) => {
    const explicit =
      typeof fieldConfig.label === "string" ? fieldConfig.label.trim() : "";
    if (explicit) return explicit;

    const placeholder =
      typeof fieldConfig.placeholder === "string" ? fieldConfig.placeholder : "";

    switch (fieldConfig.type) {
      case "search":
        return "Search";
      case "countrySelect":
        return "Location";
      case "select": {
        // Strip leading "Select " from placeholders like "Select company type"
        // and a trailing " (optional)" hint. Fallback to a generic "Filter".
        const stripped = placeholder
          .replace(/^select\s+/i, "")
          .replace(/\s*\(optional\)\s*$/i, "")
          .trim();
        if (!stripped) return "Filter";
        return stripped.charAt(0).toUpperCase() + stripped.slice(1);
      }
      default:
        return "";
    }
  }, []);

  /**
   * Renders a form field based on its type configuration
   * @param {Object} fieldConfig - Field configuration object
   * @param {number} index - Field index in the array
   * @returns {JSX.Element|null} Rendered form field component
   */
  /**
   * Renders a form field with optional validation rules from fieldConfig.rules
   */
  const renderField = useCallback(
    (fieldConfig, index) => {
      const {
        type,
        formFieldValue,
        placeholder,
        options,
        icon,
        rules,
        selectProps,
        hideLabel,
      } = fieldConfig;

      const colClasses = getFieldColumnClasses();
      const hasIcon = icon && icon.trim() !== "";

      /* Form.Item rules: optional Ant Design validation rules per field */
      const itemRules = Array.isArray(rules) ? rules : undefined;

      // Small caption-style label above each field on inner listing pages.
      // The Form.Item's own `label` prop is intentionally not used so we can
      // fully control typography (tiny, light) without fighting antd defaults.
      const fieldLabel = hideLabel ? "" : resolveFieldLabel(fieldConfig);
      const labelNode = fieldLabel ? (
        <label
          className="searchFieldLabel"
          htmlFor={`search-field-${formFieldValue}`}
        >
          {fieldLabel}
        </label>
      ) : null;

      switch (type) {
        case "select":
          return (
            <div key={formFieldValue} className={colClasses}>
              {labelNode}
              <Form.Item
                name={formFieldValue}
                style={{ marginBottom: 0 }}
                rules={itemRules}
              >
                <Select
                  id={`search-field-${formFieldValue}`}
                  size="large"
                  placeholder={placeholder}
                  variant="borderless"
                  options={options}
                  allowClear
                  className="selectInSearch"
                  suffixIcon={<Icon name="keyboard_arrow_down" />}
                  prefix={hasIcon ? <Icon name={icon} /> : <Icon name="apps" />}
                  {...(selectProps && typeof selectProps === "object"
                    ? selectProps
                    : {})}
                />
              </Form.Item>
            </div>
          );

        case "search":
          return (
            <div key={formFieldValue} className={colClasses}>
              {labelNode}
              <Form.Item
                name={formFieldValue}
                style={{ marginBottom: 0 }}
                rules={itemRules}
              >
                <Input
                  id={`search-field-${formFieldValue}`}
                  size="large"
                  placeholder={placeholder}
                  prefix={
                    hasIcon ? <Icon name={icon} /> : <Icon name="search" />
                  }
                  className="searchInput"
                />
              </Form.Item>
            </div>
          );

        case "countrySelect":
          return (
            <div key={formFieldValue} className={colClasses}>
              {labelNode}
              <Form.Item
                name={formFieldValue}
                style={{ marginBottom: 0 }}
                rules={itemRules}
              >
                <Select
                  id={`search-field-${formFieldValue}`}
                  size="large"
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  filterOption={startsWithSelectFilter}
                  placeholder={placeholder}
                  variant="borderless"
                  options={options}
                  suffixIcon={<Icon name="keyboard_arrow_down" />}
                  prefix={
                    hasIcon ? <Icon name={icon} /> : <Icon name="location_on" />
                  }
                  className="selectInSearch"
                  {...(selectProps && typeof selectProps === "object"
                    ? selectProps
                    : {})}
                />
              </Form.Item>
            </div>
          );

        default:
          return null;
      }
    },
    [getFieldColumnClasses, resolveFieldLabel]
  );

  /**
   * Memoized rendered fields array
   * Prevents re-rendering fields when unrelated state changes
   */
  const renderedFields = useMemo(() => {
    return _map(searchFieldOptions, (fieldConfig, index) =>
      renderField(fieldConfig, index)
    );
  }, [searchFieldOptions, renderField]);

  /**
   * Effect hook for handling floating/fixed positioning on scroll
   * Uses requestAnimationFrame for smooth scroll performance
   */
  const enableFloating = floatingEnable && !inSidebar;

  useEffect(() => {
    if (!enableFloating) return;

    let rect = {};
    let style = {};
    let rafId = null;

    // Calculate initial offset and container dimensions
    if (containerRef.current) {
      rect = containerRef.current.getBoundingClientRect();
      initialOffset.current = rect.top + window.scrollY - 72;

      // Store width and left offset for fixed position
      style = {
        width: rect.width,
        left: rect.left,
      };
    }

    /**
     * Optimized scroll handler using requestAnimationFrame
     * Reduces unnecessary re-renders and improves scroll performance
     */
    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        if (window.scrollY >= initialOffset.current) {
          setIsFixed(true);
          setFixedStyles(style);
        } else {
          setIsFixed(false);
          setFixedStyles({});
        }
      });
    };

    // Initial check on mount
    handleScroll();

    // Add scroll event listener with passive option for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup: remove event listener and cancel any pending animation frames
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [enableFloating]);

  /**
   * Memoized container className
   * Prevents unnecessary string concatenation on every render
   */
  const containerClassName = useMemo(() => {
    return `searchContainer row align-items-stretch ${
      !inSidebar ? "shadow" : "p-0 isSidebar"
    } ${forListingPage ? "inListingPage" : ""} ${
      isFixed ? "fixed" : ""
    }`.trim();
  }, [forListingPage, inSidebar, isFixed]);

  return (
    <div className={containerClassName} ref={containerRef} style={fixedStyles}>
      <Form
        form={form}
        onFinish={handleSubmit}
        initialValues={formInitialValues}
        className="w-100 searchContainer__form"
        style={
          inSidebar
            ? { width: "100%" }
            : {
                display: "flex",
                alignItems: "stretch",
                width: "100%",
                flexWrap: "wrap",
              }
        }
      >
        {renderedFields}
        <div className={`${actionsColumnClasses} text-center text-md-end`}>
          <Form.Item style={{ marginBottom: 0 }} className="searchContainer__actionsItem">
            <div className="d-flex gap-2 searchContainer__actions">
              {showClearButton ? (
                <button
                  type="button"
                  className="C-button is-outlined p-3"
                  onClick={handleClear}
                  aria-label="Clear filters"
                  title="Clear filters"
                  style={{ minWidth: 48 }}
                >
                  <Icon name="close" />
                </button>
              ) : null}
              <button
                type="submit"
                className="C-button is-filled w-100 p-3"
                disabled={submitLoading}
              >
                {submitLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default SearchContainer;
