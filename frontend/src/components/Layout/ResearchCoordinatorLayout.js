import React from "react";
import { Outlet } from "react-router-dom";
import DashboardLayout from "../common/Layout/DashboardLayout";
import ResearchCoordinatorSideNavbar from "./ResearchCoordinatorSideNavbar";
import { getMobileSidebarLinks } from "../../config/sidebarLinks";
import { DashboardNotificationsUnreadProvider } from "../../context/DashboardNotificationsUnreadContext";

const ResearchCoordinatorLayout = ({ children }) => {
  const mobileLinks = getMobileSidebarLinks("research_coordinator");

  return (
    <DashboardNotificationsUnreadProvider role="research_coordinator">
      <DashboardLayout
        role="research_coordinator"
        sidebarComponent={ResearchCoordinatorSideNavbar}
        mobileLinks={mobileLinks}
      >
        {children || <Outlet />}
      </DashboardLayout>
    </DashboardNotificationsUnreadProvider>
  );
};

export default ResearchCoordinatorLayout;
