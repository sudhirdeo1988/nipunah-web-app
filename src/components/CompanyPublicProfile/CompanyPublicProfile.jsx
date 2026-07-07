"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Card, Empty, Form, Input, Modal, Spin, Tabs, message } from "antd";
import Image from "next/image";
import Icon from "@/components/Icon";
import {
  PublicDetailsProfile,
  PublicDetailsSidebar,
  PublicDetailsInfoRow,
} from "@/components/PublicDetailsProfile";
import { useAppSelector } from "@/store/hooks";
import { enquiryService, equipmentService, serviceService } from "@/utilities/apiServices";
import { useAuth } from "@/utilities/AuthContext";
import { getIdFromStoredUser } from "@/utilities/sessionUser";

function valueOrDash(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function DetailRow({ label, value }) {
  return (
    <p className="publicDetailsProfile__aboutText mb-2">
      <strong>{label}:</strong> {valueOrDash(value)}
    </p>
  );
}

function CompanyJobsSection({ jobs = [] }) {
  if (!jobs.length) {
    return <Empty description="No jobs available." />;
  }

  return (
    <div className="publicDetailsProfile__cardGrid">
      {jobs.map((job, idx) => (
        <Card
          key={job?.id ?? job?.jobId ?? idx}
          bordered={false}
          className="shadow-sm h-100"
        >
          <h4 className="C-heading size-6 gradient-text semiBold mb-2 text-truncate">
            {job?.title || "Job"}
          </h4>
          <p className="publicDetailsProfile__aboutText mb-2">
            <Icon name="location_on" size="small" isFilled color="#bdbdbd" />{" "}
            {job?.location || "Location not available"}
          </p>
          <p className="publicDetailsProfile__aboutText mb-0">
            {job?.description || "No description available"}
          </p>
        </Card>
      ))}
    </div>
  );
}

function CompanyEquipmentsSection({ equipments = [], loading = false }) {
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spin />
      </div>
    );
  }

  if (!equipments.length) {
    return <Empty description="No equipment data available." />;
  }

  return (
    <div className="publicDetailsProfile__cardGrid">
      {equipments.map((eq, idx) => (
        <Card key={eq?.id ?? idx} bordered={false} className="shadow-sm h-100" cover={
          <Image
            src="/assets/images/about.jpg"
            alt={eq?.name || "Equipment"}
            width={320}
            height={180}
            style={{ width: "100%", height: 180, objectFit: "cover" }}
          />
        }>
          <h5 className="C-heading size-6 gradient-text semiBold mb-2 text-truncate">
            {eq?.name || eq?.title || "Equipment"}
          </h5>
          <p className="publicDetailsProfile__aboutText mb-1">
            Type: <strong>{eq?.type || "N/A"}</strong>
          </p>
          <p className="publicDetailsProfile__aboutText mb-0">
            Category: <strong>{eq?.category || "N/A"}</strong>
          </p>
        </Card>
      ))}
    </div>
  );
}

function CompanyServicesSection({ services = [], loading = false }) {
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spin />
      </div>
    );
  }

  if (!services.length) {
    return <Empty description="No services available." />;
  }

  return (
    <div className="publicDetailsProfile__cardGrid">
      {services.map((service, idx) => (
        <Card
          key={service?.id ?? service?.serviceId ?? idx}
          title={service?.title || service?.service_title || "Service"}
          bordered={false}
          className="shadow-sm h-100"
        >
          <p className="publicDetailsProfile__aboutText mb-0">
            {service?.description ||
              service?.service_description ||
              "No description available"}
          </p>
        </Card>
      ))}
    </div>
  );
}

function AboutCompanyTab({ company, isLoggedIn, companyIndustry, companySize, companyFounded, companyTurnover, companyLocation }) {
  const aboutText =
    company?.description || company?.about || company?.aboutCompany || "";

  return (
    <>
      <h4 className="C-heading size-5 bold mb-3 font-family-creative">
        About Company
      </h4>
      <span className="publicDetailsProfile__aboutText d-block mb-4">
        {aboutText || "No description available."}
      </span>

      {!isLoggedIn ? (
        <>
          <h4 className="C-heading size-5 bold mb-3 font-family-creative">
            Company Details
          </h4>
          <DetailRow label="Primary industry" value={companyIndustry} />
          <DetailRow label="Company size" value={companySize} />
          <DetailRow label="Founded in" value={companyFounded} />
          <DetailRow label="Turnover" value={companyTurnover} />
          <DetailRow label="Business location" value={companyLocation} />
        </>
      ) : null}
    </>
  );
}

