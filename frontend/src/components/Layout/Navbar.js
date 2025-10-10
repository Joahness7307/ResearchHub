import React, { useRef, useEffect, useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
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
  const [authHamburgerOpen, setAuthHamburgerOpen] = useState(false);
  const [unauthHamburgerOpen, setUnauthHamburgerOpen] = useState(false);
  const studentBellRef = useRef(null);
  const studentDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef(null);

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
    { label: "About", id: "about" },
    { label: "Features", id: "features" },
    { label: "Contact Us", id: "contact" }
  ];

  const handleNavClick = (e, id) => {
    e.preventDefault();
    if (location.pathname === "/") {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: id } });
    }
    setUnauthHamburgerOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {user ? (
          <Link to={logoLink}>
            <img src={appLogo} alt="Research Hub Logo" className="app-logo" />
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
          <div className="navbar-center desktop-nav">
            {unauthLinks.map(link => (
              <a
                key={link.label}
                href={`#${link.id}`}
                onClick={e => handleNavClick(e, link.id)}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="navbar-right desktop-nav">
            <a href="#login" onClick={() => navigate("/login")} className="navbar-link">Login</a>
            <a href="#signup" onClick={() => navigate("/role-selection")} className="navbar-link">Signup</a>
          </div>
          <div className="navbar-hamburger" onClick={() => setUnauthHamburgerOpen(!unauthHamburgerOpen)}>
            {unauthHamburgerOpen ? (
              <span className="hamburger-close">&#10005;</span>
            ) : (
              <span className="hamburger-icon">&#9776;</span>
            )}
          </div>
          <div className={`navbar-sidebar ${unauthHamburgerOpen ? "open" : ""}`}>
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
            <a href="#login" onClick={() => { navigate("/login"); setUnauthHamburgerOpen(false); }} className="sidebar-link">Login</a>
            <a href="#signup" onClick={() => { navigate("/role-selection"); setUnauthHamburgerOpen(false); }} className="sidebar-link">Signup</a>
          </div>
          {unauthHamburgerOpen && <div className="navbar-overlay" onClick={() => setUnauthHamburgerOpen(false)}></div>}
        </>
      )}

      {/* --- Authenticated Student/Guest Navbar --- */}
      {isStudentOrGuest && (
        <>
          <div className="navbar-right desktop-nav">
            {user.role === "student" && (user.year_level === "3rd" || user.year_level === "4th" || user.grade_level === "12") && (
              <Link to="/submit-research" style={{ fontSize: '1.1rem' }}>Upload Project</Link>
            )}
            <Link to="/my-account" style={{ fontSize: '1.1rem', marginLeft: "5rem" }}>My Account</Link>
            <span style={{ position: "relative", marginLeft: "5rem" }}>
              <img
                src={notifIcon}
                alt="Notifications"
                ref={studentBellRef}
                style={{ width: 26, height: 26, cursor: "pointer", filter: "invert(1)" }}
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
                          {notif.reason}
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
            <button onClick={handleLogout} className="navbar-logout-btn">Logout</button>
          </div>
          <div className="navbar-hamburger auth-hamburger" onClick={() => setAuthHamburgerOpen(!authHamburgerOpen)}>
            {authHamburgerOpen ? <span className="hamburger-close">&#10005;</span> : <span className="hamburger-icon">&#9776;</span>}
          </div>
          <div className={`navbar-sidebar auth-navbar-sidebar ${authHamburgerOpen ? "open" : ""}`}>
            {sidebarLinks.map((link) =>
              link.action ? (
                <button key={link.label} className="sidebar-link" onClick={() => { link.action(); setAuthHamburgerOpen(false); }}>
                  {link.label}
                </button>
              ) : (
                <Link key={link.label} to={link.to} className="sidebar-link" onClick={() => setAuthHamburgerOpen(false)}>
                  {link.label}
                </Link>
              )
            )}
          </div>
          {authHamburgerOpen && <div className="navbar-overlay" onClick={() => setAuthHamburgerOpen(false)}></div>}
        </>
      )}

      {/* --- Admin / Adviser / Head Admin Navbar --- */}
      {isAdminRole && (
        <div className="navbar-right">
            {/* "My Account" link for larger screens */}
            <Link to="/my-account" className="my-account-link">My Account</Link>

            {/* Hamburger for Tablet/Mobile */}
            <div className="navbar-hamburger" onClick={onHamburgerClick}>
                {isHamburgerOpen ? (
                    <span className="hamburger-close">&#10005;</span>
                ) : (
                    <span className="hamburger-icon">&#9776;</span>
                )}
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;