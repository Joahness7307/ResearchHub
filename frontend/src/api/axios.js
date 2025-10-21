import axios from "axios";

const rawBase = process.env.REACT_APP_BACKEND_URL || "";
const base = rawBase ? rawBase.replace(/\/$/, "") : ""; // remove trailing slash if present

const instance = axios.create({
  baseURL: base ? `${base}/api` : "/api", // fallback to relative /api in dev
  timeout: 15000, // optional timeout
});

// Attach token automatically
instance.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: central 401 handler (keeps client behavior consistent)
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      // remove cached auth info — AuthContext also listens for 401, so this is safe
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // DO NOT redirect here (let AuthContext react to 401 and redirect)
    }
    return Promise.reject(err);
  }
);

export default instance;