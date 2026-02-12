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
import "./SearchContainer.scss";

/**
 * SearchContainer Component
 *
 * A reusable search form container that dynamically renders form fields based on configuration.
 * Supports floating/fixed positioning on scroll and works seamlessly on listing pages.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.forListingPage - Applies listing page specific styling
 * @param {boolean} props.floatingEnable - Enables fixed positioning on scroll
 * @param {Array} props.searchFieldOptions - Array of field configuration objects
 * @param {Function} props.onSearch - Callback function called when form is submitted
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
    floatingEnable, // Enables fixed positioning when scrolling past the container
    searchFieldOptions = [], // Array of field configurations from props
    onSearch, // Callback function when form is submitted
    inSidebar,
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

  /**
   * Memoized column classes based on field index
   * Optimizes column width distribution for responsive layout
   */
  const getColumnClasses = useCallback((index) => {
    if (index === 0) {
      return "col-lg-4 col-md-4 col-sm-6 col-xs-12 p-3";
    } else if (index === 1) {
      return "col-lg-3 col-md-3 col-sm-6 col-xs-12 p-3";
    }
    return "col-lg-3 col-md-3 col-sm-6 col-xs-12 p-3";
  }, []);

  /**
   * Memoized form initial values from field configurations
   * Prevents unnecessary re-renders when form initializes
   */
  const formInitialValues = useMemo(() => {
    const initialValues = {};
    searchFieldOptions.forEach((field) => {
      if (field.defaultValue !== undefined && field.defaultValue !== "") {
        initialValues[field.formFieldValue] = field.defaultValue;
      }
    });
    return initialValues;
  }, [searchFieldOptions]);

  /**
   * Renders a form field based on its type configuration
   * @param {Object} fieldConfig - Field configuration object
   * @param {number} index - Field index in the array
   * @returns {JSX.Element|null} Rendered form field component
   */
  const renderField = useCallback(
    (fieldConfig, index) => {
      const { type, formFieldValue, placeholder, options, icon, label } =
        fieldConfig;

      const colClasses = getColumnClasses(index);

      // Check if icon is provided and not empty
      const hasIcon = icon && icon.trim() !== "";

      switch (type) {
        case "select":
          return (
            <div key={formFieldValue} className={colClasses}>
              <Form.Item 
                name={formFieldValue} 
                style={{ marginBottom: 0 }}
                label={label}
              >
                <Select
                  placeholder={placeholder}
                  variant="borderless"
                  options={options}
                  className="selectInSearch"
                  suffixIcon={<Icon name="keyboard_arrow_down" />}
                  prefix={hasIcon ? <Icon name={icon} /> : <Icon name="apps" />}
                />
              </Form.Item>
            </div>
          );

        case "search":
          return (
            <div key={formFieldValue} className={colClasses}>
              <Form.Item 
                name={formFieldValue} 
                style={{ marginBottom: 0 }}
                label={label}
              >
                <Input
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
              <Form.Item 
                name={formFieldValue} 
                style={{ marginBottom: 0 }}
                label={label}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder={placeholder}
                  variant="borderless"
                  options={options}
                  suffixIcon={<Icon name="keyboard_arrow_down" />}
                  prefix={
                    hasIcon ? <Icon name={icon} /> : <Icon name="location_on" />
                  }
                  className="selectInSearch"
                />
              </Form.Item>
            </div>
          );

        default:
          return null;
      }
    },
    [getColumnClasses]
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
  useEffect(() => {
    if (!floatingEnable) return;

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
  }, [floatingEnable]);

  /**
   * Memoized container className
   * Prevents unnecessary string concatenation on every render
   */
  const containerClassName = useMemo(() => {
    return `searchContainer row align-items-center ${
      !inSidebar ? "shadow" : "p-0"
    } ${forListingPage ? "inListingPage" : ""} ${
      isFixed ? "fixed" : ""
    }`.trim();
  }, [forListingPage, isFixed]);

  return (
    <div className={containerClassName} ref={containerRef} style={fixedStyles}>
      <Form
        form={form}
        onFinish={handleSubmit}
        initialValues={formInitialValues}
        className="w-100"
        style={
          inSidebar
            ? {}
            : {
                display: "flex",
                alignItems: "center",
                width: "100%",
                flexWrap: "wrap",
              }
        }
      >
        {renderedFields}
        <div className="col-lg-2 col-md-2 col-sm-6 col-xs-12 text-center">
          <Form.Item style={{ marginBottom: 0 }}>
            <button type="submit" className="C-button is-filled w-100 p-3">
              Search
            </button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default SearchContainer;
