"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Divider, Empty, Space, Spin, Tabs, Tag } from "antd";
import { useParams } from "next/navigation";
import PageHeadingBanner from "@/components/StaticAtoms/PageHeadingBanner";
import PublicLayout from "@/layout/PublicLayout";
import Icon from "@/components/Icon";

function valueOrNA(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  return String(value);
}

function formatDate(value) {
  if (!value) return "N/A";
  const asNumber = Number(value);
  const date = Number.isNaN(asNumber)
    ? new Date(value)
    : new Date(String(Math.trunc(asNumber)).length === 10 ? asNumber * 1000 : asNumber);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizeExpert(raw) {
  if (!raw || typeof raw !== "object") return null;
  const address =
    raw.address && typeof raw.address === "object" && !Array.isArray(raw.address)
      ? raw.address
      : {};
  const socialMedia =
    raw.social_media && typeof raw.social_media === "object" && !Array.isArray(raw.social_media)
      ? raw.social_media
      : raw.socialMedia && typeof raw.socialMedia === "object" && !Array.isArray(raw.socialMedia)
      ? raw.socialMedia
      : {};

  return {
    ...raw,
    id: raw.id,
    firstName: raw.first_name ?? raw.firstName ?? "",
    lastName: raw.last_name ?? raw.lastName ?? "",
    email: raw.email ?? "",
    expertise: raw.expertise ?? "",
    contactCountryCode: raw.contact_country_code ?? raw.contactCountryCode ?? "",
    contactNumber: raw.contact_number ?? raw.contactNumber ?? "",
    isExpertApproved: Boolean(raw.is_expert_approved ?? raw.isExpertApproved),
    subscriptionPlan: raw.subscription_plan ?? raw.subscriptionPlan ?? "N/A",
    paymentDetails: raw.payment_details ?? raw.paymentDetails ?? {},
    createdOn: raw.created_on ?? raw.createdAt ?? raw.created_at,
    updatedOn: raw.updated_on ?? raw.updatedAt ?? raw.updated_at,
    address,
    socialMedia,
  };
}

const AboutExpert = ({ expert }) => {
  const expertName = `${expert?.firstName || ""} ${expert?.lastName || ""}`.trim() || "Expert";
  const aboutText =
    expert?.expertise && expert?.expertise !== "N/A"
      ? `${expertName} specializes in ${expert.expertise}.`
      : "No description available.";

  return (
    <>
      <h4 className="C-heading size-5 bold mb-3 font-family-creative">About Expert</h4>
      <span className="C-heading size-6 mb-4 font-family-creative">{aboutText}</span>

      <h4 className="C-heading size-5 bold mb-3 font-family-creative">Professional Details</h4>
      <div className="row g-3">
        <div className="col-md-6 col-sm-12">
          <div className="p-3 rounded-2 bg-white shadow-sm h-100">
            <span className="C-heading size-xs color-light mb-1">Expertise</span>
            <h5 className="C-heading size-6 semiBold mb-0">
              {valueOrNA(expert?.expertise)}
            </h5>
          </div>
        </div>
        <div className="col-md-6 col-sm-12">
          <div className="p-3 rounded-2 bg-white shadow-sm h-100">
            <span className="C-heading size-xs color-light mb-1">Subscription Plan</span>
            <h5 className="C-heading size-6 semiBold mb-0 text-capitalize">
              {valueOrNA(expert?.subscriptionPlan)}
            </h5>
          </div>
        </div>
      </div>
    </>
  );
};

const ExpertDetailsPage = () => {
  const params = useParams();
  const expertId = params?.expert_id;
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpertDetails = useCallback(async () => {
    if (!expertId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/experts/${expertId}`, {
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to load expert details");
      }

      const payload =
        data?.data?.expert ||
        data?.expert ||
        (data?.data && typeof data.data === "object" ? data.data : data);
      setExpert(normalizeExpert(payload));
    } catch (err) {
      setError(err?.message || "Failed to load expert details");
      setExpert(null);
    } finally {
      setLoading(false);
    }
  }, [expertId]);

  useEffect(() => {
    fetchExpertDetails();
  }, [fetchExpertDetails]);

  const expertName = useMemo(
    () => `${expert?.firstName || ""} ${expert?.lastName || ""}`.trim() || "Expert",
    [expert]
  );

  const expertLocation = useMemo(() => {
    const parts = [expert?.address?.city, expert?.address?.state, expert?.address?.country].filter(
      (part) => part && String(part).trim()
    );
    return parts.length ? parts.join(", ") : "N/A";
  }, [expert]);

  const expertContact = useMemo(() => {
    if (!expert?.contactNumber) return "N/A";
    if (expert?.contactCountryCode) {
      return `${expert.contactCountryCode} ${expert.contactNumber}`;
    }
    return expert.contactNumber;
  }, [expert]);

  const tabs = useMemo(
    () => [
      {
        key: "aboutExpert",
        label: "About Expert",
        children: <AboutExpert expert={expert} />,
      },
    ],
    [expert]
  );

  return (
    <PublicLayout>
      <PageHeadingBanner heading={expertName} currentPageTitle="List of experts" />
      <section className="section-padding small">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <Spin size="large" />
            </div>
          ) : error ? (
            <div className="py-5">
              <Empty description={error} />
            </div>
          ) : (
            <div className="row">
              <div className="col-12">
                <div className="d-flex gap-3 mb-4">
                  <div className="p-3 border rounded-3 mb-3">
                    <Icon name="account_circle" isFilled size="large" />
                  </div>
                  <div className="flex-grow-1">
                    <h3 className="C-heading size-4 color-dark mb-2 bold">{expertName}</h3>
                    <div className="d-flex justify-content-start gap-2 align-items-center flex-wrap">
                      <div>
                        <Space>
                          <Icon name="location_on" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light mb-0">
                            {expertLocation}
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
                            {valueOrNA(expert?.email)}
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
                          <Icon name="work" color="#b1b1b1" />
                          <span className="C-heading size-6 color-light mb-0">
                            {valueOrNA(expert?.expertise)}
                          </span>
                        </Space>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-8 col-sm-12">
                <Tabs type="card" items={tabs} className="C-tab" />
              </div>
              <div className="col-md-4 col-sm-12">
                <div className="bg-white shadow-sm rounded-2 p-4">
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">Approval Status:</span>
                    </div>
                    <div className="col text-right">
                      {expert?.isExpertApproved ? (
                        <Tag color="green">Approved</Tag>
                      ) : (
                        <Tag color="orange">Pending</Tag>
                      )}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">Subscription Plan:</span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-6 semiBold color-dark mb-0 text-right text-capitalize">
                        {valueOrNA(expert?.subscriptionPlan)}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">Contact Number:</span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-6 semiBold color-dark mb-0 text-right">
                        {expertContact}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">Business Location:</span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-6 semiBold color-dark mb-0 text-right">
                        {expertLocation}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">Address:</span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-6 semiBold color-dark mb-0 text-right">
                        {valueOrNA(expert?.address?.location)}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">Postal Code:</span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-6 semiBold color-dark mb-0 text-right">
                        {valueOrNA(expert?.address?.postal_code)}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">Member Since:</span>
                    </div>
                    <div className="col">
                      <span className="C-heading size-6 semiBold color-dark mb-0 text-right">
                        {formatDate(expert?.createdOn)}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">Payment Status:</span>
                    </div>
                    <div className="col text-right">
                      {expert?.paymentDetails?.is_paid_user ? (
                        <Tag color="green">Paid User</Tag>
                      ) : (
                        <Tag>Free User</Tag>
                      )}
                    </div>
                  </div>
                  <div className="row mb-0">
                    <div className="col">
                      <span className="C-heading size-6 color-light mb-0">Social Media:</span>
                    </div>
                    <div className="col text-right">
                      <Space size={0}>
                        {expert?.socialMedia?.facebook ? (
                          <a
                            href={expert.socialMedia.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="C-settingButton is-clean small"
                          >
                            <i className="bi bi-facebook color-light"></i>
                          </a>
                        ) : null}
                        {expert?.socialMedia?.linkedin ? (
                          <a
                            href={expert.socialMedia.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="C-settingButton is-clean small"
                          >
                            <i className="bi bi-linkedin color-light"></i>
                          </a>
                        ) : null}
                        {expert?.socialMedia?.instagram ? (
                          <a
                            href={expert.socialMedia.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="C-settingButton is-clean small"
                          >
                            <i className="bi bi-instagram color-light"></i>
                          </a>
                        ) : null}
                      </Space>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default ExpertDetailsPage;
