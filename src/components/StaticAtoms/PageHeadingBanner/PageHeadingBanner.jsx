import React from "react";

import "./PageHeadingBanner.scss";

const PageHeadingBanner = ({ heading }) => {
  return (
    <div className="breadcrumb-wrapper">
      <div className="container">
        <div className="page-heading">
          <h1 className="C-heading size-3 extraBold color-white font-family-creative">
            {heading}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default PageHeadingBanner;
