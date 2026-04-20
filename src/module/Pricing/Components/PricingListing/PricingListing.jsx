"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Switch, Tag, message } from "antd";
import Icon from "@/components/Icon";
import { pricingService } from "@/utilities/apiServices";

const FALLBACK_PRICING = {
  currency: "USD",
  billing_cycle: "monthly",
  plans: [
    {
      id: "starter",
      name: "Starter Plan",
      price: 9.99,
      popular: true,
      badge: null,
      description: "Small companies",
      cta_text: "starter",
      features: [
        { key: "Full Company Profile", label: "Full Company Profile", included: true },
        {
          key: "Showcase up to 3 services/equipment with 1 image each",
          label: "Showcase up to 3 services/equipment with 1 image each",
          included: true,
        },
        { key: "Verified Badge", label: "Verified Badge", included: true },
        {
          key: "List in 1 category & 1 location/port",
          label: "List in 1 category & 1 location/port",
          included: true,
        },
        { key: "Social Media Sharing", label: "Social Media Sharing", included: true },
        { key: "Analytics Dashboard", label: "Analytics Dashboard", included: true },
      ],
      discount: 0,
      frequency: "MONTHLY",
    },
    {
      id: "growth",
      name: "Growth Plan",
      price: 24.99,
      popular: true,
      badge: "Most Popular",
      description: "Expanding companies",
      cta_text: "growth",
      features: [{ key: "Full Company Profile", label: "Full Company Profile", included: true }],
      discount: 0,
      frequency: "MONTHLY",
    },
    {
      id: "premium",
      name: "Premium Plan",
      price: 49.99,
      popular: true,
      badge: null,
      description: "Established brands",
      cta_text: "premium",
      features: [{ key: "Full Company Profile", label: "Full Company Profile", included: true }],
      discount: 0,
      frequency: "MONTHLY",
    },
  ],
};

function normalizePricingPayload(raw) {
  const data = raw?.data && typeof raw.data === "object" ? raw.data : raw;
  const plansRaw = Array.isArray(data?.plans) ? data.plans : [];
  return {
    currency: data?.currency || "USD",
    billing_cycle: data?.billing_cycle || "monthly",
    plans: plansRaw.map((plan) => ({
      id: String(plan?.id ?? ""),
      name: plan?.name || "",
      price: Number(plan?.price ?? 0),
      monthly_price: Number(
        plan?.monthly_price ??
          (String(plan?.frequency || "").toUpperCase() === "MONTHLY" ? plan?.price : 0) ??
          0
      ),
      yearly_price: Number(
        plan?.yearly_price ??
          (String(plan?.frequency || "").toUpperCase() === "YEARLY" ? plan?.price : 0) ??
          0
      ),
      popular: Boolean(plan?.popular),
      badge: plan?.badge || null,
      description: plan?.description || "",
      cta_text: plan?.ctaText ?? plan?.cta_text ?? "",
      discount: Number(plan?.discount ?? 0),
      frequency: plan?.frequency || "MONTHLY",
      features: Array.isArray(plan?.features)
        ? plan.features.map((feature, index) => ({
            key: feature?.key || `feature_${index + 1}`,
            label: feature?.label || feature?.key || "",
            included: Boolean(feature?.included),
          }))
        : [],
    })),
  };
}

