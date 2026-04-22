// services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

function getStoredToken() {
  const token = localStorage.getItem("token");
  return token ? token.replace(/^"(.*)"$/, "$1") : null;
}

function clearStoredAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("user");
}

API.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = String(error?.response?.data?.message || "").toLowerCase();
    const isTokenError =
      status === 401 &&
      (message.includes("token") ||
        message.includes("jwt") ||
        message.includes("expired") ||
        message.includes("unauthorized"));

    if (isTokenError) {
      clearStoredAuth();

      const currentPath = window.location.pathname || "";
      if (currentPath !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  },
);

export default API;
