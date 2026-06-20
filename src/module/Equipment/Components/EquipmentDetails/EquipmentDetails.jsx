"use client";

import React, { memo } from "react";
import PropTypes from "prop-types";
import { Card, Col, Divider, Row, Typography } from "antd";
import "@/components/Profile/ProfileDetails.scss";
import "./EquipmentDetails.scss";
import { ImageGalleryView } from "@/components/ImageGallery";

const { Text } = Typography;

function valueOrDash(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function ViewField({ label, value, md = 12 }) {
  return (
    <Col xs={24} md={md}>
      <Text className="profileDetails__viewLabel">{label}</Text>
      <pre className="profileDetails__viewValue">{valueOrDash(value)}</pre>
    </Col>
  );
}

ViewField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  md: PropTypes.number,
};

function ViewSection({ title, children }) {
  return (
    <Card size="small" className="profileDetails__sectionCard">
      <h4 className="profileDetails__sectionTitle">{title}</h4>
      <Divider className="profileDetails__sectionDivider" />
      <Row gutter={[16, 8]}>{children}</Row>
    </Card>
  );
}

ViewSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const EquipmentDetails = memo(function EquipmentDetails({ equipment }) {
  if (!equipment) return null;

  const contactNumber =
    equipment.contact_country_code && equipment.contactNumber
      ? `${equipment.contact_country_code} ${equipment.contactNumber}`
      : equipment.contactNumber;

  return (
    <div className="profileDetails equipmentDetailsView">
      <div className="profileDetails__pageCard">
        <ViewSection title="Basic Information">
          <ViewField label="Equipment Name" value={equipment.name} />
          <ViewField label="Category" value={equipment.category} />
          <ViewField label="Type" value={equipment.type} />
          <ViewField label="Manufacture Year" value={equipment.manufactureYear} />
          <ViewField
            label="Manufacture Company"
            value={equipment.manufactureCompany}
          />
          <ViewField label="Available For" value={equipment.availableFor} />
          {equipment.rentType ? (
            <ViewField label="Rent Type" value={equipment.rentType} />
          ) : null}
        </ViewSection>

        <ViewSection title="About">
          <ViewField label="Description" value={equipment.about} md={24} />
        </ViewSection>

        <ViewSection title="Equipment Address">
          <ViewField label="Country" value={equipment.address?.country} />
          <ViewField label="State/Province" value={equipment.address?.state} />
          <ViewField label="City" value={equipment.address?.city} />
          <ViewField label="Postal Code" value={equipment.address?.postal_code} />
          <ViewField
            label="Detail Address"
            value={equipment.address?.location}
            md={24}
          />
        </ViewSection>

        <ViewSection title="Contact Information">
          <ViewField label="Contact Email" value={equipment.contactEmail} />
          <ViewField label="Contact Number" value={contactNumber} />
        </ViewSection>

        <ViewSection title="Additional Information">
          <ViewField label="Created On" value={equipment.createDate} />
        </ViewSection>

        <Card size="small" className="profileDetails__sectionCard">
          <ImageGalleryView
            persistKey={
              equipment.id != null && equipment.id !== ""
                ? `equipment-${equipment.id}`
                : undefined
            }
            title="Images"
          />
        </Card>
      </div>
    </div>
  );
});

EquipmentDetails.propTypes = {
  equipment: PropTypes.object,
};

export default EquipmentDetails;
