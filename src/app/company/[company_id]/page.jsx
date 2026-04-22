"use client";

import Icon from "@/components/Icon";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import { useAppSelector } from "@/store/hooks";
import { enquiryService, equipmentService, serviceService } from "@/utilities/apiServices";
import { useAuth } from "@/utilities/AuthContext";
import { getIdFromStoredUser } from "@/utilities/sessionUser";
import { Card, Divider, Form, Input, Modal, Space, Tabs, message, Spin, Empty } from "antd";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

const AboutCompany = ({ company }) => {
  const about = company?.description || company?.about || "No description available.";
  return (
    <>
      <h4 className="C-heading size-5 bold mb-3 font-family-creative">
        About Company
      </h4>
      <span className="C-heading size-6 mb-5 font-family-creative">{about}</span>

      <h4 className="C-heading size-5 bold mb-3  font-family-creative">
        Key Clients
      </h4>
      <div className="row">
        <div className="col-md-4 col-sm-6 col-xs-12 ">
          <div className="p-3 border rounded-3 mb-3 text-center">
            <Image
              src="/assets/images/logo.png"
              alt="My Logo"
              width={180}
              height={60}
              className="mx-auto d-block"
            />
          </div>
        </div>
        <div className="col-md-4 col-sm-6 col-xs-12">
          <div className="p-3 border rounded-3 mb-3">
            <Image
              src="/assets/images/logo.png"
              alt="My Logo"
              width={180}
              height={60}
              className="mx-auto d-block"
            />
          </div>
        </div>
        <div className="col-md-4 col-sm-6 col-xs-12">
          <div className="p-3 border rounded-3 mb-3">
            <Image
              src="/assets/images/logo.png"
              alt="My Logo"
              width={180}
              height={60}
              className="mx-auto d-block"
            />
          </div>
        </div>
        <div className="col-md-4 col-sm-6 col-xs-12">
          <div className="p-3 border rounded-3 mb-3">
            <Image
              src="/assets/images/logo.png"
              alt="My Logo"
              width={180}
              height={60}
              className="mx-auto d-block"
            />
          </div>
        </div>
      </div>
    </>
  );
};

const CompanyJobs = ({ jobs = [] }) => {
  if (!jobs.length) {
    return <Empty description="No jobs available." />;
  }

  return (
    <>
      <h4 className="C-heading size-6 bold mb-3 ">Current available jobs</h4>
      <div className="row g-3">
        {jobs.map((job, idx) => (
          <div className="col-md-6 col-xs-12" key={job?.id ?? job?.jobId ?? idx}>
          <div className="p-3 rounded-2 bg-white shadow-sm">
            <h4 className="C-heading size-6 gradient-text semiBold mb-1 text-truncate">
                {job?.title || "Job"}
            </h4>
            <span className="C-heading size-6 mb-2 ">
              <Icon
                name="location_on"
                className="me-1"
                size="small"
                isFilled
                color="#bdbdbd"
              />
                {job?.location || "Location not available"}
            </span>
            <span className="C-heading size-6 mb-2">
                {job?.description || "No description available"}
            </span>
            <div className="d-flex justify-content-start gap-2 align-items-center">
              <div>
                <Space size={4}>
                  <Icon name="payments" color="#b1b1b1" size="small" isFilled />
                    <span className="C-heading size-6 mb-0">
                      {job?.salaryRange?.min && job?.salaryRange?.max
                        ? `${job.salaryRange.min} - ${job.salaryRange.max}`
                        : job?.salary_range?.min && job?.salary_range?.max
                        ? `${job.salary_range.min} - ${job.salary_range.max}`
                        : "N/A"}
                    </span>
                </Space>
              </div>
              <Divider
                orientation="vertical"
                style={{
                  backgroundColor: "#b1b1b1",
                  width: "2px",
                  margin: "0 4px",
                }}
              />
              <div>
                <Space size={4}>
                  <Icon
                    name="account_circle"
                    color="#b1b1b1"
                    size="small"
                    isFilled
                  />
                    <span className="C-heading size-6 mb-0">
                      {job?.experience_required || job?.experience || "N/A"}
                    </span>
                </Space>
              </div>
            </div>
          </div>
          </div>
        ))}
      </div>
    </>
  );
};