export default function CompanyPublicProfile({
  company,
  companyId,
  backLink,
  embedded = false,
  showEnquiry = true,
  forceShowSidebar = false,
}) {
  const { isLoggedIn } = useAuth();
  const user = useAppSelector((state) => state.user.user);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryForm] = Form.useForm();
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [equipments, setEquipments] = useState([]);
  const [loadingEquipments, setLoadingEquipments] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState("aboutCompany");
  const [servicesLoaded, setServicesLoaded] = useState(false);
  const [equipmentsLoaded, setEquipmentsLoaded] = useState(false);

  const companyName = company?.name || company?.company_name || "Company";
  const companyLocation =
    company?.location ||
    company?.address?.city ||
    company?.address?.country ||
    company?.locations?.[0]?.city ||
    "";
  const companyIndustry =
    company?.industry || company?.category?.name || "";
  const companyEmail = company?.contact_email || company?.email || "";
  const companyPhone =
    company?.contact_number ||
    company?.contactNumber ||
    company?.phone_number ||
    company?.phoneNumber ||
    company?.phone ||
    "";
  const companySize = company?.employee_count || company?.employeeCount || "";
  const companyFounded = company?.founded_in || company?.foundYear || "";
  const companyTurnover = company?.turn_over || company?.turnover || "";
  const companyJobs = useMemo(
    () =>
      Array.isArray(company?.posted_jobs)
        ? company.posted_jobs
        : Array.isArray(company?.postedJobs)
        ? company.postedJobs
        : [],
    [company]
  );

  const socialMedia = useMemo(() => {
    const raw = company?.social_media ?? company?.socialMedia ?? {};
    if (typeof raw === "object" && !Array.isArray(raw)) return raw;
    return {};
  }, [company]);

  const isOwnCompany = useMemo(() => {
    if (!isLoggedIn) return false;
    const currentUserId = getIdFromStoredUser(user);
    if (currentUserId == null || currentUserId === "") return false;
    const normalizedUserId = String(currentUserId);
    const normalizedCompanyId = companyId != null ? String(companyId) : "";
    const normalizedCompanyOwnerId =
      company?.user_id != null
        ? String(company.user_id)
        : company?.userId != null
        ? String(company.userId)
        : "";
    const normalizedCompanyProfileId =
      company?.id != null ? String(company.id) : "";
    return (
      normalizedUserId === normalizedCompanyId ||
      normalizedUserId === normalizedCompanyOwnerId ||
      normalizedUserId === normalizedCompanyProfileId
    );
  }, [company, companyId, isLoggedIn, user]);

  const fetchCompanyServices = useCallback(async () => {
    if (!companyId) return;
    setLoadingServices(true);
    try {
      const res = await serviceService.getServicesByCompany(companyId);
      const items = Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.services)
        ? res.services
        : Array.isArray(res)
        ? res
        : [];
      setServices(items);
      setServicesLoaded(true);
    } catch {
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  }, [companyId]);

  const fetchCompanyEquipments = useCallback(async () => {
    if (!companyId) return;
    setLoadingEquipments(true);
    try {
      const res = await equipmentService.getEquipmentByCompany(companyId);
      const items = Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.equipments)
        ? res.equipments
        : Array.isArray(res)
        ? res
        : [];
      setEquipments(items);
      setEquipmentsLoaded(true);
    } catch {
      setEquipments([]);
    } finally {
      setLoadingEquipments(false);
    }
  }, [companyId]);

  useEffect(() => {
    setServices([]);
    setServicesLoaded(false);
    setEquipments([]);
    setEquipmentsLoaded(false);
    setActiveTabKey("aboutCompany");
  }, [companyId]);

  useEffect(() => {
    if (activeTabKey !== "companyServices") return;
    if (servicesLoaded) return;
    fetchCompanyServices();
  }, [activeTabKey, servicesLoaded, fetchCompanyServices]);

  useEffect(() => {
    if (activeTabKey !== "companyEquipments") return;
    if (equipmentsLoaded) return;
    fetchCompanyEquipments();
  }, [activeTabKey, equipmentsLoaded, fetchCompanyEquipments]);

  const metaItems = useMemo(() => {
    const items = [];
    if (companyLocation) {
      items.push({ icon: "location_on", label: "Location", text: companyLocation });
    }
    if (companyIndustry) {
      items.push({ icon: "settings", label: "Industry", text: companyIndustry });
    }
    return items;
  }, [companyIndustry, companyLocation]);

  const handleEnquirySubmit = async (values) => {
    const fromId = getIdFromStoredUser(user);
    if (fromId == null || fromId === "") {
      message.error("Could not resolve your user id. Please log in again.");
      return;
    }
    setEnquirySubmitting(true);
    try {
      await enquiryService.createEnquiry({
        enquiry_from: Number(fromId),
        enquiry_to: Number(companyId),
        enquiry_for: "company",
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

  const sidebar = forceShowSidebar || isLoggedIn ? (
    <PublicDetailsSidebar
      socialMedia={socialMedia}
      action={
        showEnquiry && !isOwnCompany ? (
          <button
            type="button"
            className="C-button is-filled full-width"
            onClick={() => setEnquiryOpen(true)}
          >
            Enquiry
          </button>
        ) : null
      }
    >
      <PublicDetailsInfoRow label="Primary industry">
        {valueOrDash(companyIndustry)}
      </PublicDetailsInfoRow>
      <PublicDetailsInfoRow label="Company size">
        {valueOrDash(companySize)}
      </PublicDetailsInfoRow>
      <PublicDetailsInfoRow label="Founded in">
        {valueOrDash(companyFounded)}
      </PublicDetailsInfoRow>
      <PublicDetailsInfoRow label="Turnover">
        {valueOrDash(companyTurnover)}
      </PublicDetailsInfoRow>
      <PublicDetailsInfoRow label="Business location">
        {valueOrDash(companyLocation)}
      </PublicDetailsInfoRow>
      <PublicDetailsInfoRow label="Email">
        {companyEmail ? (
          <a href={`mailto:${companyEmail}`} className="publicDetailsProfile__link">
            {companyEmail}
          </a>
        ) : null}
      </PublicDetailsInfoRow>
      <PublicDetailsInfoRow label="Phone">{companyPhone || null}</PublicDetailsInfoRow>
    </PublicDetailsSidebar>
  ) : null;

  const companyTabs = useMemo(() => {
    const tabs = [
      {
        key: "aboutCompany",
        label: "About Company",
        children: (
          <AboutCompanyTab
            company={company}
            isLoggedIn={isLoggedIn}
            companyIndustry={companyIndustry}
            companySize={companySize}
            companyFounded={companyFounded}
            companyTurnover={companyTurnover}
            companyLocation={companyLocation}
          />
        ),
      },
      {
        key: "companyServices",
        label: "Services",
        children: (
          <CompanyServicesSection services={services} loading={loadingServices} />
        ),
      },
    ];

    if (forceShowSidebar || isLoggedIn) {
      tabs.push(
        {
          key: "companyEquipments",
          label: "Equipments",
          children: (
            <CompanyEquipmentsSection
              equipments={equipments}
              loading={loadingEquipments}
            />
          ),
        },
        {
          key: "companyJobs",
          label: "Jobs",
          children: <CompanyJobsSection jobs={companyJobs} />,
        }
      );
    }

    return tabs;
  }, [
    company,
    companyFounded,
    companyIndustry,
    companyJobs,
    companyLocation,
    companySize,
    companyTurnover,
    equipments,
    forceShowSidebar,
    isLoggedIn,
    loadingEquipments,
    loadingServices,
    services,
  ]);

  return (
    <>
      <PublicDetailsProfile
        backLink={embedded ? null : backLink}
        imageUrl={company?.logo_url || company?.logoUrl || "/assets/images/logo.png"}
        imageAlt={companyName}
        placeholderIcon="business"
        imageVariant="square"
        name={companyName}
        subtitle={companyIndustry}
        metaItems={metaItems}
        sidebar={sidebar}
        showSidebar={forceShowSidebar || isLoggedIn}
        embedded={embedded}
      >
        <Tabs
          type="card"
          items={companyTabs}
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

CompanyPublicProfile.propTypes = {
  company: PropTypes.object,
  companyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  backLink: PropTypes.shape({
    label: PropTypes.string.isRequired,
    href: PropTypes.string,
    onClick: PropTypes.func,
  }),
  embedded: PropTypes.bool,
  showEnquiry: PropTypes.bool,
  forceShowSidebar: PropTypes.bool,
};
