import React from "react";
import { Outlet } from "react-router-dom";
import DashboardLayout from "../common/Layout/DashboardLayout";
import AdminSideNavbar from "./AdminSideNavbar";
import { getMobileSidebarLinks } from "../../config/sidebarLinks";
        
const AdminLayout = ({ children }) => {
  const mobileLinks = getMobileSidebarLinks("admin");
  
  return (
    <DashboardLayout
      role="admin"
        sidebarComponent={AdminSideNavbar}
          mobileLinks={mobileLinks}
    >
          {children || <Outlet />}
            </DashboardLayout>
  );
};
                                        
export default AdminLayout;