const CompanyEquipments = ({ equipments = [], loading = false }) => {
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
    <>
      <h4 className="C-heading size-6 bold mb-3 ">Equipments by company</h4>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {equipments.map((eq, idx) => (
          <div className="col" key={eq?.id ?? idx}>
          <div className="card h-100">
            <Image
              src="/assets/images/about.jpg"
              alt="My Logo"
              width={180}
              height={160}
              style={{ width: "100%" }}
            />
            <div className="card-body p-3">
              <h5 className="C-heading size-6 gradient-text semiBold mb-2 text-truncate">
                  {eq?.name || eq?.title || "Equipment"}
              </h5>
              <span className="C-heading size-6 color-light mb-2">
                <Icon
                  name="view_in_ar"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                  Model: <strong>{eq?.model || eq?.id || "N/A"}</strong>
              </span>
              <span className="C-heading size-6 color-light mb-2">
                <Icon
                  name="settings"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                  Type: <strong>{eq?.type || "N/A"}</strong>
              </span>
              <span className="C-heading size-6 color-light mb-2">
                <Icon
                  name="category"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                  Category: <strong>{eq?.category || "N/A"}</strong>
              </span>
              <span className="C-heading size-6 color-light mb-0">
                <Icon
                  name="calendar_month"
                  className="me-2"
                  size="small"
                  isFilled
                  color="#bdbdbd"
                />
                  Year of build: <strong>{eq?.manufacture_year || "N/A"}</strong>
              </span>
            </div>
          </div>
          </div>
        ))}
      </div>
    </>
  );
};

