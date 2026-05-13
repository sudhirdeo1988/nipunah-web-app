"use client";

import React, { useState, useCallback, useEffect, useMemo, memo } from "react";
import { Switch, Button, message, Tabs, Input } from "antd";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import Icon from "@/components/Icon";
import { ROLE_MANAGEMENT_MOCK } from "@/constants/roleManagementMock";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import {
  clearRolePermissionsCache,
  fetchRolePermissions,
} from "@/utilities/rolePermissionsApi";
import { normalizeRolesPermissions } from "@/utilities/rolePermissionsMapper";

const MODULE_BLOCK_STYLE = { background: "#ffffff", border: "1px solid #f0f0f0" };
const LABEL_STYLE = { cursor: "pointer" };
const PERM_LABEL_STYLE = { textTransform: "capitalize", fontSize: "0.875rem" };
const ICON_WHITE_STYLE = { color: "#fff" };
const SIDEBAR_NAV_ORDER_STORAGE_KEY = "nipunah_sidebar_nav_order";
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
  "nav_services",
  "nav_jobs",
  "nav_pricing",
  "nav_enquiries",
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
  "services_view",
  "services_add",
  "services_edit",
  "services_delete",
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
  "pricing_view",
  "pricing_edit",
  "enquiries_view",
  "enquiries_delete",
  "enquiries_respond",
];

const KEY_GROUPS = [
  { label: "Navigation", keys: NAV_KEYS },
  { label: "Dashboard Widgets", keys: DASHBOARD_KEYS },
  { label: "Module Permissions", keys: MODULE_PERMISSION_KEYS },
];

const getHumanLabel = (key) => String(key || "").replace(/_/g, " ");
const MODULE_PERMISSION_CATEGORY_ORDER = [
  "dashboard",
  "users",
  "experts",
  "company",
  "services",
  "jobs",
  "equipments",
  "categories",
  "role_management",
  "pricing",
  "enquiries",
];

function getModulePermissionCategory(permissionKey) {
  const key = String(permissionKey || "");
  const knownPrefix = MODULE_PERMISSION_CATEGORY_ORDER.find((prefix) =>
    key.startsWith(`${prefix}_`)
  );
  if (knownPrefix) return knownPrefix;
  const firstPart = key.split("_")[0];
  return firstPart || "misc";
}

function sanitizeNavOrder(order) {
  if (!Array.isArray(order)) return NAV_KEYS;
  const valid = order.filter((key) => NAV_KEYS.includes(key));
  const missing = NAV_KEYS.filter((key) => !valid.includes(key));
  return [...valid, ...missing];
}

const SortableNavRow = memo(function SortableNavRow({
  permissionKey,
  index,
  enabled,
  onToggle,
  disabled,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: permissionKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="col-12 col-md-6">
      <div className="d-flex align-items-center justify-content-between py-2 px-2 border rounded bg-white h-100">
        <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
          <button
            type="button"
            className="C-settingButton is-clean small"
            {...attributes}
            {...listeners}
            disabled={disabled}
            aria-label={`Drag to reorder ${getHumanLabel(permissionKey)}`}
          >
            <Icon name="drag_indicator" size="small" />
          </button>
          <span
            className="text-muted"
            style={{ minWidth: 18, display: "inline-block", fontSize: "0.8rem" }}
          >
            {index + 1}.
          </span>
          <span style={PERM_LABEL_STYLE}>{getHumanLabel(permissionKey)}</span>
        </div>
        <Switch size="small" checked={enabled} onChange={onToggle} disabled={disabled} />
      </div>
    </div>
  );
});

