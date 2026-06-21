"use client";

import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Empty, Form, Input, Modal, Tabs, message } from "antd";
import {
  PublicDetailsProfile,
  PublicDetailsSidebar,
  PublicDetailsInfoRow,
} from "@/components/PublicDetailsProfile";
import { ImageGalleryView, loadGalleryImages } from "@/components/ImageGallery";
import {
  formatEquipmentStatus,
  getEquipmentMakeModel,
} from "@/module/Equipment/utilities/equipmentMapper";
import { useAppSelector } from "@/store/hooks";
import { enquiryService } from "@/utilities/apiServices";
import { useAuth } from "@/utilities/AuthContext";
import { getIdFromStoredUser } from "@/utilities/sessionUser";

function valueOrDash(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (trimmed.includes("youtube.com/embed/")) return trimmed;
  const watchMatch = trimmed.match(/[?&]v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = trimmed.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([^?&]+)/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  return null;
}

function DetailRow({ label, value }) {
  return (
    <p className="publicDetailsProfile__aboutText mb-2">
      <strong>{label}:</strong> {valueOrDash(value)}
    </p>
  );
}

function EquipmentAboutTab({
  equipment,
  isLoggedIn,
  makeModel,
  statusLabel,
  locationLabel,
}) {
  const aboutText = equipment?.about || "";

  return (
    <>
      <h4 className="C-heading size-5 bold mb-3 font-family-creative">
        Technical description
      </h4>
      <span className="publicDetailsProfile__aboutText d-block mb-4">
        {aboutText || "No technical description available."}
      </span>

      {!isLoggedIn ? (
        <>
          <h4 className="C-heading size-5 bold mb-3 font-family-creative">
            Equipment details
          </h4>
          <DetailRow label="Category" value={equipment?.category} />
          <DetailRow label="Equipment type" value={equipment?.type} />
          <DetailRow label="Make & model" value={makeModel} />
          <DetailRow label="Year of build" value={equipment?.manufactureYear} />
          <DetailRow label="Status" value={statusLabel} />
          <DetailRow label="Rent type" value={equipment?.rentType} />
          <DetailRow label="Location" value={locationLabel} />
          <DetailRow label="Detail address" value={equipment?.address?.location} />
        </>
      ) : null}
    </>
  );
}

function EquipmentImagesTab({ equipmentId }) {
  if (!equipmentId) {
    return <Empty description="No photos available." />;
  }

  return (
    <ImageGalleryView
      persistKey={`equipment-${equipmentId}`}
      title="Equipment Images"
      emptyText="No photos uploaded yet."
    />
  );
}

function EquipmentDocumentsTab({ equipment }) {
  const embedUrl = getYoutubeEmbedUrl(equipment?.videoUrl);
  const hasSpecsPdf = Boolean(equipment?.specsPdf);
  const hasVideo = Boolean(embedUrl);

  if (!hasSpecsPdf && !hasVideo) {
    return <Empty description="No documents available." />;
  }

  return (
    <>
      <h4 className="C-heading size-5 bold mb-3 font-family-creative">
        Specs PDF
      </h4>
      {hasSpecsPdf ? (
        <a
          href={equipment.specsPdf}
          target="_blank"
          rel="noopener noreferrer"
          className="publicDetailsProfile__link d-block mb-4"
        >
          View specification PDF
        </a>
      ) : (
        <span className="publicDetailsProfile__aboutText d-block mb-4">
          No specification PDF uploaded yet.
        </span>
      )}

      <h4 className="C-heading size-5 bold mb-3 font-family-creative">Video</h4>
      {hasVideo ? (
        <div className="ratio ratio-16x9 rounded-3 overflow-hidden">
          <iframe
            src={embedUrl}
            title="Equipment video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <span className="publicDetailsProfile__aboutText d-block">
          No video available yet.
        </span>
      )}
    </>
  );
}

export default function EquipmentPublicProfile({ equipment, backLink }) {
  const { isLoggedIn } = useAuth();
  const user = useAppSelector((state) => state.user.user);
  const [coverImageUrl, setCoverImageUrl] = useState(null);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryForm] = Form.useForm();
  const [activeTabKey, setActiveTabKey] = useState("about");

  useEffect(() => {
    if (!equipment?.id) {
      setCoverImageUrl(null);
      return;
    }
    const images = loadGalleryImages(`equipment-${equipment.id}`);
    const first = (images || []).find((item) => item?.url && item?.status !== "error");
    setCoverImageUrl(first?.url || null);
  }, [equipment?.id]);

  const contactNumber = useMemo(() => {
    if (!equipment) return "";
    if (equipment.contact_country_code && equipment.contactNumber) {
      return `${equipment.contact_country_code} ${equipment.contactNumber}`;
    }
    return equipment.contactNumber || "";
  }, [equipment]);

  const locationLabel = useMemo(() => {
    const parts = [
      equipment?.address?.city,
      equipment?.address?.state,
      equipment?.address?.country,
    ].filter(Boolean);
    return parts.length ? parts.join(", ") : "";
  }, [equipment]);

  const makeModel = useMemo(() => getEquipmentMakeModel(equipment), [equipment]);
  const statusLabel = useMemo(
    () => formatEquipmentStatus(equipment?.availableFor) || "",
    [equipment?.availableFor]
  );

  const metaItems = useMemo(() => {
    const items = [];
    if (locationLabel) {
      items.push({ icon: "location_on", label: "Location", text: locationLabel });
    }
    if (statusLabel) {
      items.push({ icon: "sell", label: "Status", text: statusLabel });
    }
    if (makeModel) {
      items.push({
        icon: "precision_manufacturing",
        label: "Make & model",
        text: makeModel,
      });
    }
    if (equipment?.manufactureYear) {
      items.push({
        icon: "calendar_month",
        label: "Manufacturing year",
        text: String(equipment.manufactureYear),
      });
    }
    return items;
  }, [equipment?.manufactureYear, locationLabel, makeModel, statusLabel]);

  const equipmentTabs = useMemo(
    () => [
      {
        key: "about",
        label: "About",
        children: (
          <EquipmentAboutTab
            equipment={equipment}
            isLoggedIn={isLoggedIn}
            makeModel={makeModel}
            statusLabel={statusLabel}
            locationLabel={locationLabel}
          />
        ),
      },
      {
        key: "images",
        label: "Images",
        children: <EquipmentImagesTab equipmentId={equipment?.id} />,
      },
      {
        key: "documents",
        label: "Documents",
        children: <EquipmentDocumentsTab equipment={equipment} />,
      },
    ],
    [equipment, isLoggedIn, locationLabel, makeModel, statusLabel]
  );

  const handleEnquirySubmit = async (values) => {
    const fromId = getIdFromStoredUser(user);
    if (fromId == null || fromId === "") {
      message.error("Could not resolve your user id. Please log in again.");
      return;
    }
    setEnquirySubmitting(true);
    try {
      const enquiryTo =
        equipment?.companyId ?? equipment?.company_id ?? equipment?.id;
      await enquiryService.createEnquiry({
        enquiry_from: Number(fromId),
        enquiry_to: Number(enquiryTo),
        enquiry_for: "equipment",
        title: values.title?.trim(),
        description: values.message?.trim(),
      });
      message.success("Enquiry sent successfully");
      setEnquiryOpen(false);
      enquiryForm.resetFields();
    } catch (err) {
      message.error(err?.message || "Failed to send enquiry");
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const sidebar = isLoggedIn ? (
    <PublicDetailsSidebar
      socialMedia={equipment?.socialMedia}
      action={
        <button
          type="button"
          className="C-button is-filled full-width"
          onClick={() => setEnquiryOpen(true)}
        >
          Enquiry
        </button>
      }
    >
      <PublicDetailsInfoRow label="Category">
        {valueOrDash(equipment?.category)}
      </PublicDetailsInfoRow>
      <PublicDetailsInfoRow label="Equipment type">
        {valueOrDash(equipment?.type)}
      </PublicDetailsInfoRow>
      <PublicDetailsInfoRow label="Rent type">
        {valueOrDash(equipment?.rentType)}
      </PublicDetailsInfoRow>
      <PublicDetailsInfoRow label="Email">
        {equipment?.contactEmail ? (
          <a
            href={`mailto:${equipment.contactEmail}`}
            className="publicDetailsProfile__link"
          >
            {equipment.contactEmail}
          </a>
        ) : null}
      </PublicDetailsInfoRow>
      <PublicDetailsInfoRow label="Phone">{contactNumber || null}</PublicDetailsInfoRow>
    </PublicDetailsSidebar>
  ) : null;

  return (
    <>
      <PublicDetailsProfile
        backLink={backLink}
        imageUrl={coverImageUrl || "/assets/images/equipment_2.jpg"}
        imageAlt={equipment?.name || "Equipment"}
        placeholderIcon="precision_manufacturing"
        imageVariant="square"
        name={equipment?.name || "Equipment"}
        subtitle={equipment?.type || equipment?.category || ""}
        metaItems={metaItems}
        sidebar={sidebar}
        showSidebar={isLoggedIn}
      >
        <Tabs
          type="card"
          items={equipmentTabs}
          className="C-tab"
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
        />
      </PublicDetailsProfile>

      <Modal
        title="Send enquiry"
        open={enquiryOpen}
        onCancel={() => {
          setEnquiryOpen(false);
          enquiryForm.resetFields();
        }}
        footer={null}
        destroyOnHidden
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
            <Input.TextArea rows={4} placeholder="Your message" maxLength={2000} />
          </Form.Item>
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="C-button is-bordered"
              onClick={() => {
                setEnquiryOpen(false);
                enquiryForm.resetFields();
              }}
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
    </>
  );
}

EquipmentPublicProfile.propTypes = {
  equipment: PropTypes.object,
  backLink: PropTypes.shape({
    label: PropTypes.string.isRequired,
    href: PropTypes.string,
    onClick: PropTypes.func,
  }),
};
