import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useDashboardNotificationsUnread } from "../../context/DashboardNotificationsUnreadContext";
import SidebarNavigation from "../common/Sidebar/SidebarNavigation";
import { getSidebarLinks } from "../../config/sidebarLinks";

const ResearchAdviserSideNavbar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { unreadCount, notificationsPath } = useDashboardNotificationsUnread();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="side-navbar">
      <SidebarNavigation
        links={getSidebarLinks("research_adviser")}
        badgeMap={{ [notificationsPath]: unreadCount }}
        logout={handleLogout}
      />
    </aside>
  );
};

export default ResearchAdviserSideNavbar;
