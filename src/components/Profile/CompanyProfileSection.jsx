"use client";

import React, { memo, useMemo } from "react";
import { Card, Col, Divider, Row, Tag } from "antd";
import {
  companyProfileViewData,
  normalizeCompanyUser,
} from "@/utilities/companyProfileNormalize";
import "./ProfileDetails.scss";
import "./CompanyProfileSection.scss";

function ViewField({ label, value, children, fullWidth = false }) {
  return (
    <Col xs={24} md={fullWidth ? 24 : 12}>
      <p className="profileDetails__viewLabel mb-1">{label}</p>
      {children ?? <p className="profileDetails__viewValue mb-0">{value}</p>}
    </Col>
  );
}

function ExternalLink({ href, children }) {
  if (!href) return <span className="profileDetails__viewValue">—</span>;
  const url = href.startsWith("http") ? href : `https://${href}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="profileDetails__viewValue profileDetails__link mb-0"
    >
      {children || href}
    </a>
  );
}

/**
 * Read-only company profile with sections aligned to registration / edit form.
 */
const CompanyProfileSection = memo(function CompanyProfileSection({
  data = {},
  showApprovalStatus = false,
}) {
  const normalized = useMemo(() => normalizeCompanyUser(data), [data]);
  const view = useMemo(() => companyProfileViewData(normalized), [normalized]);
  const isApproved =
    normalized.isApproved === true || normalized.is_approved === true;

  return (
    <div className="profileDetails companyProfileSection">
      <div className="companyProfileSection__hero">
        {view.logoUrl ? (
          <img
            src={view.logoUrl}
            alt={`${view.name} logo`}
            className="companyProfileSection__logo"
          />
        ) : (
          <div className="companyProfileSection__logoPlaceholder">
            {view.name?.charAt(0)?.toUpperCase() || "C"}
          </div>
        )}
        <div>
          <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
            <h2 className="companyProfileSection__name mb-0">{view.name}</h2>
            {showApprovalStatus ? (
              <Tag color={isApproved ? "green" : "orange"} className="m-0">
                {isApproved ? "Approved" : "Pending Approval"}
              </Tag>
            ) : null}
          </div>
          {view.title !== "—" ? (
            <p className="companyProfileSection__subtitle mb-0">{view.title}</p>
          ) : null}
        </div>
      </div>

      <Card size="small" className="profileDetails__sectionCard">
        <h4 className="profileDetails__sectionTitle">Company Details</h4>
        <Divider className="profileDetails__sectionDivider" />
        <Row gutter={[16, 14]}>
          <ViewField label="Company Name" value={view.name} />
          <ViewField label="Company Title" value={view.title} />
          <ViewField label="Company Email" value={view.email} />
          <ViewField label="Username" value={view.username} />
          <ViewField label="Country Code" value={view.contactCountryCode} />
          <ViewField label="Contact Number" value={view.contactNumber} />
        </Row>
      </Card>

      <Card size="small" className="profileDetails__sectionCard">
        <h4 className="profileDetails__sectionTitle">Addresses</h4>
        <Divider className="profileDetails__sectionDivider" />
        {view.addresses.length ? (
          <div className="profileDetails__entryList">
            {view.addresses.map((addr, idx) => (
              <div key={`${addr.title}-${idx}`}>
                <div className="profileDetails__entryItem">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="companyProfileSection__entryTitle">
                      {addr.title}
                    </span>
                    {addr.isPrimary ? (
                      <Tag color="blue" className="m-0">
                        Primary
                      </Tag>
                    ) : null}
                  </div>
                  <Row gutter={[16, 10]}>
                    <ViewField label="Country" value={addr.country} />
                    <ViewField label="State / Province" value={addr.state} />
                    <ViewField
                      label="Detail Address"
                      value={addr.detailAddress}
                      fullWidth
                    />
                    <ViewField label="City" value={addr.city} />
                    <ViewField
                      label="Postal Code / Pincode"
                      value={addr.postalCode}
                    />
                  </Row>
                </div>
                {idx < view.addresses.length - 1 ? (
                  <Divider className="profileDetails__entrySeparator" />
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="profileDetails__viewValue mb-0">—</p>
        )}
      </Card>

      <Card size="small" className="profileDetails__sectionCard">
        <h4 className="profileDetails__sectionTitle">Categories</h4>
        <Divider className="profileDetails__sectionDivider" />
        {view.categories.length ? (
          <div className="profileDetails__entryList">
            {view.categories.map((cat, idx) => (
              <div key={`${cat.main}-${cat.sub}-${idx}`}>
                <div className="profileDetails__entryItem">
                  <Row gutter={[16, 10]}>
                    <ViewField label="Category" value={cat.main} />
                    <ViewField label="Sub category" value={cat.sub} />
                  </Row>
                </div>
                {idx < view.categories.length - 1 ? (
                  <Divider className="profileDetails__entrySeparator" />
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="profileDetails__viewValue mb-0">—</p>
        )}
      </Card>

      <Card size="small" className="profileDetails__sectionCard">
        <h4 className="profileDetails__sectionTitle">Statistics</h4>
        <Divider className="profileDetails__sectionDivider" />
        <Row gutter={[16, 14]}>
          <ViewField label="Found Year" value={view.foundYear} />
          <ViewField label="Website URL">
            <ExternalLink href={view.websiteUrl} />
          </ViewField>
          <ViewField
            label="About Company"
            value={view.aboutCompany}
            fullWidth
          />
          <ViewField label="Employee Count" value={view.employeesCount} />
          <ViewField label="Turnover" value={view.turnoverDisplay} />
          <ViewField
            label="Key Clients"
            value={view.keyClients}
            fullWidth
          />
          {view.logoUrl ? (
            <ViewField label="Company Logo" fullWidth>
              <img
                src={view.logoUrl}
                alt="Company logo"
                className="companyProfileSection__logoPreview"
              />
            </ViewField>
          ) : null}
        </Row>
      </Card>

      <Card size="small" className="profileDetails__sectionCard">
        <h4 className="profileDetails__sectionTitle">Social Media</h4>
        <Divider className="profileDetails__sectionDivider" />
        <Row gutter={[16, 14]}>
          <ViewField label="Facebook">
            <ExternalLink href={view.socialLinks.find((l) => l.label === "Facebook")?.url}>
              {view.socialLinks.find((l) => l.label === "Facebook")?.url || "—"}
            </ExternalLink>
          </ViewField>
          <ViewField label="Instagram">
            <ExternalLink href={view.socialLinks.find((l) => l.label === "Instagram")?.url}>
              {view.socialLinks.find((l) => l.label === "Instagram")?.url || "—"}
            </ExternalLink>
          </ViewField>
          <ViewField label="LinkedIn">
            <ExternalLink href={view.socialLinks.find((l) => l.label === "LinkedIn")?.url}>
              {view.socialLinks.find((l) => l.label === "LinkedIn")?.url || "—"}
            </ExternalLink>
          </ViewField>
        </Row>
      </Card>
    </div>
  );
});

export default CompanyProfileSection;