function sanitizeFeatureKey(raw, index) {
  const s = String(raw ?? "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim();
  return s || `feature_${index + 1}`;
}

/** PATCH body for upstream: ctaText, single price matching frequency — no id / currency / billing_cycle */
function buildPricingUpdatePayload(values) {
  const freq = String(values?.frequency || "MONTHLY").toUpperCase();
  const monthly = Number(values?.monthly_price ?? 0);
  const yearly = Number(values?.yearly_price ?? 0);
  const price = freq === "YEARLY" ? yearly : monthly;
  const features = Array.isArray(values?.features)
    ? values.features.map((feature, index) => ({
        key: sanitizeFeatureKey(feature?.key, index),
        label: String(feature?.label ?? feature?.key ?? "").trim() || `Feature ${index + 1}`,
        included: Boolean(feature?.included),
      }))
    : [];

  return {
    name: String(values?.name ?? "").trim(),
    description: String(values?.description ?? "").trim(),
    price,
    popular: Boolean(values?.showPopularBadge),
    badge: values?.showPopularBadge ? "Most Popular" : "",
    ctaText: String(values?.cta_text ?? "").trim(),
    discount: Number(values?.discount ?? 0),
    frequency: freq,
    features,
  };
}

const PricingListing = ({ permissions = {} }) => {
  const canView = Boolean(permissions.view);
  const canEdit = Boolean(permissions.edit);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pricingData, setPricingData] = useState(FALLBACK_PRICING);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [form] = Form.useForm();

  const fetchPricing = useCallback(async () => {
    setLoading(true);
    try {
      const response = await pricingService.getPricing();
      const normalized = normalizePricingPayload(response);
      if (!Array.isArray(normalized.plans) || normalized.plans.length === 0) {
        setPricingData(FALLBACK_PRICING);
        return;
      }
      setPricingData(normalized);
    } catch (error) {
      setPricingData(FALLBACK_PRICING);
      message.warning(error?.message || "Could not load pricing from API. Showing fallback data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canView) return;
    fetchPricing();
  }, [canView, fetchPricing]);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedPlan(null);
    form.resetFields();
  }, [form]);

  const openEditModal = useCallback(
    (plan) => {
      setSelectedPlan(plan);
      form.setFieldsValue({
        name: plan?.name || "",
        description: plan?.description || "",
        monthly_price: Number(plan?.monthly_price ?? 0),
        yearly_price: Number(plan?.yearly_price ?? 0),
        discount: Number(plan?.discount ?? 0),
        frequency: plan?.frequency || "MONTHLY",
        cta_text: plan?.ctaText ?? plan?.cta_text ?? "",
        showPopularBadge: Boolean(plan?.badge || plan?.popular),
        features: Array.isArray(plan?.features)
          ? plan.features.map((f) => ({
              key: f?.key || "",
              label: f?.label || "",
              included: Boolean(f?.included),
            }))
          : [],
      });
      setIsEditModalOpen(true);
    },
    [form]
  );

  const handleSubmit = useCallback(
    async (values) => {
      if (!selectedPlan?.id) return;
      setSubmitting(true);
      try {
        const payload = buildPricingUpdatePayload(values);

        await pricingService.updatePricingPlan(selectedPlan.id, payload);
        message.success("Pricing plan updated successfully");
        closeEditModal();
        fetchPricing();
      } catch (error) {
        message.error(error?.message || "Failed to update pricing plan");
      } finally {
        setSubmitting(false);
      }
    },
    [closeEditModal, fetchPricing, selectedPlan]
  );

  const planCards = useMemo(() => pricingData?.plans || [], [pricingData?.plans]);

  if (!canView) return null;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Space wrap>
          <Tag color="blue">Currency: {pricingData?.currency || "USD"}</Tag>
          <Tag color="purple">Billing Cycle: {pricingData?.billing_cycle || "monthly"}</Tag>
        </Space>
        <Button className="C-button is-bordered small" onClick={fetchPricing} loading={loading}>
          Refresh
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {planCards.map((plan) => (
          <Col xs={24} md={12} xl={8} key={plan.id}>
            <Card
              title={
                <Space>
                  <span>{plan?.name || "Untitled Plan"}</span>
                  {plan?.popular ? <Tag color="gold">Popular</Tag> : null}
                  {plan?.badge ? <Tag color="green">{plan.badge}</Tag> : null}
                </Space>
              }
              extra={
                canEdit ? (
                  <Button
                    size="small"
                    className="C-button is-filled small"
                    onClick={() => openEditModal(plan)}
                  >
                    <Space size={4}>
                      <Icon name="edit" size="small" />
                      Edit
                    </Space>
                  </Button>
                ) : null
              }
              loading={loading}
            >
              <div className="mb-2">
                <div className="C-heading size-5 bold mb-1">
                  ${Number(plan?.monthly_price || 0).toFixed(2)} / MONTHLY
                </div>
                <div className="C-heading size-6 semiBold color-light">
                  ${Number(plan?.yearly_price || 0).toFixed(2)} / YEARLY
                </div>
              </div>
              <div className="mb-2">{plan?.description || "No description available."}</div>
              <div className="mb-3">
                <Tag>CTA: {plan?.cta_text || "N/A"}</Tag>
                <Tag>Discount: {Number(plan?.discount || 0)}%</Tag>
              </div>
              <div className="d-flex flex-column gap-1">
                {(plan?.features || []).map((feature, index) => (
                  <div key={`${plan.id}_${feature?.key || index}`} className="d-flex align-items-start gap-2">
                    <Icon
                      name={feature?.included ? "check_circle" : "cancel"}
                      size="small"
                      color={feature?.included ? "#16a34a" : "#dc2626"}
                    />
                    <span>{feature?.label || feature?.key || "Feature"}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={<span className="C-heading size-5 mb-0 bold">Edit Pricing Plan</span>}
        open={isEditModalOpen}
        onCancel={closeEditModal}
        footer={null}
        width={900}
        centered
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Plan Name"
                name="name"
                rules={[{ required: true, message: "Please enter plan name" }]}
              >
                <Input placeholder="Enter plan name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="CTA Text"
                name="cta_text"
                rules={[{ required: true, message: "Please enter CTA text" }]}
              >
                <Input placeholder="Enter CTA text" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item
                label="Monthly Price"
                name="monthly_price"
                rules={[{ required: true, message: "Please enter monthly price" }]}
              >
                <InputNumber min={0} precision={2} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Yearly Price"
                name="yearly_price"
                rules={[{ required: true, message: "Please enter yearly price" }]}
              >
                <InputNumber min={0} precision={2} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Discount (%)" name="discount">
                <InputNumber min={0} max={100} precision={2} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={24}>
              <Form.Item label="Frequency" name="frequency">
                <Select
                  placeholder="Select frequency"
                  options={[
                    { label: "Monthly", value: "MONTHLY" },
                    { label: "Yearly", value: "YEARLY" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Most Popular Badge" name="showPopularBadge" valuePropName="checked">
            <Switch checkedChildren="On" unCheckedChildren="Off" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.List name="features">
            {(fields, { add, remove }) => (
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="C-heading size-xs semiBold mb-0">Features</span>
                  <Button type="dashed" onClick={() => add({ key: "", label: "", included: true })}>
                    Add Feature
                  </Button>
                </div>
                <div className="d-flex flex-column gap-2">
                  {fields.map((field) => (
                    <Row gutter={8} key={field.key} align="middle">
                      <Col span={7}>
                        <Form.Item
                          {...field}
                          label={null}
                          name={[field.name, "key"]}
                          rules={[{ required: true, message: "Key is required" }]}
                          className="mb-0"
                        >
                          <Input placeholder="Feature key" />
                        </Form.Item>
                      </Col>
                      <Col span={11}>
                        <Form.Item
                          {...field}
                          label={null}
                          name={[field.name, "label"]}
                          rules={[{ required: true, message: "Label is required" }]}
                          className="mb-0"
                        >
                          <Input placeholder="Feature label" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...field}
                          label={null}
                          name={[field.name, "included"]}
                          valuePropName="checked"
                          className="mb-0"
                        >
                          <Switch checkedChildren="Yes" unCheckedChildren="No" />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button danger onClick={() => remove(field.name)}>
                          <Icon name="delete" size="small" />
                        </Button>
                      </Col>
                    </Row>
                  ))}
                </div>
              </div>
            )}
          </Form.List>

          <div className="d-flex justify-content-end gap-2">
            <Button className="C-button is-bordered small" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button
              htmlType="submit"
              className="C-button is-filled small"
              loading={submitting}
              disabled={!canEdit}
            >
              Update Plan
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default PricingListing;
