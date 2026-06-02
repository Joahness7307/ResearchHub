import React from "react";
import { Outlet } from "react-router-dom";
import DashboardLayout from "../common/Layout/DashboardLayout";
import ResearchCoordinatorSideNavbar from "./ResearchCoordinatorSideNavbar";
import { getMobileSidebarLinks } from "../../config/sidebarLinks";
const ResearchCoordinatorLayout = ({ children }) => {
  const mobileLinks = getMobileSidebarLinks("research_coordinator");

  return (
    <DashboardLayout
      role="research_coordinator"
      sidebarComponent={ResearchCoordinatorSideNavbar}
      mobileLinks={mobileLinks}
    >
      {children || <Outlet />}
    </DashboardLayout>
  );
};

export default ResearchCoordinatorLayout;