const CompanyServices = ({ services = [], loading = false }) => {
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
    <>
      <h4 className="C-heading size-6 bold mb-3 ">Services</h4>
      <div className="row g-3">
        {services.map((service, idx) => (
          <div className="col-md-6 col-xs-12" key={service?.id ?? service?.serviceId ?? idx}>
            <Card
              title={service?.title || service?.service_title || "Service"}
              variant="borderless"
              className="h-100 shadow-sm"
            >
              <p className="C-heading size-6 mb-0">
                {service?.description || service?.service_description || "No description available"}
              </p>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
};

const CompanyDetails = () => {
  const params = useParams();
  const companyId = params?.company_id;
  const { isLoggedIn } = useAuth();
  const user = useAppSelector((state) => state.user.user);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryForm] = Form.useForm();
  const [companyData, setCompanyData] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [companyError, setCompanyError] = useState(null);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [equipments, setEquipments] = useState([]);
  const [loadingEquipments, setLoadingEquipments] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState("aboutCompany");
  const [servicesLoaded, setServicesLoaded] = useState(false);
  const [equipmentsLoaded, setEquipmentsLoaded] = useState(false);

  const fetchCompanyDetails = useCallback(async () => {
    if (!companyId) return;
    setLoadingCompany(true);
    setCompanyError(null);
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Failed to load company details");
      }

      const payload =
        data?.data?.company ||
        data?.company ||
        (data?.data && typeof data.data === "object" ? data.data : data);

      setCompanyData(payload && typeof payload === "object" ? payload : null);
    } catch (err) {
      setCompanyError(err?.message || "Failed to load company details");
      setCompanyData(null);
    } finally {
      setLoadingCompany(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  useEffect(() => {
    setServices([]);
    setServicesLoaded(false);
    setEquipments([]);
    setEquipmentsLoaded(false);
    setActiveTabKey("aboutCompany");
  }, [companyId]);

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

  useEffect(() => {
    if (activeTabKey !== "companyServices") return;
    if (servicesLoaded) return;
    fetchCompanyServices();
  }, [activeTabKey, servicesLoaded, fetchCompanyServices]);

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
    if (activeTabKey !== "companyEquipments") return;
    if (equipmentsLoaded) return;
    fetchCompanyEquipments();
  }, [activeTabKey, equipmentsLoaded, fetchCompanyEquipments]);

  const companyName = companyData?.name || companyData?.company_name || "Company";
  const companyLocation =
    companyData?.location ||
    companyData?.address?.city ||
    companyData?.address?.country ||
    companyData?.locations?.[0]?.city ||
    "N/A";
  const companyIndustry =
    companyData?.industry || companyData?.category?.name || "N/A";
  const companyEmail =
    companyData?.contact_email || companyData?.email || "N/A";
  const companySize =
    companyData?.employee_count || companyData?.employeeCount || "N/A";
  const companyFounded =
    companyData?.founded_in || companyData?.foundYear || "N/A";
  const companyTurnover =
    companyData?.turn_over || companyData?.turnover || "N/A";
  const companyJobs = useMemo(
    () =>
      Array.isArray(companyData?.posted_jobs)
        ? companyData.posted_jobs
        : Array.isArray(companyData?.postedJobs)
        ? companyData.postedJobs
        : [],
    [companyData]
  );
  const companyTabs = useMemo(() => {
    const aboutTab = [
      {
        key: "aboutCompany",
        label: "About Company",
        children: <AboutCompany company={companyData} />,
      },
      {
        key: "companyServices",
        label: "Services",
        children: <CompanyServices services={services} loading={loadingServices} />,
      },
    ];

    if (!isLoggedIn) {
      return aboutTab;
    }

    return [
      ...aboutTab,
      {
        key: "companyEquipments",
        label: "Equipments",
        children: <CompanyEquipments equipments={equipments} loading={loadingEquipments} />,
      },
      {
        key: "companyJobs",
        label: "Jobs",
        children: <CompanyJobs jobs={companyJobs} />,
      },
    ];
  }, [companyData, companyJobs, equipments, isLoggedIn, loadingEquipments, loadingServices, services]);

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
      if (companyId == null || companyId === "") {
        message.error("Invalid company.");
        return;
      }
      setEnquirySubmitting(true);
      try {
        const enquiryFromNum = Number(fromId);
        const enquiryToNum = Number(companyId);
        if (Number.isNaN(enquiryFromNum) || Number.isNaN(enquiryToNum)) {
          message.error("Invalid enquiry details. Please try again.");
          return;
        }

        await enquiryService.createEnquiry({
          enquiry_from: enquiryFromNum,
          enquiry_to: enquiryToNum,
          enquiry_for: "company",
          title: values.title?.trim(),
          description: values.message?.trim(),
        });
        message.success("Enquiry sent successfully");
        closeEnquiryModal();
      } catch (err) {
        message.error(err?.message || "Failed to send enquiry");
      } finally {
        setEnquirySubmitting(false);
      }
    },
    [closeEnquiryModal, companyId, user]
  );

  return (
    <>
      <PublicLayout>
        <PageHeadingBanner heading={companyName} currentPageTitle="List of companies" />
        <section className="section-padding small">
          <div className="container">
            {loadingCompany ? (
              <div className="text-center py-5">
                <Spin size="large" />
              </div>
            ) : companyError ? (
              <div className="py-5">
                <Empty description={companyError} />
              </div>
            ) : (
            <div className="row">
              <div className="col-12">
                {/* Logo and company title */}
                <div className="d-flex gap-3 mb-4">
                  <div className="p-3 border rounded-3 mb-3">
                    <Image
                      src="/assets/images/logo.png"
                      alt="My Logo"
                      width={160}
                      height={50}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <h3 className="C-heading size-4 color-dark mb-2 bold">
                      {companyName}
                    </h3>
                    <div className="d-flex justify-content-start gap-2 align-items-center">
                      <div>
                        <Space>
                          <Icon name="location_on" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light mb-0">
                            {companyLocation}
                          </span>
                        </Space>
                      </div>
                      <Divider
                        type="vertical"
                        style={{
                          backgroundColor: "#b1b1b1",
                          width: "2px",
                          margin: "0 8px",
                        }}
                      />
                      <div>
                        <Space>
                          <Icon name="settings" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light mb-0">
                            {companyIndustry}
                          </span>
                        </Space>
                      </div>
                      <Divider
                        type="vertical"
                        style={{
                          backgroundColor: "#b1b1b1",
                          width: "2px",
                          margin: "0 8px",
                        }}
                      />
                      <div>
                        <Space>
                          <Icon name="mail" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light mb-0">
                            {companyEmail}
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
                  items={companyTabs}
                  className="C-tab"
                  activeKey={activeTabKey}
                  onChange={setActiveTabKey}
                />
              </div>
              <div className="col-md-4 col-sm-12">
                <div className="bg-white shadow-sm rounded-2 p-4">
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">
                        Primary industry:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-6 semiBold color-dark mb-0 text-right">
                        {companyIndustry}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">
                        Company size:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-6 semiBold color-dark mb-0 text-right">
                        {companySize}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">
                        Founded in:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-6 semiBold color-dark mb-0 text-right">
                        {companyFounded}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">
                        Turnover:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-6 semiBold color-dark mb-0 text-right">
                        {companyTurnover}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">
                        Business Location:
                      </span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-6 semiBold color-dark mb-0 text-right">
                        {companyLocation}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">
                        Social Media:
                      </span>
                    </div>
                    <div className="col text-right">
                      <Space size={0}>
                        <button className="C-settingButton is-clean small">
                          <i className="bi bi-facebook color-light"></i>
                        </button>
                        <button className="C-settingButton is-clean small">
                          <i className="bi bi-linkedin color-light"></i>
                        </button>
                        <button className="C-settingButton is-clean small">
                          <i className="bi bi-twitter color-light"></i>
                        </button>
                        <button className="C-settingButton is-clean small">
                          <i className="bi bi-instagram color-light"></i>
                        </button>
                      </Space>
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
              <Input.TextArea rows={4} placeholder="Your message" maxLength={2000} />
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

export default CompanyDetails;
