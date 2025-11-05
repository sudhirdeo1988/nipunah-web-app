import React from "react";
import Footer from "@/components/Footer";
import HeaderBeta from "@/components/HeaderBeta";

const PublicLayout = ({ children, hasBgImage }) => {
  return (
    <div className={`page-wrapper ${hasBgImage ? "customImage" : ""}`}>
      <HeaderBeta />
      <main className="page-wrapper-body">{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
