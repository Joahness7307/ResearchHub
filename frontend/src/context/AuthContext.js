import React, { createContext, useState, useEffect } from "react";
import axios from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // hydrate from localStorage synchronously to avoid flash-logout
  const initialUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(true);

  // login / logout helpers
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    // keep cached user visible while revalidating in background
    const revalidate = async () => {
      try {
        const res = await axios.get("/users/profile"); // axios will include token via request interceptor
        if (!mounted) return;
        if (res?.data?.user) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch (err) {
        // Only remove token on explicit 401
        if (err.response && err.response.status === 401) {
          logout();
        } else {
          // transient/network error — keep cached user so user stays logged in
          console.warn("Auth revalidation failed (network), keeping cached user", err.message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    revalidate();
    return () => {
      mounted = false;
    };
  }, []);

  // global axios response interceptor to handle 401 -> force logout
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (resp) => resp,
      (err) => {
        if (err.response && err.response.status === 401) {
          // force logout (user must login again)
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};