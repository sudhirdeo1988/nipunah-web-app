import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { DASHBOARD_ROUTES } from "../utility/utility";
import "./PrivateHeader.scss";

/**
 * PrivateHeader Component
 *
 * Displays dynamic heading and sub-heading based on current route
 * Uses DASHBOARD_ROUTES from utility file to match current pathname
 *
 * @component
 * @returns {JSX.Element} The PrivateHeader component
 */
const PrivateHeader = () => {
  const pathname = usePathname();

  /**
   * Finds the matching route data based on current pathname
   * @returns {Object|null} Route data object or null if not found
   */
  const currentRouteData = useMemo(() => {
    // Flatten all routes from DASHBOARD_ROUTES.COMPANY
    const allRoutes = DASHBOARD_ROUTES.COMPANY;

    // Find matching route
    const matchingRoute = allRoutes.find((route) => route.route === pathname);

    return matchingRoute || null;
  }, [pathname]);

  return (
    <div className="privateHeader w-100">
      <div className="row">
        <div className="col-8">
          <h2 className="C-heading size-5 extraBold color-dark mb-1">
            {currentRouteData?.label || "Dashboard"}
          </h2>
          <h4 className="C-heading size-xs semiBold color-light mb-0">
            {currentRouteData?.subHeading || "Manage your application"}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default PrivateHeader;
