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
      case "head_admin":
        return <Navigate to="/head-admin" />;
      case "research_adviser":
        return <Navigate to="/adviser" />;
      case "student":
        return <Navigate to="/projects" />;
      case "guest":
        return <Navigate to="/guest" />;
      default:
        return <Navigate to="/" />;
    }
  }

  return children;
};

export default RedirectIfAuthenticated;
