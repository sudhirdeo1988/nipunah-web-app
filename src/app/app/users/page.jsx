"use client";

import UserListing from "module/Users/Components/UserListing";
import React from "react";

const UserListingPage = () => {
  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <div className="p-3 border-bottom">
        <span className="C-heaidng size-5 color-light mb-2 extraBold">
          Users
        </span>
      </div>
      <div className="p-3">
        <UserListing />
      </div>
    </div>
  );
};

export default UserListingPage;
