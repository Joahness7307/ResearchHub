import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Determine logo link destination
  let logoLink = "/";
  if (user) {
    if (user.role === "student") logoLink = "/student";
    else if (user.role === "teacher") logoLink = "/teacher";
    else if (user.role === "admin") logoLink = "/admin";
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to={logoLink}>ResearchHub</Link>
      </div>
      <div className="navbar-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Signup</Link>
          </>
        )}
        {user && user.role === "student" && (
          <>
            <Link to="/student">Dashboard</Link>
            <Link to="/submit-research">Submit Proposal</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
        {user && user.role === "teacher" && (
          <>
            <Link to="/teacher">Dashboard</Link>
            <Link to="/submit-review">Review Proposals</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
        {user && user.role === "admin" && (
          <>
            <Link to="/admin">Dashboard</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;