import React from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const PublicLayout = ({ children }) => {
  return (
    <div className="page-wrapper">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
