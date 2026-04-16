"use client";

import Icon from "@/components/Icon";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import { useAppSelector } from "@/store/hooks";
import { enquiryService } from "@/utilities/apiServices";
import { useAuth } from "@/utilities/AuthContext";
import { getIdFromStoredUser } from "@/utilities/sessionUser";
import {
  Divider,
  Form,
  Input,
  Modal,
  Space,
  Tabs,
  Image as ThumbnailImage,
  Spin,
  Empty,
  message,
} from "antd";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

const AboutCompany = ({ equipment }) => {
  return (
    <>
      <p className="C-heading size-6 mb-4 semiBold">
        {equipment?.about || equipment?.description || "No description available."}
      </p>
      <div className="C-bulletList mb-3">
        <ul>
          <li>
            <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
            <span className="C-heading semiBold size-6 mb-0 dont-break">
              <strong>Origin:</strong>{" "}
              {equipment?.address?.country || equipment?.country || "N/A"}
            </span>
          </li>
          <li>
            <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
            <span className="C-heading semiBold size-6 mb-0 dont-break">
              <strong>General Use:</strong> {equipment?.category || "N/A"}
            </span>
          </li>
          <li>
            <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
            <span className="C-heading semiBold size-6 mb-0 dont-break">
              <strong>Instructions for use:</strong> {equipment?.type || "N/A"}
            </span>
          </li>
          <li>
            <i className="bi bi-check-circle-fill color-primary bullet-icon"></i>
            <span className="C-heading semiBold size-6 mb-0 dont-break">
              <strong>Packing:</strong> {equipment?.rentType || "N/A"}
            </span>
          </li>
        </ul>
      </div>
    </>
  );
};

const EquipmentImages = ({ imageUrl }) => {
  const images = imageUrl ? [imageUrl, imageUrl, imageUrl, imageUrl, imageUrl, imageUrl] : [];
  if (!images.length) {
    return <Empty description="No images available." />;
  }
  return (
    <>
      <div className="row g-3">
        {images.map((src, idx) => (
          <div className="col-md-4 col-sm-6 col-xs-12" key={idx}>
            <ThumbnailImage src={src} className="img-fluid img-thumbnail" />
          </div>
        ))}
      </div>
    </>
  );
};

