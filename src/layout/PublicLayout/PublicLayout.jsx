import React from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const PublicLayout = ({ children, hasBgImage }) => {
  return (
    <div className={`page-wrapper ${hasBgImage ? "customImage" : ""}`}>
      <Header />
      <main className="page-wrapper-body">{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
