import React from "react";
import { Outlet } from "react-router-dom";
import DashboardLayout from "../common/Layout/DashboardLayout";
import ResearchAdviserSideNavbar from "./ResearchAdviserSideNavbar";
import { getMobileSidebarLinks } from "../../config/sidebarLinks";

const ResearchAdviserLayout = ({ children }) => {
  const mobileLinks = getMobileSidebarLinks("research_adviser");

  return (
    <DashboardLayout
      role="research_adviser"
      sidebarComponent={ResearchAdviserSideNavbar}
      mobileLinks={mobileLinks}
    >
      {children || <Outlet />}
    </DashboardLayout>
  );
};

export default ResearchAdviserLayout;
