import React, { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, message } from "antd";
import { map as _map } from "lodash-es";
import Icon from "../Icon";
import Image from "next/image";
import CountryDetails from "@/utilities/CountryDetails.json";
import {
  HOME_SEARCH_MIN_LENGTH,
  HOME_SEARCH_TYPE_MAP,
  HOME_SEARCH_PARAMS,
} from "@/constants/homeSearch";
import { companyService, equipmentService, expertService } from "@/utilities/apiServices";

import "./BannerSection.scss";

const SearchContainer = lazy(() => import("../SearchContainer"));

/**
 * Fetches search results from the API for the given type.
 * Used to validate that the search returns successfully before redirecting.
 * @param {string} type - One of 'Companies' | 'Equipments' | 'Experts'
 * @param {Object} params - { search, location (country) }
 * @returns {Promise<Object>} API response
 */
async function fetchSearchByType(type, params) {
  const { search, location } = params;
  const baseParams = { page: 1, limit: 10 };
  if (search) baseParams.search = search;
  if (location) baseParams.country = location;

  switch (type) {
    case "Companies":
      return companyService.getCompanies(baseParams);
    case "Equipments":
      return equipmentService.getEquipment({ ...baseParams, type: params.type || undefined });
    case "Experts":
      return expertService.getExperts(baseParams);
    default:
      throw new Error(`Unknown search type: ${type}`);
  }
}

/**
 * Builds listing page URL with search filters as query params.
 * @param {string} type - Companies | Equipments | Experts
 * @param {Object} values - { search, equipmentType, countrySelect }
 */
function buildSearchUrl(type, values) {
  const config = HOME_SEARCH_TYPE_MAP[type];
  if (!config) return null;

  const search = values.search?.trim() || "";
  const location = values.countrySelect || "";

  const query = new URLSearchParams();
  if (search) query.set(HOME_SEARCH_PARAMS.SEARCH, search);
  if (location) query.set(HOME_SEARCH_PARAMS.LOCATION, location);
  if (values.equipmentType) query.set(HOME_SEARCH_PARAMS.TYPE, values.equipmentType);

  const qs = query.toString();
  return qs ? `${config.route}?${qs}` : config.route;
}

const BannerSection = () => {
  const router = useRouter();
  const [searching, setSearching] = useState(false);

  /**
   * Validation rules for home search (min 4 chars, type and location required).
   * Memoized to avoid re-creating array on every render.
   */
  const searchFieldOptions = useMemo(
    () => [
      {
        type: "search",
        label: "",
        formFieldValue: "search",
        defaultValue: "",
        placeholder: "Search (min 4 characters)",
        icon: "",
        rules: [
          { required: true, message: "Please enter a search term" },
          {
            min: HOME_SEARCH_MIN_LENGTH,
            message: `Search must be at least ${HOME_SEARCH_MIN_LENGTH} characters`,
          },
        ],
      },
      {
        type: "select",
        label: "",
        formFieldValue: "equipmentType",
        defaultValue: "",
        placeholder: "Select type",
        options: [
          { value: "Companies", label: "Company" },
          { value: "Equipments", label: "Equipments" },
          { value: "Experts", label: "Experts" },
        ],
        rules: [{ required: true, message: "Please select type" }],
      },
      {
        type: "countrySelect",
        label: "",
        icon: "",
        formFieldValue: "countrySelect",
        defaultValue: "",
        placeholder: "Select Location",
        rules: [{ required: true, message: "Please select location" }],
        options: _map(CountryDetails, (country) => ({
          value: country?.countryName,
          label: country?.countryName,
        })),
      },
    ],
    []
  );

  /**
   * On submit: validate (handled by Form), call API for selected type, then redirect with filters in URL.
   * Performance: useCallback to avoid recreating handler and unnecessary re-renders of SearchContainer.
   */
  const handleSearch = useCallback(
    async (values) => {
      const type = values.equipmentType;
      if (!type || !HOME_SEARCH_TYPE_MAP[type]) {
        message.error("Please select a valid type");
        return;
      }

      setSearching(true);
      try {
        const params = {
          search: values.search?.trim() || "",
          location: values.countrySelect || "",
          type: values.equipmentType,
        };

        await fetchSearchByType(type, params);

        const url = buildSearchUrl(type, values);
        if (url) {
          router.push(url);
        }
      } catch (err) {
        console.error("Home search API error:", err);
        message.error(err?.message || "Search failed. Please try again.");
      } finally {
        setSearching(false);
      }
    },
    [router]
  );
  return (
    <section className="c-topBanner">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-sm-12 col-md-12 col-lg-8 col-xl-8">
            <div className="hero-content text-left">
              <h1 className="color-dark dont-break extraBold font-family-creative">
              List. Connect. Grow
              </h1>
              <p className="C-heading size-5 mb-3 dont-break ">
              Nipunah connects maritime businesses and experts with verified service providers, <br /> equipment suppliers, and solution partners worldwide.
              </p>

              <p className="C-heading size-6 color-dark mb-0 bold dont-break ">
              Join Nipunah to grow your maritime network
              </p>

              <Suspense fallback={<></>}>
                <SearchContainer
                  searchFieldOptions={searchFieldOptions}
                  onSearch={handleSearch}
                  submitLoading={searching}
                />
              </Suspense>
            </div>
          </div>
          <div className="col-md-4 col-xl-4 d-lg-block d-none">
            <div className="bannerImage">
              <Image
                src="/assets/images/dummy-banner.png"
                alt="My Logo"
                width={180}
                height={60}
                className="img-fluid img-thumbnail rounded-5 shadow"
              />
              <div className="p-4 bg-white shadow-sm rounded content-1 text-center">
                <span className="C-heading size-xs bold color-dark mb-2">
                  10k+ Candidates
                </span>
                <Avatar.Group>
                  <Avatar className="bg-color-primary" size={40}>
                    <Icon name="person" className="color-white" />
                  </Avatar>
                  <Avatar className="bg-color-primary" size={40}>
                    <Icon name="person" className="color-white" />
                  </Avatar>
                  <Avatar className="bg-color-primary" size={40}>
                    <Icon name="person" className="color-white" />
                  </Avatar>
                  <Avatar
                    style={{ backgroundColor: "#f9ab00" }}
                    icon={<Icon name="add" className="color-white" />}
                    size={40}
                  />
                </Avatar.Group>
              </div>
              <div className="p-4 bg-white shadow-sm rounded content-2 text-center">
                <span className="C-heading size-xs bold color-dark mb-2">
                  100+ Companies
                </span>
                <Avatar.Group shape="square">
                  <Avatar className="bg-color-primary" size={40}>
                    <Icon
                      name="business_center"
                      isFilled
                      className="color-white"
                      size="small"
                    />
                  </Avatar>
                  <Avatar className="bg-color-primary" size={40}>
                    <Icon
                      name="business_center"
                      isFilled
                      className="color-white"
                      size="small"
                    />
                  </Avatar>
                  <Avatar className="bg-color-primary" size={40}>
                    <Icon
                      name="business_center"
                      isFilled
                      className="color-white"
                      size="small"
                    />
                  </Avatar>
                  <Avatar
                    style={{ backgroundColor: "#f9ab00" }}
                    icon={<Icon name="add" className="color-white" />}
                    size={40}
                  />
                </Avatar.Group>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
