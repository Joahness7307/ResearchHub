import React, { useRef, useEffect, useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";
import appLogo from '../../assets/appLogo.png';
import notifIcon from "../../assets/notification.png";
import axios from "../../api/axios";
import { io } from "socket.io-client";
import "./Navbar.css";

const Navbar = ({
  onHamburgerClick = () => {},
  isHamburgerOpen = false
}) => {
  const { user, logout } = useContext(AuthContext);
  const [studentNotifCount, setStudentNotifCount] = useState(0);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [studentNotifications, setStudentNotifications] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Unified state for hamburger
  const studentBellRef = useRef(null);
  const studentDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef(null);

  // Sidebar context hook for admin/adviser/head_admin roles.
  const roleName = user?.role;
  const { isOpen: adminIsOpen, toggle: adminToggle, setOpen: adminSetOpen } = useSidebar(roleName || "");

  // User role checks
  const isUnauthenticated = !user;
  const isStudentOrGuest = user && (user.role === "student" || user.role === "guest");
  const isAdminRole = user && (user.role === "admin" || user.role === "head_admin" || user.role === "research_adviser");

  // Notification fetch for student
  const fetchStudentNotifications = async () => {
    try {
      const res = await axios.get("/notifications/student/notifications");
      setStudentNotifications(res.data.notifications);
      setStudentNotifCount(
        res.data.notifications.filter(n => !n.isRead).length
      );
    } catch (err) {
      setStudentNotifications([]);
      setStudentNotifCount(0);
    }
  };

  useEffect(() => {
    if (user && user.role === "student") {
      fetchStudentNotifications();
      socketRef.current = io(process.env.REACT_APP_BACKEND_URL);
      socketRef.current.on(`student_notify_${user.id}`, () => {
        fetchStudentNotifications();
      });
      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [user]);

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
    setShowStudentDropdown(prev => !prev);
    if (!showStudentDropdown) {
      await fetchStudentNotifications();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Unified sidebar toggle used by Navbar:
  const toggleSidebar = (openState) => {
    // student/guest: control Navbar-local sidebar
    if (isStudentOrGuest) {
      setIsSidebarOpen(openState);
      return;
    }
    // admin/adviser/head_admin: use SidebarContext to toggle their layout sidebar
    if (isAdminRole && roleName) {
        adminToggle();
        return;
      }
    };


    // Determine which icon to show for admin role
  const adminHamburgerOpen = isAdminRole && adminIsOpen;

  // Hamburger sidebar links for student/guest
  const sidebarLinks = [
    ...(user && user.role === "student" && (user.year_level === "3rd" || user.year_level === "4th" || user.grade_level === "12")
      ? [{ label: "Upload Project", to: "/submit-research" }]
      : []),
    { label: "My Account", to: "/my-account" },
    { label: "Notifications", to: "/notifications" },
    { label: "Logout", action: handleLogout }
  ];

  let logoLink = "/";
  if (user) {
    if (user.role === "student") logoLink = "/projects";
    else if (user.role === "admin") logoLink = "/admin";
    else if (user.role === "head_admin") logoLink = "/head-admin";
    else if (user.role === "research_adviser") logoLink = "/adviser";
    else if (user.role === "guest") logoLink = "/guest";
  }

  // Unauthenticated navbar links
  const unauthLinks = [
    { label: "About Us", id: "about" },
    { label: "Features", id: "features" },
    // { label: "Contact Us", id: "contact" }
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
              src={appLogo || "/appLogo.png"}
              alt="Research Hub Logo"
              className="app-logo"
              onError={(e) => { e.target.onerror = null; e.target.src = "/logo192.png"; }}
            />
          </Link>
        ) : (
          <a href="#hero" onClick={e => handleNavClick(e, "hero")}>
            <img src={appLogo} alt="Research Hub Logo" className="app-logo" />
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
            {user.role === "student" && (user.year_level === "3rd" || user.year_level === "4th" || user.grade_level === "12") && (
              <Link to="/submit-research" className="nav-link nav-btn primary-btn">Upload Project</Link>
            )}
            <Link to="/my-account" className="nav-link">My Account</Link>
            <span style={{ position: "relative" }}>
              <img
                src={notifIcon}
                alt="Notifications"
                ref={studentBellRef}
                className="notification-icon"
                onClick={handleStudentBellClick}
              />
              {studentNotifCount > 0 && (
                <span className="notification-badge">{studentNotifCount}</span>
              )}
              {showStudentDropdown && (
                <div ref={studentDropdownRef} className="projects-dropdown">
                  <div className="projects-dropdown-list">
                    {studentNotifications.length === 0 ? (
                      <div className="projects-dropdown-empty">No notifications</div>
                    ) : (
                      studentNotifications.slice(0, 5).map(notif => (
                        <div
                          key={notif.id}
                          className={`projects-dropdown-item ${notif.isRead ? "read" : "unread"}`}
                          onClick={async () => {
                            setShowStudentDropdown(false);
                            await axios.patch(`/notifications/student/notifications/${notif.id}/read`);
                            setStudentNotifications(prev =>
                              prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
                            );
                            navigate(`/notifications/${notif.id}`);
                          }}
                        >
                          <div className="dropdown-item-reason">
                            {notif.reason}
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
            <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
          </div>

          {/* Mobile Hamburger (Auth Student) */}
          <div className="navbar-hamburger auth-hamburger" onClick={() => toggleSidebar(!isSidebarOpen)}>
            {isSidebarOpen ? <span className="hamburger-close">&#10005;</span> : <span className="hamburger-icon">&#9776;</span>}
          </div>
          <div className={`navbar-sidebar ${isSidebarOpen ? "open" : ""}`}>
            {sidebarLinks.map((link) =>
              link.action ? (
                <button key={link.label} className="sidebar-link" onClick={() => { link.action(); toggleSidebar(false); }}>
                  {link.label}
                </button>
              ) : (
                <Link key={link.label} to={link.to} className="sidebar-link" onClick={() => toggleSidebar(false)}>
                  {link.label}
                </Link>
              )
            )}
          </div>
          {isSidebarOpen && <div className="navbar-overlay" onClick={() => toggleSidebar(false)}></div>}
        </>
      )}

      {/* --- Admin / Adviser / Head Admin Navbar --- */}
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