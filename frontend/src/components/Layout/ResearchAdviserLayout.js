import React from "react";
import { Outlet } from "react-router-dom";
import DashboardLayout from "../common/Layout/DashboardLayout";
import ResearchAdviserSideNavbar from "./ResearchAdviserSideNavbar";
import { getMobileSidebarLinks } from "../../config/sidebarLinks";
import { DashboardNotificationsUnreadProvider } from "../../context/DashboardNotificationsUnreadContext";

const ResearchAdviserLayout = ({ children }) => {
  const mobileLinks = getMobileSidebarLinks("research_adviser");

  return (
    <DashboardNotificationsUnreadProvider role="research_adviser">
      <DashboardLayout
        role="research_adviser"
        sidebarComponent={ResearchAdviserSideNavbar}
        mobileLinks={mobileLinks}
      >
        {children || <Outlet />}
      </DashboardLayout>
    </DashboardNotificationsUnreadProvider>
  );
};

export default ResearchAdviserLayout;
