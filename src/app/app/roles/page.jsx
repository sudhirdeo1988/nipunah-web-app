"use client";

import React, { useState, useCallback, useEffect, useMemo, memo } from "react";
import { Switch, Button, message, Tabs } from "antd";
import { map as _map } from "lodash-es";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import Icon from "@/components/Icon";
import { ROLE_MANAGEMENT_MOCK } from "@/constants/roleManagementMock";
import { useModuleAccess } from "@/hooks/useModuleAccess";

const MODULE_BLOCK_STYLE = { background: "#fafafa" };
const LABEL_STYLE = { cursor: "pointer" };
const PERM_LABEL_STYLE = { textTransform: "capitalize", fontSize: "0.875rem" };
const ICON_WHITE_STYLE = { color: "#fff" };
const ROLE_LABELS = {
  admin: "Administrator",
  user: "User",
  expert: "Expert",
  company: "Company",
};

const NAV_KEYS = [
  "nav_dashboard",
  "nav_categories",
  "nav_experts",
  "nav_users",
  "nav_companies",
  "nav_jobs",
  "nav_equipments",
  "nav_role_management",
];

const DASHBOARD_KEYS = [
  "dashboard_registered_companies",
  "dashboard_total_users",
  "dashboard_total_experts",
  "dashboard_active_jobs",
  "dashboard_analytics_overview",
];

const MODULE_PERMISSION_KEYS = [
  "dashboard_view",
  "users_view",
  "users_add",
  "users_edit",
  "users_delete",
  "users_approve",
  "experts_view",
  "experts_add",
  "experts_edit",
  "experts_delete",
  "experts_approve",
  "company_view",
  "company_add",
  "company_edit",
  "company_delete",
  "company_approve",
  "jobs_view",
  "jobs_add",
  "jobs_edit",
  "jobs_delete",
  "jobs_apply",
  "jobs_approve",
  "equipments_view",
  "equipments_add",
  "equipments_edit",
  "equipments_delete",
  "categories_view",
  "categories_add",
  "categories_edit",
  "categories_delete",
  "categories_view_sub_category",
  "categories_add_sub_category",
  "categories_edit_sub_category",
  "categories_delete_sub_category",
  "role_management_view",
  "role_management_add",
  "role_management_edit",
  "role_management_delete",
];

const KEY_GROUPS = [
  { label: "Navigation", keys: NAV_KEYS },
  { label: "Dashboard Widgets", keys: DASHBOARD_KEYS },
  { label: "Module Permissions", keys: MODULE_PERMISSION_KEYS },
];

const PermissionsPanel = memo(function PermissionsPanel({ roleKey, data, onToggleKey }) {
  const renderLabel = useCallback(
    (key) => key.replace(/_/g, " "),
    []
  );

  return (
    <div className="d-flex flex-column gap-3 pt-2">
      {_map(KEY_GROUPS, (group) => (
          <div
            key={group.label}
            className="border rounded p-3"
            style={MODULE_BLOCK_STYLE}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fw-semibold">{group.label}</span>
            </div>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {_map(group.keys, (key) => (
                <label
                  key={key}
                  className="d-inline-flex align-items-center gap-1 rounded px-2 py-1 border bg-white"
                  style={LABEL_STYLE}
                >
                  <span style={PERM_LABEL_STYLE}>
                    {renderLabel(key)}
                  </span>
                  <Switch
                    size="small"
                    checked={!!data[key]}
                    onChange={() => onToggleKey(roleKey, key)}
                  />
                </label>
              ))}
            </div>
          </div>
      ))}
    </div>
  );
});

/**
 * Role Management – manage flat permissions for all roles.
 */
const RoleManagementPage = () => {
  const { allowed, permissions } = useModuleAccess("role_management");
  const [rolesData, setRolesData] = useState({});
  const [selectedRoleKey, setSelectedRoleKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const localClone = JSON.parse(JSON.stringify(ROLE_MANAGEMENT_MOCK));
      setRolesData(localClone);
      setSelectedRoleKey((prev) => prev || Object.keys(localClone)[0] || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const toggleKey = useCallback((roleKey, key) => {
    setRolesData((prev) => ({
      ...prev,
      [roleKey]: {
        ...(prev[roleKey] || {}),
        [key]: !prev?.[roleKey]?.[key],
      },
    }));
  }, []);

  const savePermissions = useCallback(async () => {
    console.log("Save permissions – payload (all roles, flat):", rolesData);
    setSaving(true);
    try {
      // Static frontend-only mode: show payload in console for manual code update.
      message.success("Updated in current session only. Update ROLE_MANAGEMENT_MOCK in code to persist.");
    } catch (err) {
      message.error(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [rolesData]);

  const list = useMemo(
    () => {
      const source =
        Object.keys(rolesData).length ? rolesData : ROLE_MANAGEMENT_MOCK;
      return Object.keys(source).map((roleKey) => ({
        roleKey,
        label: ROLE_LABELS[roleKey] || roleKey,
        data: source[roleKey] || {},
      }));
    },
    [rolesData]
  );

  const roleTabs = useMemo(
    () =>
      list.map((item) => {
        const roleKey = item.roleKey ?? "";
        const roleLabel = item.label ?? roleKey ?? "—";
        return {
          key: roleKey,
          label: roleLabel,
          children: (
            <PermissionsPanel
              roleKey={roleKey}
              data={item.data}
              onToggleKey={toggleKey}
            />
          ),
        };
      }),
    [list, toggleKey]
  );

  if (!allowed) return null;

  if (loading) {
    return (
      <div className="bg-white rounded shadow-sm p-4">
        <AppPageHeader title="Role Management" subtitle="Manage permissions for all roles" />
        <div className="text-center py-5 text-muted">Loading…</div>
      </div>
    );
  }

  const canEdit = Boolean(permissions.edit);

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Role Management"
        subtitle="Manage permissions for all roles (admin, user, expert, company)"
      >
        {canEdit && (
          <Button
            type="primary"
            icon={<Icon name="save" style={ICON_WHITE_STYLE} />}
            onClick={savePermissions}
            loading={saving}
          >
            Save permissions
          </Button>
        )}
      </AppPageHeader>
      <div className="p-3">
        <Tabs
          type="card"
          activeKey={selectedRoleKey ?? list[0]?.roleKey ?? ""}
          onChange={setSelectedRoleKey}
          items={roleTabs}
        />
      </div>
    </div>
  );
};

export default RoleManagementPage;
