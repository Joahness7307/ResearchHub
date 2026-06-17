import React, { useRef, useEffect, useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";
import appLogo from '../../assets//images/app-logo.png';
import fallbackLogo from '../../assets/icons/fallback-logo-icon.png';
import notifIcon from "../../assets/icons/notification-bell-icon.png";
import { useNotifications } from "../../context/NotificationContext";
import { isEligibleResearchStudent } from "../../utils/studentEligibility";
import { formatNotificationSummary } from "../../utils/formatNotificationSummary";
import './Navbar.css';

const STUDENT_NOTIFICATIONS_PATH = "/notifications";

const Navbar = ({
  onHamburgerClick = () => {},
  isHamburgerOpen = false
}) => {
  // Normalize imported appLogo to an absolute path so it doesn't break on nested routes
  const logoSrc = (typeof appLogo === "string" && appLogo.startsWith("./"))
    ? appLogo.replace(/^\./, "") // "./static/..." => "/static/..."  
    : appLogo;
  const { user, logout } = useContext(AuthContext);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Unified state for hamburger
  const studentBellRef = useRef(null);
  const studentDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    notifications,
    unreadCount,
    refreshNotifications,
    markAsRead,
  } = useNotifications();

  // Sidebar context hook for admin/research_adviser/research_coordinator roles.
  const roleName = user?.role || "";
  const { isOpen: adminIsOpen, toggle: adminToggle } = useSidebar(roleName);

  // User role checks (always boolean)
  const isUnauthenticated = !user;
  const canUseStudentNotifications = isEligibleResearchStudent(user);
  const isStudentOrGuest = !!user && (user.role === "student" || user.role === "guest");
  const isAdminRole = !!user && (user.role === "admin" || user.role === "research_coordinator" || user.role === "research_adviser");

  useEffect(() => {
    if (!canUseStudentNotifications) {
      setShowStudentDropdown(false);
    }
  }, [canUseStudentNotifications, location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        !studentBellRef.current?.contains(event.target) &&
        !studentDropdownRef.current?.contains(event.target)
      ) {
        if (showStudentDropdown) setShowStudentDropdown(false);
      }
    }
    if (showStudentDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showStudentDropdown]);

  const handleStudentBellClick = async () => {
    if (!canUseStudentNotifications) return;
    setShowStudentDropdown(prev => !prev);
    if (!showStudentDropdown) {
      await refreshNotifications();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Unified sidebar toggle used by Navbar:
  const toggleSidebar = (openState) => {
    // console.log("Navbar.toggleSidebar", { roleName, isStudentOrGuest, isAdminRole, isUnauthenticated, openState, adminIsOpen });
    // Public (unauthenticated) pages: use Navbar's own sidebar
    if (isUnauthenticated) {
      setIsSidebarOpen(openState);
      return;
    }
    // Student/Guest authenticated: also use Navbar's own sidebar
    if (isStudentOrGuest) {
      setIsSidebarOpen(openState);
      return;
    }
    // Admin/Research Adviser/Research Coordinator: toggle layout sidebar via SidebarContext
    if (isAdminRole && roleName) {
      adminToggle();
      return;
    }
    // fallback: toggle local sidebar
    setIsSidebarOpen(openState);
  };


    // Determine which icon to show for admin role
  const adminHamburgerOpen = isAdminRole && adminIsOpen;

  // Hamburger sidebar links for student/guest
  const sidebarLinks = [
    ...(canUseStudentNotifications
      ? [{ label: "Upload Project", to: "/upload-project" }]
      : []),
    { label: "My Account", to: "/my-account" },
    ...(canUseStudentNotifications ? [{ label: "Notifications", to: "/notifications" }] : []),
    { label: "Logout", action: handleLogout }
  ];

  let logoLink = "/";
  if (user) {
    if (user.role === "student") logoLink = "/dashboard";
    else if (user.role === "admin") logoLink = "/admin";
    else if (user.role === "research_coordinator") logoLink = "/research-coordinator";
    else if (user.role === "research_adviser") logoLink = "/adviser";
    else if (user.role === "guest") logoLink = "/dashboard";
  }

  // Unauthenticated navbar links
  const unauthLinks = [
    { label: "About Us", id: "about" },
    { label: "Features", id: "features" },
    { label: "Our Team", id: "team" }
  ];

  const handleNavClick = (e, id) => {
    e.preventDefault();
    if (location.pathname === "/") {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: id } });
    }
    toggleSidebar(false); // Close sidebar on navigation
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {user ? (
          <Link to={logoLink}>
            <img
              src={logoSrc || fallbackLogo}
              alt="Research Hub Logo"
              className="app-logo"
              onError={(e) => { e.target.onerror = null; e.target.src = fallbackLogo; }}
            />
          </Link>
        ) : (
          <a href="#hero" onClick={e => handleNavClick(e, "hero")}>
            <img src={logoSrc || fallbackLogo} alt="Research Hub Logo" className="app-logo" onError={(e) => { e.target.onerror = null; e.target.src = fallbackLogo; }} />
          </a>
        )}
      </div>

      {/* --- Unauthenticated Navbar --- */}
      {isUnauthenticated && (
        <>
          {/* New container for unauthenticated links - placed on the right */}
          <div className="navbar-right-unauth"> 
             <div className="navbar-unauth-links desktop-nav">
                {unauthLinks.map(link => (
                  <a
                    key={link.label}
                    href={`#${link.id}`}
                    onClick={e => handleNavClick(e, link.id)}
                    className="nav-link unauth-link"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="navbar-right desktop-nav">
                {/* Added special class to Login for styling */}
                <Link to="/login" className="nav-link nav-btn login-btn">Login</Link> 
                <Link to="/role-selection" className="nav-link nav-btn">Signup</Link>
              </div>
          </div>


          {/* Mobile Hamburger (Unauth) */}
          <div className="navbar-hamburger" onClick={() => toggleSidebar(!isSidebarOpen)}>
            {isSidebarOpen ? (
              <span className="hamburger-close">&#10005;</span>
            ) : (
              <span className="hamburger-icon">&#9776;</span>
            )}
          </div>
          <div className={`navbar-sidebar ${isSidebarOpen ? "open" : ""}`}>
            <button
              className="sidebar-close-btn"
              onClick={() => toggleSidebar(false)}
              aria-label="Close sidebar"
            >
              &#10005;
            </button>
            {unauthLinks.map(link => (
              <a
                key={link.label}
                href={`#${link.id}`}
                onClick={e => handleNavClick(e, link.id)}
                className="sidebar-link"
              >
                {link.label}
              </a>
            ))}
            <Link to="/login" onClick={() => toggleSidebar(false)} className="sidebar-link">Login</Link>
            <Link to="/role-selection" onClick={() => toggleSidebar(false)} className="sidebar-link primary-btn">Signup</Link>
          </div>
          {isSidebarOpen && <div className="navbar-overlay" onClick={() => toggleSidebar(false)}></div>}
        </>
      )}

      {/* --- Authenticated Student/Guest Navbar --- */}
      {isStudentOrGuest && (
        <>
          <div className="navbar-right desktop-nav student-nav-links">
            {canUseStudentNotifications && (
              <Link to="/upload-project" className="nav-link nav-btn primary-btn">Upload Project</Link>
            )}
            <Link to="/my-account" className="nav-link">My Account</Link>
            {canUseStudentNotifications && (
              <span style={{ position: "relative" }}>
                <img
                  src={notifIcon}
                  alt="Notifications"
                  ref={studentBellRef}
                  className="notification-icon"
                  onClick={handleStudentBellClick}
                />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
                {showStudentDropdown && (
                  <div ref={studentDropdownRef} className="projects-dropdown">
                    <div className="projects-dropdown-list">
                      {notifications.length === 0 ? (
                        <div className="projects-dropdown-empty">No notifications</div>
                      ) : (
                        notifications.slice(0, 5).map(notif => (
                          <div
                            key={notif.id}
                            className={`projects-dropdown-item ${notif.isRead ? "read" : "unread"}`}
                            onClick={async () => {
                              setShowStudentDropdown(false);
                              await markAsRead(notif.id);
                              navigate(`/notifications/${notif.id}`);
                            }}
                          >
                            <div className="dropdown-item-message">
                              {formatNotificationSummary(notif.message)}.
                            </div>
                            <div className="projects-dropdown-date">
                              {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ""}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <button
                      className="dropdown-see-all-btn"
                      onClick={() => {
                        setShowStudentDropdown(false);
                        navigate("/notifications");
                      }}
                    >
                      See all notifications
                    </button>
                  </div>
                )}
              </span>
            )}
            <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
          </div>

          {/* Mobile Hamburger (Auth Student) */}
          <div className="navbar-hamburger auth-hamburger" onClick={() => toggleSidebar(!isSidebarOpen)}>
            {isSidebarOpen ? <span className="hamburger-close">&#10005;</span> : <span className="hamburger-icon">&#9776;</span>}
          </div>
          <div className={`navbar-sidebar ${isSidebarOpen ? "open" : ""}`}>
            <button
              className="sidebar-close-btn"
              onClick={() => toggleSidebar(false)}
              aria-label="Close sidebar"
            >
              &#10005;
            </button>
            {sidebarLinks.map((link) =>
              link.action ? (
                <button key={link.label} className="sidebar-link" type="button" onClick={() => { link.action(); toggleSidebar(false); }}>
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`sidebar-link${link.to === STUDENT_NOTIFICATIONS_PATH ? " sidebar-link-row" : ""}`}
                  onClick={() => toggleSidebar(false)}
                >
                  <span className="sidebar-link-text">{link.label}</span>
                  {canUseStudentNotifications &&
                    link.to === STUDENT_NOTIFICATIONS_PATH &&
                    unreadCount > 0 && (
                      <span
                        className="navbar-sidebar-unread-badge"
                        aria-label={`${unreadCount} unread`}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                </Link>
              )
            )}
          </div>
          {isSidebarOpen && <div className="navbar-overlay" onClick={() => toggleSidebar(false)}></div>}
        </>
      )}

      {/* --- Admin / Adviser / Research Coordinator Navbar --- */}
      {isAdminRole && (
        <div className="navbar-right">
          <Link to="/my-account" className="nav-link my-account-link">My Account</Link>

          {/* Hamburger controlled by external prop */}
          <div 
              className={`navbar-hamburger admin-hamburger ${adminHamburgerOpen ? "is-open" : ""}`} 
              onClick={() => toggleSidebar(!adminHamburgerOpen)}
          >
            {adminHamburgerOpen ? (
              <span className="hamburger-close">&#10005;</span> // <-- The Close Icon
            ) : (
              <span className="hamburger-icon">&#9776;</span> // <-- The Hamburger Icon
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
