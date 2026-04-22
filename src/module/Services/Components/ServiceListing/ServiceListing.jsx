"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { serviceService } from "@/utilities/apiServices";
import { getIdFromStoredUser, loadUserSession } from "@/utilities/sessionUser";
import { Table, Modal, Dropdown, Space, Button, Form, Input, Select, message } from "antd";
import Icon from "@/components/Icon";

const ServiceListing = ({ permissions = {} }) => {
  const canView = Boolean(permissions.view);
  const canAdd = Boolean(permissions.add);
  const canEdit = Boolean(permissions.edit);
  const canDelete = Boolean(permissions.delete);

  const categories = useAppSelector((state) => state.categories?.list ?? []);
  const user = useAppSelector((state) => state.user?.user);
  const reduxRole = useAppSelector((state) => state.user?.role);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const lastFetchKeyRef = useRef(null);
  const isFetchingRef = useRef(false);

  const resolvedRole = useMemo(
    () => String(reduxRole || user?.role || user?.type || "").toLowerCase(),
    [reduxRole, user?.role, user?.type]
  );
  const resolvedCompanyId = useMemo(
    () => user?.company_id ?? user?.companyId ?? user?.id ?? null,
    [user?.company_id, user?.companyId, user?.id]
  );

  const categoryOptions = useMemo(() => {
    const opts = categories.map((cat) => ({
      value: String(cat.id ?? cat.categoryId ?? ""),
      label: cat.name || cat.title || cat.categoryName || String(cat.id ?? ""),
    }));
    return opts.filter((o) => o.value !== "");
  }, [categories]);

  const resolveCategoryLabel = useCallback(
    (categoryId) => {
      const id = String(categoryId ?? "");
      const found = categoryOptions.find((c) => c.value === id);
      return found?.label || "";
    },
    [categoryOptions]
  );

  const mapServiceFromApi = useCallback(
    (service, index = 0) => {
      const id =
        service?.id ??
        service?.service_id ??
        service?.serviceId ??
        `${service?.title || "service"}-${service?.category || index}`;
      const categoryId = String(
        service?.category ??
          service?.categoryId ??
          service?.category_id ??
          ""
      );
      return {
        ...service,
        id,
        categoryId,
        categoryName:
          service?.categoryName ||
          service?.category_name ||
          service?.category?.name ||
          resolveCategoryLabel(categoryId) ||
          categoryId ||
          "—",
        title: service?.title || service?.service_title || "—",
        description: service?.description || service?.service_description || "—",
      };
    },
    [resolveCategoryLabel]
  );

  const parseServicesResponse = useCallback((res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.items)) return res.items;
    if (Array.isArray(res?.services)) return res.services;
    return [];
  }, []);

  const loadServices = useCallback(async (force = false) => {
    if (isFetchingRef.current) return;
    const fetchKey = `${resolvedRole}:${resolvedCompanyId ?? ""}`;
    if (!force && lastFetchKeyRef.current === fetchKey) return;

    setLoading(true);
    isFetchingRef.current = true;
    try {
      const isCompanyRole = resolvedRole === "company";
      const isAdminRole = resolvedRole === "admin";
      const companyId = resolvedCompanyId;

      let res = null;
      if (isCompanyRole) {
        if (companyId == null || companyId === "") {
          setServices([]);
          return;
        }
        res = await serviceService.getServicesByCompany(companyId);
      } else if (isAdminRole) {
        // Admin-only endpoint
        res = await serviceService.getAllServices();
      } else {
        // Other roles should not call admin endpoint
        setServices([]);
        return;
      }
      const rawItems = parseServicesResponse(res);
      const rows = rawItems.map((item, index) => mapServiceFromApi(item, index));
      setServices(rows);
      lastFetchKeyRef.current = fetchKey;
    } catch (error) {
      message.error(error?.message || "Failed to load services");
      setServices([]);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [mapServiceFromApi, parseServicesResponse, resolvedRole, resolvedCompanyId]);

  React.useEffect(() => {
    loadServices();
  }, [loadServices]);

  const closeCreateEdit = useCallback(() => {
    setIsCreateEditModalOpen(false);
    setIsEditing(false);
    setSelectedService(null);
    form.resetFields();
  }, [form]);

  const openCreate = useCallback(() => {
    setIsEditing(false);
    setSelectedService(null);
    form.resetFields();
    setIsCreateEditModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (record) => {
      setIsEditing(true);
      setSelectedService(record);
      form.setFieldsValue({
        categoryId: String(record?.categoryId ?? ""),
        title: record?.title ?? "",
        description: record?.description ?? "",
      });
      setIsCreateEditModalOpen(true);
    },
    [form]
  );

  const openView = useCallback((record) => {
    setSelectedService(record);
    setIsViewModalOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedService(null);
  }, []);

  const handleDelete = useCallback((record) => {
    Modal.confirm({
      title: "Delete service?",
      content: `Are you sure you want to delete "${record?.title || "this service"}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await serviceService.deleteService(record.id);
          setServices((prev) => prev.filter((s) => s.id !== record.id));
          message.success("Service deleted successfully");
        } catch (error) {
          message.error(error?.message || "Failed to delete service");
          throw error;
        }
      },
    });
  }, []);

  const handleSubmit = useCallback(
    async (values) => {
      const sessionUser = loadUserSession();
      const companyIdForPayload =
        sessionUser?.company_id ??
        sessionUser?.companyId ??
        getIdFromStoredUser(sessionUser);
      if (!isEditing && (companyIdForPayload == null || companyIdForPayload === "")) {
        message.error("Could not resolve company id. Please login again.");
        return;
      }

      const payload = {
        category: Number(values.categoryId),
        title: values.title?.trim(),
        description: values.description?.trim(),
      };
      if (companyIdForPayload != null && companyIdForPayload !== "") {
        payload.companyId = Number(companyIdForPayload);
      }

      try {
        setSubmitting(true);
        if (isEditing) {
          const serviceId =
            selectedService?.id ??
            selectedService?.service_id ??
            selectedService?.serviceId;
          if (!serviceId) {
            message.error("Invalid service selected for update.");
            return;
          }
          await serviceService.updateService(serviceId, payload);
          message.success("Service updated successfully");
        } else {
          await serviceService.createService(payload);
          message.success("Service created successfully");
        }
        closeCreateEdit();
        await loadServices(true);
      } catch (error) {
        message.error(
          error?.message ||
            (isEditing ? "Failed to update service" : "Failed to create service")
        );
      } finally {
        setSubmitting(false);
      }
    },
    [closeCreateEdit, isEditing, loadServices, selectedService]
  );

  const actionMenuItems = useMemo(() => {
    const items = [];
    if (canView) {
      items.push({
        key: "view",
        label: (
          <Space align="center">
            <Icon name="visibility" size="small" />
            <span className="C-heading size-xs mb-0 semiBold">View</span>
          </Space>
        ),
      });
    }
    if (canEdit) {
      items.push({
        key: "edit",
        label: (
          <Space align="center">
            <Icon name="edit" size="small" />
            <span className="C-heading size-xs mb-0 semiBold">Edit</span>
          </Space>
        ),
      });
    }
    if (canDelete) {
      items.push({
        key: "delete",
        label: (
          <Space align="center">
            <Icon name="delete" size="small" />
            <span className="C-heading size-xs mb-0 semiBold">Delete</span>
          </Space>
        ),
      });
    }
    return items;
  }, [canDelete, canEdit, canView]);

  const handleActionMenu = useCallback(
    (menuInfo, record) => {
      if (menuInfo?.key === "view") return openView(record);
      if (menuInfo?.key === "edit") return openEdit(record);
      if (menuInfo?.key === "delete") return handleDelete(record);
    },
    [handleDelete, openEdit, openView]
  );

  const columns = useMemo(
    () => [
      {
        title: "Category",
        dataIndex: "categoryName",
        key: "categoryName",
        width: "20%",
      },
      {
        title: "Service Title",
        dataIndex: "title",
        key: "title",
        width: "30%",
      },
      {
        title: "Service Description",
        dataIndex: "description",
        key: "description",
        width: "40%",
        render: (v) => (
          <span title={v || ""} className="text-truncate d-block" style={{ maxWidth: 600 }}>
            {v || "—"}
          </span>
        ),
      },
      {
        title: "Action",
        key: "action",
        width: "10%",
        render: (_, record) => {
          if (actionMenuItems.length === 0) return null;
          return (
            <Dropdown
              menu={{
                items: actionMenuItems,
                onClick: (menuInfo) => handleActionMenu(menuInfo, record),
              }}
              trigger={["hover", "click"]}
            >
              <button className="C-settingButton is-clean small" type="button">
                <Icon name="more_vert" />
              </button>
            </Dropdown>
          );
        },
      },
    ],
    [actionMenuItems, handleActionMenu]
  );

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        {canAdd ? (
          <Button type="primary" className="C-button is-filled small" onClick={openCreate}>
            <Space>
              <Icon name="add" />
              Create Service
            </Space>
          </Button>
        ) : null}
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={services}
        loading={loading}
        pagination={false}
        scroll={{ x: 900 }}
      />

      <Modal
        title={
          <span className="C-heading size-5 mb-0 bold">
            {isEditing ? "Edit Service" : "Create Service"}
          </span>
        }
        open={isCreateEditModalOpen}
        onCancel={closeCreateEdit}
        footer={null}
        width={720}
        centered
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Select Category"
            name="categoryId"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select
              placeholder="Select category"
              options={categoryOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            label="Service Title"
            name="title"
            rules={[{ required: true, message: "Please enter service title" }]}
          >
            <Input placeholder="Enter service title" maxLength={120} />
          </Form.Item>

          <Form.Item
            label="Service Description"
            name="description"
            rules={[{ required: true, message: "Please enter service description" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter service description"
              maxLength={1000}
            />
          </Form.Item>

          <div className="d-flex justify-content-end gap-2">
            <Button className="C-button is-bordered small" onClick={closeCreateEdit}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="C-button is-filled small"
              loading={submitting}
              disabled={submitting}
            >
              {isEditing ? "Update Service" : "Create Service"}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={<span className="C-heading size-5 mb-0 bold">Service Details</span>}
        open={isViewModalOpen}
        onCancel={closeView}
        footer={null}
        width={720}
        centered
        destroyOnClose
      >
        <div className="d-flex flex-column gap-3">
          <div>
            <div className="C-heading size-xs semiBold mb-1">Category</div>
            <div>{selectedService?.categoryName || "—"}</div>
          </div>
          <div>
            <div className="C-heading size-xs semiBold mb-1">Service Title</div>
            <div>{selectedService?.title || "—"}</div>
          </div>
          <div>
            <div className="C-heading size-xs semiBold mb-1">Service Description</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{selectedService?.description || "—"}</div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ServiceListing;

