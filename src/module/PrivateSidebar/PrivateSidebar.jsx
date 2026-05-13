import React, { useMemo, useCallback, memo, useEffect, useState } from "react";
import "./PrivateSidebar.scss";
import { Space } from "antd";
import Icon from "@/components/Icon";
import { map as _map } from "lodash-es";
import { DASHBOARD_ROUTES } from "module/utility/utility";
import { usePathname, useRouter } from "next/navigation";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { useRole } from "@/hooks/useRole";
import { ROUTES } from "@/constants/routes";

const DASHBOARD_NAVS = DASHBOARD_ROUTES?.COMPANY ?? [];
const SIDEBAR_NAV_ORDER_STORAGE_KEY = "nipunah_sidebar_nav_order";
const MODULE_KEY_TO_NAV_KEY = {
  dashboard: "nav_dashboard",
  categories: "nav_categories",
  experts: "nav_experts",
  users: "nav_users",
  company: "nav_companies",
  services: "nav_services",
  jobs: "nav_jobs",
  pricing: "nav_pricing",
  enquiries: "nav_enquiries",
  equipments: "nav_equipments",
  role_management: "nav_role_management",
};
const DASHBOARD_MODULE_KEY = "dashboard";

/** Injected for regular users only; not part of role-based module visibility. */
const USER_BECOME_EXPERT_NAV = {
  route: ROUTES?.PRIVATE?.UPGRADE_EXPERT,
  label: "Become an Expert",
  subHeading: "Request upgrade to an expert profile",
  id: "user-become-expert-sidebar",
  icon: "workspace_premium",
  moduleKey: "__user_become_expert__",
};

function applyStoredNavOrder(navItems) {
  if (typeof window === "undefined") return navItems;
  try {
    const raw = window.localStorage.getItem(SIDEBAR_NAV_ORDER_STORAGE_KEY);
    const order = JSON.parse(raw || "[]");
    if (!Array.isArray(order) || order.length === 0) return navItems;
    const orderIndex = new Map(order.map((key, idx) => [key, idx]));
    return [...navItems].sort((a, b) => {
      const aKey = MODULE_KEY_TO_NAV_KEY[a.moduleKey] || "";
      const bKey = MODULE_KEY_TO_NAV_KEY[b.moduleKey] || "";
      const ai = orderIndex.has(aKey) ? orderIndex.get(aKey) : Number.MAX_SAFE_INTEGER;
      const bi = orderIndex.has(bKey) ? orderIndex.get(bKey) : Number.MAX_SAFE_INTEGER;
      return ai - bi;
    });
  } catch {
    return navItems;
  }
}

const PrivateSidebar = memo(function PrivateSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { visibleModuleKeys } = useRolePermissions();
  const { isUser } = useRole();
  const [orderVersion, setOrderVersion] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleOrderChange = () => setOrderVersion((prev) => prev + 1);
    window.addEventListener("sidebar-nav-order-updated", handleOrderChange);
    return () => {
      window.removeEventListener("sidebar-nav-order-updated", handleOrderChange);
    };
  }, []);

  const handleNavigation = useCallback(
    (route) => {
      if (!route) return;
      router.push(route);
    },
    [router]
  );

  const visibleNavs = useMemo(
    () => {
      const filtered = DASHBOARD_NAVS.filter(
        (nav) =>
          !nav.moduleKey ||
          nav.moduleKey === DASHBOARD_MODULE_KEY ||
          visibleModuleKeys.has(nav.moduleKey)
      );

      const dashboardItem = filtered.find(
        (item) => item?.moduleKey === DASHBOARD_MODULE_KEY
      );

      // User role: Dashboard pinned first, Become an Expert pinned second,
      // remaining items follow the role-management order.
      if (isUser() && dashboardItem?.route) {
        const rest = filtered.filter(
          (item) => item?.moduleKey !== DASHBOARD_MODULE_KEY
        );
        const sortedRest = applyStoredNavOrder(rest);
        return [dashboardItem, USER_BECOME_EXPERT_NAV, ...sortedRest];
      }

      // All other roles: respect role-management order for every item,
      // including Dashboard.
      return applyStoredNavOrder(filtered);
    },
    [visibleModuleKeys, orderVersion, isUser]
  );

  return (
    <div className="c-privateSidebar">
      <div className="sidebar-body p-3">
        <div className="d-flex flex-column gap-1">
          {_map(visibleNavs, (nav) => (
            <button
              className={`C-button is-clean width-100 p-0 p-2 text-left sidebarNav ${
                pathname === nav?.route ? "active" : ""
              }`}
              key={nav?.id}
              onClick={() => nav?.route && handleNavigation(nav.route)}
            >
              <Space align="center" size={6}>
                <Icon name={nav?.icon} style={{ fontSize: "1.4rem" }} />
                <span className="C-heading size-xs color-light mb-0 bold">
                  {nav?.label}
                </span>
              </Space>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default PrivateSidebar;
