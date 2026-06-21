"use client";

import React from "react";
import PropTypes from "prop-types";
import { Empty } from "antd";

export default function PublicDetailsContentSection({
  title,
  children,
  empty = false,
  emptyDescription = "No information available.",
}) {
  return (
    <section className="publicDetailsProfile__contentSection">
      <h2 className="publicDetailsProfile__contentTitle">{title}</h2>
      {empty ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={emptyDescription}
        />
      ) : (
        children
      )}
    </section>
  );
}

PublicDetailsContentSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  empty: PropTypes.bool,
  emptyDescription: PropTypes.string,
};
