// src/components/RedirectIfAuthenticated.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RedirectIfAuthenticated = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (user) {
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin" />;
      case "research_coordinator":
        return <Navigate to="/research-coordinator" />;
      case "research_adviser":
        return <Navigate to="/research-adviser" />;
      case "student":
        return <Navigate to="/dashboard" />;
      case "guest":
        return <Navigate to="/dashboard" />;
      default:
        return <Navigate to="/" />;
    }
  }

  return children;
};

export default RedirectIfAuthenticated;
