import React from "react";
import Navbar from "./Navbar";

const PublicLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 100 /* adjust if navbar height differs */ }}>{children}</main>
    </>
  );
};

export default PublicLayout;