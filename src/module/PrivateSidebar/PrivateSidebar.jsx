import React, { useMemo, useCallback, memo } from "react";
import "./PrivateSidebar.scss";
import { Space } from "antd";
import Icon from "@/components/Icon";
import { map as _map } from "lodash-es";
import { DASHBOARD_ROUTES } from "module/utility/utility";
import { usePathname, useRouter } from "next/navigation";
import { useRolePermissions } from "@/hooks/useRolePermissions";

const DASHBOARD_NAVS = DASHBOARD_ROUTES?.COMPANY ?? [];

const PrivateSidebar = memo(function PrivateSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { visibleModuleKeys } = useRolePermissions();

  const handleNavigation = useCallback(
    (route) => {
      if (!route) return;
      router.push(route);
    },
    [router]
  );

  const visibleNavs = useMemo(
    () =>
      DASHBOARD_NAVS.filter(
        (nav) => !nav.moduleKey || visibleModuleKeys.has(nav.moduleKey)
      ),
    [visibleModuleKeys]
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
