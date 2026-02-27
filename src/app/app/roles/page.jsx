"use client";

import React, { useState, useCallback, useEffect, useMemo, memo } from "react";
import { Switch, Button, message, Tabs } from "antd";
import { map as _map } from "lodash-es";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import Icon from "@/components/Icon";
import { ROLE_MANAGEMENT_MOCK } from "@/constants/roleManagementMock";
import { useModuleAccess } from "@/hooks/useModuleAccess";

const ROLE_PERMISSIONS_API =
  process.env.NEXT_PUBLIC_ROLE_PERMISSIONS_API || "/api/roles";

const MODULE_BLOCK_STYLE = { background: "#fafafa" };
const LABEL_STYLE = { cursor: "pointer" };
const PERM_LABEL_STYLE = { textTransform: "capitalize", fontSize: "0.875rem" };
const COMP_LABEL_STYLE = { fontSize: "0.875rem" };
const ICON_WHITE_STYLE = { color: "#fff" };

const PermissionsPanel = memo(function PermissionsPanel({
  roleKey,
  modules,
  updateRoleModules,
}) {
  const toggleModuleVisible = useCallback(
    (moduleKey) => {
      updateRoleModules(roleKey, (mods) => ({
        ...mods,
        [moduleKey]: {
          ...mods[moduleKey],
          visible: !mods[moduleKey]?.visible,
        },
      }));
    },
    [roleKey, updateRoleModules]
  );

  const togglePermission = useCallback(
    (moduleKey, permissionKey) => {
      updateRoleModules(roleKey, (mods) => {
        const mod = mods[moduleKey];
        if (!mod?.permissions) return mods;
        return {
          ...mods,
          [moduleKey]: {
            ...mod,
            permissions: {
              ...mod.permissions,
              [permissionKey]: !mod.permissions[permissionKey],
            },
          },
        };
      });
    },
    [roleKey, updateRoleModules]
  );

  const toggleComponentVisible = useCallback(
    (moduleKey, componentKey) => {
      updateRoleModules(roleKey, (mods) => {
        const mod = mods[moduleKey];
        const comps = mod?.components ?? {};
        return {
          ...mods,
          [moduleKey]: {
            ...mod,
            components: {
              ...comps,
              [componentKey]: {
                ...comps[componentKey],
                label: comps[componentKey]?.label ?? componentKey,
                visible: !comps[componentKey]?.visible,
              },
            },
          },
        };
      });
    },
    [roleKey, updateRoleModules]
  );

  return (
    <div className="d-flex flex-column gap-3 pt-2">
      {_map(modules, (config, moduleKey) => {
        if (!config) return null;
        const perms = config.permissions ?? {};
        const components = config.components ?? {};
        const hasComponents = Object.keys(components).length > 0;

        return (
          <div
            key={moduleKey}
            className="border rounded p-3"
            style={MODULE_BLOCK_STYLE}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fw-semibold">{config.label ?? moduleKey}</span>
              <Switch
                checked={!!config.visible}
                onChange={() => toggleModuleVisible(moduleKey)}
              />
            </div>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {_map(perms, (value, permKey) => (
                <label
                  key={permKey}
                  className="d-inline-flex align-items-center gap-1 rounded px-2 py-1 border bg-white"
                  style={LABEL_STYLE}
                >
                  <span style={PERM_LABEL_STYLE}>
                    {permKey.replace(/_/g, " ")}
                  </span>
                  <Switch
                    size="small"
                    checked={!!value}
                    onChange={() => togglePermission(moduleKey, permKey)}
                  />
                </label>
              ))}
            </div>
            {hasComponents && (
              <div className="mt-2 pt-2 border-top">
                <div className="small text-muted mb-1">Components</div>
                <div className="d-flex flex-wrap gap-2">
                  {_map(components, (comp, compKey) => (
                    <label
                      key={compKey}
                      className="d-inline-flex align-items-center gap-1 rounded px-2 py-1 border bg-white"
                      style={LABEL_STYLE}
                    >
                      <span style={COMP_LABEL_STYLE}>
                        {comp?.label ?? compKey}
                      </span>
                      <Switch
                        size="small"
                        checked={!!comp?.visible}
                        onChange={() =>
                          toggleComponentVisible(moduleKey, compKey)
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

/**
 * Role Management – manage permissions for all roles (admin, user, expert, company).
 * GET {base}/permissions → [{ role: { key, label }, modules }, ...]
 * PUT {base}/permissions → body: same array (all roles).
 */
const RoleManagementPage = () => {
  const { allowed, permissions } = useModuleAccess("role_management");
  const [rolesData, setRolesData] = useState([]);
  const [selectedRoleKey, setSelectedRoleKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ROLE_PERMISSIONS_API}/permissions`);
      if (!res.ok) throw new Error("Failed to load permissions");
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : null);
      if (list?.length) {
        setRolesData(list);
        setSelectedRoleKey((prev) => {
          const firstKey = list[0]?.role?.key;
          if (!firstKey) return prev;
          if (!prev || !list.some((r) => r?.role?.key === prev)) return firstKey;
          return prev;
        });
      } else throw new Error("Invalid response");
    } catch (err) {
      console.warn("Role permissions API not available, using mock:", err?.message);
      setRolesData(ROLE_MANAGEMENT_MOCK);
      setSelectedRoleKey(ROLE_MANAGEMENT_MOCK[0]?.role?.key ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const updateRoleModules = useCallback((roleKey, updater) => {
    setRolesData((prev) =>
      prev.map((item) =>
        item?.role?.key === roleKey
          ? { ...item, modules: updater(item.modules) }
          : item
      )
    );
  }, []);

  const savePermissions = useCallback(async () => {
    console.log("Save permissions – payload (all roles):", rolesData);
    setSaving(true);
    try {
      const res = await fetch(`${ROLE_PERMISSIONS_API}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rolesData),
      });
      if (!res.ok) throw new Error("Failed to save permissions");
      message.success("Permissions updated");
      loadPermissions();
    } catch (err) {
      message.error(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [rolesData, loadPermissions]);

  const list = useMemo(
    () => (rolesData.length ? rolesData : ROLE_MANAGEMENT_MOCK),
    [rolesData]
  );

  const roleTabs = useMemo(
    () =>
      list.map((item) => {
        const roleKey = item.role?.key ?? "";
        const roleLabel = item.role?.label ?? item.role?.key ?? "—";
        const modules = item.modules ?? {};
        return {
          key: roleKey,
          label: roleLabel,
          children: (
            <PermissionsPanel
              roleKey={roleKey}
              modules={modules}
              updateRoleModules={updateRoleModules}
            />
          ),
        };
      }),
    [list, updateRoleModules]
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
          activeKey={selectedRoleKey ?? list[0]?.role?.key ?? ""}
          onChange={setSelectedRoleKey}
          items={roleTabs}
        />
      </div>
    </div>
  );
};

export default RoleManagementPage;
