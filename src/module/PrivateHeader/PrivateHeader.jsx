import React from "react";
import "./PrivateHeader.scss";

const PrivateHeader = () => {
  return (
    <div className="privateHeader w-100">
      <div className="row">
        <div className="col-8">
          <h2 className="C-heading size-5 extraBold color-dark mb-1">
            Categories
          </h2>
          <h4 className="C-heading size-xs semiBold color-light mb-0">
            Manage categories and sub categories
          </h4>
        </div>
      </div>
    </div>
  );
};

export default PrivateHeader;
