import React from "react";

import "./PageHeadingBanner.scss";

const PageHeadingBanner = ({ heading }) => {
  return (
    <div className="breadcrumb-wrapper">
      <div className="container">
        <div className="page-heading">
          <h1 className="C-heading size-4 extraBold gradient-text">
            {heading}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default PageHeadingBanner;
