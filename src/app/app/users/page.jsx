"use client";

import UserListing from "module/Users/Components/UserListing";
import React from "react";
import AppPageHeader from "@/components/AppPageHeader/AppPageHeader";
import { useModuleAccess } from "@/hooks/useModuleAccess";

const UserListingPage = () => {
  const { allowed, permissions } = useModuleAccess("users");

  if (!allowed) return null;

  return (
    <div className="bg-white rounded shadow-sm" style={{ minHeight: "100%" }}>
      <AppPageHeader
        title="Users"
        subtitle="Manage user accounts, roles and permissions"
      />
      <div className="p-3">
        <UserListing permissions={permissions} />
      </div>
    </div>
  );
};

export default UserListingPage;