const EquipmentDetails = () => {
  const params = useParams();
  const equipmentId = params?.equipment_id;
  const { isLoggedIn } = useAuth();
  const user = useAppSelector((state) => state.user.user);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryForm] = Form.useForm();
  const [equipmentData, setEquipmentData] = useState(null);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [equipmentError, setEquipmentError] = useState(null);

  const fetchEquipmentDetails = useCallback(async () => {
    if (!equipmentId) return;
    setLoadingEquipment(true);
    setEquipmentError(null);
    try {
      const res = await fetch(`/api/equipments/${equipmentId}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Failed to load equipment details");
      }
      const payload =
        data?.data?.equipment ||
        data?.equipment ||
        (data?.data && typeof data.data === "object" ? data.data : data);
      setEquipmentData(payload && typeof payload === "object" ? payload : null);
    } catch (err) {
      setEquipmentError(err?.message || "Failed to load equipment details");
      setEquipmentData(null);
    } finally {
      setLoadingEquipment(false);
    }
  }, [equipmentId]);

  useEffect(() => {
    fetchEquipmentDetails();
  }, [fetchEquipmentDetails]);

  const equipmentName = equipmentData?.name || equipmentData?.title || "Equipment";
  const equipmentModel = equipmentData?.model || equipmentData?.id || "N/A";
  const equipmentCategory = equipmentData?.category || "N/A";
  const equipmentAvailableFor =
    equipmentData?.available_for || equipmentData?.availableFor || "N/A";
  const equipmentRent =
    equipmentData?.rent || equipmentData?.price || equipmentData?.rent_price || "N/A";
  const equipmentWeight = equipmentData?.weight || "N/A";
  const equipmentBuiltIn =
    equipmentData?.manufacture_year || equipmentData?.manufactureYear || "N/A";
  const equipmentDimensions = equipmentData?.dimensions || "N/A";
  const equipmentLocation =
    equipmentData?.address?.city ||
    equipmentData?.equipment_address?.city ||
    equipmentData?.location ||
    "N/A";
  const equipmentImage = equipmentData?.imageUrl || equipmentData?.image || "/assets/images/equipment_2.jpg";

  const openEnquiryModal = useCallback(() => {
    enquiryForm.resetFields();
    setEnquiryOpen(true);
  }, [enquiryForm]);

  const closeEnquiryModal = useCallback(() => {
    setEnquiryOpen(false);
    enquiryForm.resetFields();
  }, [enquiryForm]);

  const handleEnquirySubmit = useCallback(
    async (values) => {
      const fromId = getIdFromStoredUser(user);
      if (fromId == null || fromId === "") {
        message.error("Could not resolve your user id. Please log in again.");
        return;
      }
      if (equipmentId == null || equipmentId === "") {
        message.error("Invalid equipment.");
        return;
      }
      setEnquirySubmitting(true);
      try {
        await enquiryService.createEnquiry({
          from: fromId,
          title: values.title?.trim(),
          description: values.message?.trim(),
          type: "equipment",
          equipemnt_id: equipmentId,
        });
        message.success("Enquiry sent successfully");
        closeEnquiryModal();
      } catch (err) {
        message.error(err?.message || "Failed to send enquiry");
      } finally {
        setEnquirySubmitting(false);
      }
    },
    [closeEnquiryModal, equipmentId, user],
  );

  return (
    <>
      <PublicLayout>
        <PageHeadingBanner
          heading="Equipment Details"
          currentPageTitle="List of companies"
        />
        <section className="section-padding small">
          <div className="container">
            {loadingEquipment ? (
              <div className="text-center py-5">
                <Spin size="large" />
              </div>
            ) : equipmentError ? (
              <div className="py-5">
                <Empty description={equipmentError} />
              </div>
            ) : (
            <div className="row">
              <div className="col-12">
                {/* Logo and company title */}
                <div className="d-flex gap-2 mb-4">
                  <Image
                    src={equipmentImage}
                    alt="My Logo"
                    width={260}
                    height={130}
                    className="img-thumbnail img-fluid"
                  />
                  <div className="flex-grow-1">
                    <h3 className="C-heading size-4 color-dark mb-2 extraBold">
                      {equipmentName}
                    </h3>
                    <div className="d-flex justify-content-start gap-2 align-items-center mb-3">
                      <div>
                        <Space>
                          <Icon name="view_in_ar" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light semiBold mb-0">
                            {equipmentModel}
                          </span>
                        </Space>
                      </div>
                      <Divider
                        orientation="vertical"
                        style={{
                          backgroundColor: "#b1b1b1",
                          width: "2px",
                          margin: "0 8px",
                        }}
                      />
                      <div>
                        <Space>
                          <Icon name="settings" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light semiBold mb-0">
                            {equipmentCategory}
                          </span>
                        </Space>
                      </div>
                      <Divider
                        orientation="vertical"
                        style={{
                          backgroundColor: "#b1b1b1",
                          width: "2px",
                          margin: "0 8px",
                        }}
                      />

                      <div>
                        <Space>
                          <Icon name="sell" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light semiBold mb-0">
                            Available for{" "}
                            <strong className="color-primary">{equipmentAvailableFor}</strong>
                          </span>
                        </Space>
                      </div>
                    </div>
                    <div className="d-flex justify-content-start gap-2 align-items-center">
                      <div>
                        <Space align="middle">
                          <Icon name="payments" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light semiBold mb-0">
                            <Space align="middle">
                              Rent:
                              <strong className="color-primary fs-4">
                                {equipmentRent}
                              </strong>
                            </Space>
                          </span>
                        </Space>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-8 col-sm-12">
                <Tabs
                  type="card"
                  items={[
                    {
                      key: "aboutCompany",
                      label: "Description",
                      children: <AboutCompany equipment={equipmentData} />,
                    },
                    {
                      key: "EquipmentImages",
                      label: "Images",
                      children: <EquipmentImages imageUrl={equipmentImage} />,
                    },
                  ]}
                  className="C-tab"
                />
              </div>
              <div className="col-md-4 col-sm-12">
                <div className="background-highlight rounded-2 p-4">
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-xs semiBold color-light mb-0 color-dark">
                        Primary industry:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-xs bold color-dark mb-0 text-right">
                        {equipmentCategory}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-xs semiBold color-light mb-0 color-dark">
                        Weight:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-xs bold color-dark mb-0 text-right">
                        {equipmentWeight}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-xs semiBold color-light mb-0 color-dark">
                        Built in:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-xs bold color-dark mb-0 text-right">
                        {equipmentBuiltIn}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-xs semiBold color-light mb-0 color-dark">
                        Dimensions:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-xs bold color-dark mb-0 text-right">
                        {equipmentDimensions}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-xs semiBold color-light mb-0 color-dark">
                        Location:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-xs bold color-dark mb-0 text-right">
                        {equipmentLocation}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-xs semiBold color-light mb-0 color-dark">
                        Price:
                      </span>
                    </div>
                    <div className="col text-right">
                      <span className="C-heading size-xs bold color-dark mb-0 text-right">
                        {equipmentRent}
                      </span>
                    </div>
                  </div>
                  {isLoggedIn && (
                    <button
                      type="button"
                      className="C-button is-filled full-width"
                      onClick={openEnquiryModal}
                    >
                      Enquiry
                    </button>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
        </section>

        <Modal
          title="Send enquiry"
          open={enquiryOpen}
          onCancel={closeEnquiryModal}
          footer={null}
          destroyOnClose
          centered
        >
          <Form
            form={enquiryForm}
            layout="vertical"
            onFinish={handleEnquirySubmit}
            autoComplete="off"
          >
            <Form.Item
              label="Enquiry title"
              name="title"
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input placeholder="Title" maxLength={200} />
            </Form.Item>
            <Form.Item
              label="Message"
              name="message"
              rules={[{ required: true, message: "Please enter your message" }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Your message"
                maxLength={2000}
              />
            </Form.Item>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="C-button is-bordered"
                onClick={closeEnquiryModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="C-button is-filled"
                disabled={enquirySubmitting}
              >
                {enquirySubmitting ? "Sending…" : "Submit"}
              </button>
            </div>
          </Form>
        </Modal>
      </PublicLayout>
    </>
  );
};

export default EquipmentDetails;
