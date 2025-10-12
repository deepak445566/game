// config/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000", // ✅ Added /api here
  withCredentials: true,
  timeout: 10000, // ✅ Add timeout for production
});

// ✅ Auto-add Token in Headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // ✅ Ensure headers are properly set
  config.headers["Content-Type"] = "application/json";
  return config;
});

// ✅ Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Please login again.");
      localStorage.removeItem("token");
      // Optional: Redirect to login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;