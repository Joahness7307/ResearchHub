import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import SidebarNavigation from "../common/Sidebar/SidebarNavigation";
import { getSidebarLinks } from "../../config/sidebarLinks";

const AdminSideNavbar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="side-navbar">
      <SidebarNavigation links={getSidebarLinks("admin")} logout={handleLogout} />
    </aside>
  );
};

export default AdminSideNavbar;