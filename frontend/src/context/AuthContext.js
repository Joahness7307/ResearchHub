// filepath: researchhub-frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // New state to indicate if auth check is in progress

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Use relative path so axios baseURL is used
          const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } catch (error) {
          console.error("Failed to re-authenticate user:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Still store user object for quick access
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Provide loading state so components can wait for auth check
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {loading ? <div>Loading user session...</div> : children}
    </AuthContext.Provider>
  );
};