import NotificationBell from "../../assets/notification.png";
import React, { useRef, useEffect, useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import appLogo from '../../assets/appLogo.png';
import axios from "../../api/axios"; // Add this import
import io from "socket.io-client";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [studentNotifCount, setStudentNotifCount] = useState(0);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [studentNotifications, setStudentNotifications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef(null);

  // Close dropdown when clicking outside
useEffect(() => {
  if (!showProjectsDropdown) return;
  const handleClickOutside = (e) => {
    const dropdown = document.getElementById("projects-dropdown");
    if (dropdown && !dropdown.contains(e.target)) {
      setShowProjectsDropdown(false);
      setSelectedCategory(null);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [showProjectsDropdown]);

useEffect(() => {
    if (user && user.role === "student") {  
      axios.get("/research/categories")
        .then(res => setCategories(res.data.categories))
        .catch(() => setCategories([]));
    }
  }, [user]);

  useEffect(() => {
  // Fetch pending count when admin logs in
  const fetchPendingCount = async () => {
    try {
      const res = await axios.get("/research/admin/all");
      const pending = res.data.papers.filter(p => p.status === "pending").length;
      setNotifCount(pending);
    } catch (err) {
      setNotifCount(0);
    }
  };

    if (user && user.role === "admin") {
      fetchPendingCount();

      socketRef.current = io(process.env.REACT_APP_BACKEND_URL);
      socketRef.current.on("new_research_submission", () => {
        setNotifCount((prev) => prev + 1);
      });
    }
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

const fetchStudentNotifications = async () => {
  try {
    const res = await axios.get("/notifications/student/notifications");
    setStudentNotifications(res.data.notifications || []);
    setStudentNotifCount(res.data.notifications.filter(n => !n.isRead).length);
  } catch {
    setStudentNotifications([]);
    setStudentNotifCount(0);
  }
};

useEffect(() => {
  if (user && user.role === "student") {
    fetchStudentNotifications();
  }
}, [user]);

  // Socket.io: Listen for student notifications
  useEffect(() => {
    if (user && user.role === "student") {
      socketRef.current = io(process.env.REACT_APP_BACKEND_URL);

      // Listen for events specific to this student
      socketRef.current.on(`student_notify_${user.id}`, () => {
        fetchStudentNotifications();
      });

      // Initial fetch
      fetchStudentNotifications();

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
    // eslint-disable-next-line
  }, [user]);

  // When bell is clicked, open dropdown and fetch notifications
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

  // Determine logo link destination
  let logoLink = "/"; // Default for unauthenticated users
  if (user) { // If user is logged in
    if (user.role === "student") logoLink = "/projects"; // Assuming /projects is student dashboard
    else if (user.role === "admin") logoLink = "/admin";
  }

  // Helper to scroll to section - this is primarily for the homepage sections
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handler for nav links - only relevant for static sections on the home page
  const handleNavClick = (e, id) => {
    e.preventDefault();
    if (location.pathname === "/") {
      scrollToSection(id);
    } else {
      navigate("/", { state: { scrollTo: id } });
    }
  };

 const fetchNotifications = async () => {
  try {
    const res = await axios.get("/research/admin/notifications");
    setNotifications(res.data.notifications);
  } catch {
    setNotifications([]);
  }
};

  const handleBellClick = async () => {
    setShowDropdown((prev) => !prev);
    if (!showDropdown) {
      await fetchNotifications();
    }
  };

  useEffect(() => {
    if (!user) return;
    // Disconnect previous socket if exists
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    socketRef.current = io(process.env.REACT_APP_BACKEND_URL);

    if (user.role === "admin") {
      socketRef.current.on("new_research_submission", () => {
        setNotifCount((prev) => prev + 1);
      });
    }
    if (user.role === "student") {
      socketRef.current.on(`student_notify_${user.id}`, () => {
        fetchStudentNotifications();
      });
      fetchStudentNotifications();
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/*
          CONDITIONAL RENDERING FOR LOGO LINK:
          If user is authenticated, use React Router's Link to their dashboard.
          If user is NOT authenticated, use the existing anchor tag for homepage section scrolling.
        */}
        {user ? (
          <Link to={logoLink}> {/* Use Link for authenticated user's dashboard */}
            <img src={appLogo} alt="Research Hub Logo" className="app-logo" />
          </Link>
        ) : (
          <a href="#hero" onClick={(e) => handleNavClick(e, "hero")}> {/* Use anchor for unauthenticated homepage sections */}
            <img src={appLogo} alt="Research Hub Logo" className="app-logo" />
          </a>
        )}
      </div>

      {!user && (
        <div className="navbar-center">
          <a href="#about" onClick={e => handleNavClick(e, "about")}>About</a>
          <a href="#features" onClick={e => handleNavClick(e, "features")}>Features</a>
          <a href="#contact" onClick={e => handleNavClick(e, "contact")}>Contact Us</a>
        </div>
      )}

      <div className="navbar-right">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Sign Up</Link>
          </>
        )}
{user && user.role === "student" && (
  <>
    <span style={{ position: "relative", margin: "0 2rem" }}>
      <button
        className="projects-dropdown-btn"
        onClick={() => setShowProjectsDropdown(prev => !prev)}
      >
        Projects ▼
      </button>
      {showProjectsDropdown && (
        <div
          id="projects-dropdown"
          className="projects-dropdown"
        >
          <div
            className={`projects-dropdown-item${selectedCategory === "all" ? " active" : ""}`}
            onClick={() => {
              setShowProjectsDropdown(false);
              setSelectedCategory("all");
              navigate("/projects");  
            }}
            onMouseEnter={() => setSelectedCategory("all")}
            onMouseLeave={() => setSelectedCategory(null)}
          >
            All Projects
          </div>
          {categories.map(cat => (
            <div
              key={cat}
              className={`projects-dropdown-item${selectedCategory === cat ? " active" : ""}`}
              onClick={() => {
                setShowProjectsDropdown(false);
                setSelectedCategory(cat);
                navigate(`/projects?category=${encodeURIComponent(cat)}`);
              }}
              onMouseEnter={() => setSelectedCategory(cat)}
              onMouseLeave={() => setSelectedCategory(null)}
            >
              {cat}
            </div>
          ))}
        </div>
      )}
    </span>
    <Link to="/submit-research" style={{ marginRight: "1rem" }}>Upload Research</Link>
    <Link to="/my-account">My Account</Link>
    <span style={{ position: "relative", margin: "0 1rem" }}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="coral"
        style={{ cursor: "pointer", marginRight: "20px" }}
        onClick={handleStudentBellClick}
      >
        <path d="M12 24c1.104 0 2-.896 2-2h-4c0 1.104.896 2 2 2zm6.364-6v-5c0-3.07-1.639-5.64-4.364-6.32V6c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5v.68C7.275 7.36 5.636 9.93 5.636 13v5l-1.636 1.5v.5h16v-.5l-1.636-1.5z"/>
      </svg>
      {studentNotifCount > 0 && (
        <span style={{
          position: "absolute",
          top: "-4px",
          right: "12px",
          background: "#b33834",
          color: "#fff",
          borderRadius: "50%",
          padding: "2px 7px",
          fontSize: "0.8rem",
          fontWeight: "bold"
        }}>{studentNotifCount}</span>
      )}
      {showStudentDropdown && (
        <div style={{
          position: "absolute",
          top: "36px",
          right: 0,
          background: "#333",
          boxShadow: "0 2px 8px rgba(0,0,0,0.13)",
          borderRadius: "8px",
          minWidth: "340px",
          zIndex: 1000,
          maxHeight: "400px",
          overflowY: "auto"
        }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid #eee", fontWeight: 600, color: "#fff" }}>
            Notifications
          </div>
          {studentNotifications.length === 0 ? (
            <div style={{ padding: "1rem", color: "#888" }}>No notifications.</div>
          ) : (
            studentNotifications.map((notif) => {
              const paper = notif.ResearchPaper;
              if (!paper) return null;
              let label = "";
              let labelColor = "#2563eb";
              let reasonText = "";
              if (paper.status === "approved") {
                label = "Your research was APPROVED";
                labelColor = "#34d399";
              } else if (paper.status === "rejected") {
                label = "Your research was REJECTED";
                labelColor = "#b33834";
                reasonText = paper.rejectionReason ? `Reason: ${paper.rejectionReason}` : "";
              }
              return (
                <div
                  key={notif.id}
                  style={{
                    padding: "0.8rem 2rem",
                    borderBottom: "1px solid #f3f3f3",
                    cursor: "pointer",
                    background: notif.isRead ? "#fff" : "#f0f6ff",
                    fontWeight: notif.isRead ? 400 : 600,
                    display: "flex",
                    alignItems: "center"
                  }}
                  onClick={async () => {
                    setShowStudentDropdown(false);
                    await axios.patch(`/notifications/student/notifications/${notif.id}/read`);
                    navigate(`/projects/${paper.id}`);
                  }}
                >
                  {!notif.isRead && (
                    <span style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#2563eb",
                      marginRight: 10
                    }}></span>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: labelColor, fontSize: "0.98rem", fontWeight: 700 }}>{label}</div>
                    {reasonText && (
                      <div style={{ fontSize: "0.95rem", color: "#b33834", marginTop: "0.2rem" }}>{reasonText}</div>
                    )}
                    <div style={{ fontSize: "0.85rem", color: "#888" }}>
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </span>
    <button onClick={handleLogout}>Logout</button>
  </>
)}
  
        {user && user.role === "admin" && (
          <>
            <Link to="/admin" style={{ marginRight: "20px" }}>Dashboard</Link>
            <span style={{ position: "relative", margin: "0 1rem" }}>
              <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="coral"
              style={{ cursor: "pointer", marginRight: "20px" }}
              onClick={handleBellClick}
            >
              <path d="M12 24c1.104 0 2-.896 2-2h-4c0 1.104.896 2 2 2zm6.364-6v-5c0-3.07-1.639-5.64-4.364-6.32V6c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5v.68C7.275 7.36 5.636 9.93 5.636 13v5l-1.636 1.5v.5h16v-.5l-1.636-1.5z"/>
            </svg>
              {notifCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-4px",
                  right: "12px",
                  background: "#b33834",
                  color: "#fff",
                  borderRadius: "50%",
                  padding: "2px 7px",
                  fontSize: "0.8rem",
                  fontWeight: "bold"
                }}>{notifCount}</span>
              )}
              {showDropdown && (
                <div style={{
                  position: "absolute",
                  top: "36px",
                  right: 0,
                  background: "#333",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.13)",
                  borderRadius: "8px",
                  minWidth: "340px",
                  zIndex: 1000,
                  maxHeight: "400px",
                  overflowY: "auto"
                }}>
                  <div style={{ padding: "1rem", borderBottom: "1px solid #eee", fontWeight: 600 }}>
                    Notifications
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "1rem", color: "#888" }}>No notifications.</div>
                  ) : (
                    notifications.map((notif) => {
                        const paper = notif.ResearchPaper;
                        if (!paper) return null; // <-- Prevents the error!
                        let label = "";
                        let labelColor = "#2563eb";
                        if (paper.status === "pending") {
                          label = "NEW UPLOADED RESEARCH PROJECT";
                          labelColor = "#2563eb";
                        } else if (paper.status === "approved") {
                          label = "APPROVED RESEARCH PROJECT";
                          labelColor = "#34d399";
                        } else if (paper.status === "rejected") {
                          label = "REJECTED RESEARCH PROJECT";
                          labelColor = "#b33834";
                        }
                        return (
                          <div
                            key={notif.id}
                            style={{
                              padding: "0.8rem 2rem",
                              borderBottom: "1px solid #f3f3f3",
                              cursor: "pointer",
                              background: notif.isRead ? "#fff" : "#f0f6ff",
                              fontWeight: notif.isRead ? 400 : 600,
                              display: "flex",
                              alignItems: "center"
                            }}
                            onClick={async () => {
                              setShowDropdown(false);
                              await axios.patch(`/research/admin/notifications/${notif.id}/read`);
                              navigate(`/projects/${paper.id}`);
                            }}
                          >
                            {!notif.isRead && (
                              <span style={{
                                display: "inline-block",
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: "#2563eb",
                                marginRight: 10
                              }}></span>
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ color: labelColor, fontSize: "0.98rem", fontWeight: 700 }}>{label}</div>
                              <div style={{ fontSize: "0.85rem", color: "#888" }}>
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        );
                      })
                      )}
                    </div>
                  )}
            </span>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;