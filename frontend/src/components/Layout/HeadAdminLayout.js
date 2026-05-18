import React from "react";
import { Outlet } from "react-router-dom";
import DashboardLayout from "../common/Layout/DashboardLayout";
import HeadAdminSideNavbar from "./HeadAdminSideNavbar";
import { getMobileSidebarLinks } from "../../config/sidebarLinks";
import { DashboardNotificationsUnreadProvider } from "../../context/DashboardNotificationsUnreadContext";

const HeadAdminLayout = ({ children }) => {
  const mobileLinks = getMobileSidebarLinks("head_admin");

  return (
    <DashboardNotificationsUnreadProvider role="head_admin">
      <DashboardLayout
        role="head_admin"
        sidebarComponent={HeadAdminSideNavbar}
        mobileLinks={mobileLinks}
      >
        {children || <Outlet />}
      </DashboardLayout>
    </DashboardNotificationsUnreadProvider>
  );
};

export default HeadAdminLayout;
