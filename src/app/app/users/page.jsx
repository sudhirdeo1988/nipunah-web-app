"use client";

import UserListing from "module/Users/Components/UserListing";
import React from "react";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";

const UserListingPage = () => {
  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Users"
        subtitle="Manage user accounts, roles and permissions"
      />
      <div className="p-3">
        <UserListing />
      </div>
    </div>
  );
};

export default UserListingPage;
