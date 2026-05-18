import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../Layout/AdminSideNavbar.css";

const SidebarNavigation = ({ links, badgeMap = {}, logout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (to) => {
    navigate(to);
  };

  return (
    <>
      <div className="side-nav-links">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          const badgeCount = badgeMap[link.to] || 0;

          return (
            <button
              key={link.to}
              type="button"
              className={`side-nav-link${isActive ? " active" : ""}`}
              onClick={() => handleNav(link.to)}
            >
              <span className="side-nav-link-text">{link.label}</span>
              {badgeCount > 0 && (
                <span
                  className="side-nav-unread-badge"
                  aria-label={`${badgeCount} unread`}
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {logout && (
        <button className="side-nav-link logout-link" type="button" onClick={logout}>
          Logout
        </button>
      )}
    </>
  );
};

export default SidebarNavigation;