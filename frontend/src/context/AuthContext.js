// filepath: researchhub-frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // New state to indicate if auth check is in progress

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token"); // Get the token, not the user object
      if (token) {
        try {
          const profileUrl = `${process.env.REACT_APP_BACKEND_URL}/api/users/profile`;
                const res = await axios.get(profileUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

          // Assuming your backend /users/profile returns { user: { id, email, role, ... } }
          setUser(res.data.user);
          // Also update the token in case it was refreshed by the backend
          // (though your current backend doesn't refresh it, this is good practice)
          // localStorage.setItem("token", res.data.newToken || token);
        } catch (error) {
          console.error("Failed to re-authenticate user:", error);
          localStorage.removeItem("token"); // Remove invalid/expired token
          localStorage.removeItem("user"); // Clear stale user data
          setUser(null);
        }
      }
      setLoading(false); // Authentication check is complete
    };
    loadUser();
  }, []); // Empty dependency array means this runs once on component mount

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