const PermissionsPanel = memo(function PermissionsPanel({
  roleKey,
  data,
  onToggleKey,
  searchTerm,
  onToggleGroup,
  navOrder,
  onReorderNav,
  disabled,
}) {
  const renderLabel = useCallback(
    (key) => getHumanLabel(key),
    []
  );
  const normalizedSearch = String(searchTerm || "").trim().toLowerCase();

  const groupedModulePermissions = useMemo(() => {
    const allItems = KEY_GROUPS.find((group) => group.label === "Module Permissions");
    if (!allItems) return [];

    const filtered = allItems.keys.filter((key) =>
      normalizedSearch ? renderLabel(key).toLowerCase().includes(normalizedSearch) : true
    );

    const bucket = filtered.reduce((acc, key) => {
      const category = getModulePermissionCategory(key);
      if (!acc[category]) acc[category] = [];
      acc[category].push(key);
      return acc;
    }, {});

    return Object.keys(bucket)
      .sort((a, b) => {
        const ai = MODULE_PERMISSION_CATEGORY_ORDER.indexOf(a);
        const bi = MODULE_PERMISSION_CATEGORY_ORDER.indexOf(b);
        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      })
      .map((category) => ({
        category,
        keys: bucket[category],
      }));
  }, [normalizedSearch, renderLabel]);

  return (
    <div className="d-flex flex-column gap-3 pt-2">
      {KEY_GROUPS.map((group) => {
        const filteredKeys =
          group.label === "Module Permissions"
            ? groupedModulePermissions.flatMap((item) => item.keys)
            : group.keys.filter((key) =>
                normalizedSearch ? renderLabel(key).toLowerCase().includes(normalizedSearch) : true
              );
        if (filteredKeys.length === 0) return null;

        const enabledCount = filteredKeys.filter((key) => !!data[key]).length;
        const allEnabled = enabledCount === filteredKeys.length;

        return (
          <div key={group.label} className="rounded p-3" style={MODULE_BLOCK_STYLE}>
            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
              <span className="fw-semibold">
                {group.label} ({enabledCount}/{filteredKeys.length})
              </span>
              <Button
                size="small"
                onClick={() => onToggleGroup(roleKey, filteredKeys, !allEnabled)}
                disabled={disabled}
              >
                {allEnabled ? "Disable all" : "Enable all"}
              </Button>
            </div>
            {group.label === "Module Permissions" ? (
              <div className="d-flex flex-column gap-3">
                {groupedModulePermissions.map((categoryGroup) => {
                  const catEnabled = categoryGroup.keys.filter((key) => !!data[key]).length;
                  const categoryLabel = getHumanLabel(categoryGroup.category);
                  return (
                    <div key={categoryGroup.category} className="bg-white border rounded p-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="fw-semibold text-capitalize">
                          {categoryLabel} ({catEnabled}/{categoryGroup.keys.length})
                        </span>
                        <Button
                          size="small"
                          onClick={() =>
                            onToggleGroup(
                              roleKey,
                              categoryGroup.keys,
                              catEnabled !== categoryGroup.keys.length
                            )
                          }
                          disabled={disabled}
                        >
                          {catEnabled === categoryGroup.keys.length ? "Disable all" : "Enable all"}
                        </Button>
                      </div>
                      <div className="row g-2">
                        {categoryGroup.keys.map((key) => (
                          <div key={key} className="col-12 col-md-6">
                            <label
                              className="d-flex align-items-center justify-content-between py-2 px-2 border rounded h-100"
                              style={LABEL_STYLE}
                            >
                              <span style={PERM_LABEL_STYLE}>{renderLabel(key)}</span>
                              <Switch
                                size="small"
                                checked={!!data[key]}
                                onChange={() => onToggleKey(roleKey, key)}
                                disabled={disabled}
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <NavigationPermissionsGrid
                roleKey={roleKey}
                data={data}
                disabled={disabled}
                navOrder={navOrder}
                onToggleKey={onToggleKey}
                onReorderNav={onReorderNav}
                filteredKeys={filteredKeys}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});

const NavigationPermissionsGrid = memo(function NavigationPermissionsGrid({
  roleKey,
  data,
  disabled,
  navOrder,
  onToggleKey,
  onReorderNav,
  filteredKeys,
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const visibleOrder = navOrder.filter((key) => filteredKeys.includes(key));

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!active?.id || !over?.id || active.id === over.id) return;
      const oldIndex = visibleOrder.indexOf(active.id);
      const newIndex = visibleOrder.indexOf(over.id);
      if (oldIndex < 0 || newIndex < 0) return;
      const reorderedVisible = arrayMove(visibleOrder, oldIndex, newIndex);
      onReorderNav(reorderedVisible, filteredKeys);
    },
    [visibleOrder, onReorderNav, filteredKeys]
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={visibleOrder} strategy={verticalListSortingStrategy}>
        <div className="row g-2">
          {visibleOrder.map((key, index) => (
            <SortableNavRow
              key={key}
              permissionKey={key}
              index={index}
              enabled={!!data[key]}
              onToggle={() => onToggleKey(roleKey, key)}
              disabled={disabled}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
});

/**
 * Role Management – manage flat permissions for all roles.
 */
const RoleManagementPage = () => {
  const { allowed, permissions } = useModuleAccess("role_management");
  const [rolesData, setRolesData] = useState({});
  const [initialRolesData, setInitialRolesData] = useState({});
  const [navOrder, setNavOrder] = useState(NAV_KEYS);
  const [initialNavOrder, setInitialNavOrder] = useState(NAV_KEYS);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedRoleKey, setSelectedRoleKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const canEdit = Boolean(permissions.edit);

  const cloneRoles = useCallback((input) => JSON.parse(JSON.stringify(input || {})), []);

  const normalizeRolesPayload = useCallback(
    (payload) => normalizeRolesPermissions(payload || ROLE_MANAGEMENT_MOCK),
    []
  );

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchRolePermissions();
      const normalized = normalizeRolesPayload(payload || ROLE_MANAGEMENT_MOCK);
      const resolvedNavOrder = sanitizeNavOrder(NAV_KEYS);
      setRolesData(normalized);
      setInitialRolesData(cloneRoles(normalized));
      setNavOrder(resolvedNavOrder);
      setInitialNavOrder(resolvedNavOrder);
      setHasChanges(false);
      setSelectedRoleKey((prev) => prev || Object.keys(normalized)[0] || null);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          SIDEBAR_NAV_ORDER_STORAGE_KEY,
          JSON.stringify(resolvedNavOrder)
        );
      }
    } catch (err) {
      const fallback = cloneRoles(ROLE_MANAGEMENT_MOCK);
      setRolesData(fallback);
      setInitialRolesData(cloneRoles(fallback));
      setNavOrder(NAV_KEYS);
      setInitialNavOrder(NAV_KEYS);
      setHasChanges(false);
      setSelectedRoleKey((prev) => prev || Object.keys(fallback)[0] || null);
      message.error(err?.message || "Failed to load permissions");
    } finally {
      setLoading(false);
    }
  }, [cloneRoles, normalizeRolesPayload]);

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
    setHasChanges(true);
  }, []);

  const toggleGroup = useCallback((roleKey, keys, value) => {
    setRolesData((prev) => {
      const nextRole = { ...(prev?.[roleKey] || {}) };
      keys.forEach((key) => {
        nextRole[key] = Boolean(value);
      });
      return { ...prev, [roleKey]: nextRole };
    });
    setHasChanges(true);
  }, []);

  const reorderNavigation = useCallback((reorderedVisible, filteredKeys) => {
    setNavOrder((prev) => {
      const visibleSet = new Set(filteredKeys);
      const reorderedSet = new Set(reorderedVisible);
      const next = [];
      let reorderedIndex = 0;
      prev.forEach((key) => {
        if (visibleSet.has(key)) {
          const newKey = reorderedVisible[reorderedIndex];
          if (newKey) next.push(newKey);
          reorderedIndex += 1;
        } else {
          next.push(key);
        }
      });
      NAV_KEYS.forEach((key) => {
        if (!next.includes(key) && reorderedSet.has(key)) next.push(key);
      });
      setHasChanges(true);
      return sanitizeNavOrder(next);
    });
  }, []);

  const selectedRoleData = useMemo(() => rolesData?.[selectedRoleKey] || {}, [rolesData, selectedRoleKey]);
  const selectedRoleTotal = useMemo(() => Object.keys(selectedRoleData).length, [selectedRoleData]);
  const selectedRoleEnabled = useMemo(
    () => Object.values(selectedRoleData).filter(Boolean).length,
    [selectedRoleData]
  );

  const savePermissions = useCallback(async () => {
    if (!hasChanges) {
      message.info("No changes to save");
      return;
    }
    setSaving(true);
    try {
      const saved = normalizeRolesPayload(rolesData);
      // Next BFF fans out to PUT ${API}/roles/permissions/{admin|user|expert|company} per role (flat body each).
      const res = await fetch("/api/roles/permissions", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(saved),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          payload?.error || payload?.message || "Failed to save role permissions"
        );
      }
      const persistedFromResponses = normalizeRolesPayload(
        payload?.data && typeof payload.data === "object" ? payload.data : saved
      );
      clearRolePermissionsCache();
      const latestFromApi = await fetchRolePermissions({ forceRefresh: true }).catch(
        () => persistedFromResponses
      );
      const persisted = normalizeRolesPayload(latestFromApi);
      const persistedNavOrder = sanitizeNavOrder(navOrder);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          SIDEBAR_NAV_ORDER_STORAGE_KEY,
          JSON.stringify(persistedNavOrder)
        );
      }
      window.dispatchEvent(new CustomEvent("role-permissions-updated"));
      window.dispatchEvent(new CustomEvent("sidebar-nav-order-updated"));
      setRolesData(persisted);
      setInitialRolesData(cloneRoles(persisted));
      setNavOrder(persistedNavOrder);
      setInitialNavOrder(persistedNavOrder);
      setHasChanges(false);
      message.success("Role permissions saved successfully");
    } catch (err) {
      message.error(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [rolesData, navOrder, hasChanges, normalizeRolesPayload, cloneRoles]);

  const resetChanges = useCallback(() => {
    setRolesData(cloneRoles(initialRolesData));
    setNavOrder(initialNavOrder);
    setHasChanges(false);
    message.success("Changes discarded");
  }, [cloneRoles, initialRolesData, initialNavOrder]);

  const list = useMemo(
    () => {
      const source = Object.keys(rolesData).length ? rolesData : ROLE_MANAGEMENT_MOCK;
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
              searchTerm={searchTerm}
              onToggleGroup={toggleGroup}
              navOrder={navOrder}
              onReorderNav={reorderNavigation}
              disabled={!canEdit}
            />
          ),
        };
      }),
    [list, toggleKey, searchTerm, toggleGroup, navOrder, reorderNavigation, canEdit]
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

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Role Management"
        subtitle="Simple permission control for admin, user, expert, and company roles"
      >
        <div className="d-flex gap-2">
          {canEdit && (
            <>
              <Button onClick={resetChanges} disabled={!hasChanges || saving}>
                Reset
              </Button>
              <Button
                type="primary"
                icon={<Icon name="save" style={ICON_WHITE_STYLE} />}
                onClick={savePermissions}
                loading={saving}
                disabled={!hasChanges}
              >
                Save permissions
              </Button>
            </>
          )}
        </div>
      </AppPageHeader>
      <div className="p-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <Input
            allowClear
            placeholder="Search permission (e.g. users delete)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: 360 }}
          />
          <span className="text-muted">
            {selectedRoleKey ? `${ROLE_LABELS[selectedRoleKey] || selectedRoleKey}: ${selectedRoleEnabled}/${selectedRoleTotal} enabled` : ""}
          </span>
        </div>
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
