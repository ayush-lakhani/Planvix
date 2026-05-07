import axios from "axios";
import { alertUtils } from "../utils/alertUtils";

const API_URL = import.meta.env.VITE_API_URL;

// Public Client (No Auth)
export const publicClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for publicClient
publicClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      alertUtils.warning(
        "Too Many Requests",
        "You're sending requests too fast. Please wait a moment."
      );
    }
    return Promise.reject(error);
  }
);

// Authenticated Client (JWT — User Auth)
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add user JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for status handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      alertUtils.warning(
        "Too Many Requests",
        `You've reached your ${localStorage.getItem("tier") || "free"} tier limit. Please wait ${retryAfter || "a few seconds"} before trying again.`
      );
    }
    return Promise.reject(error);
  },
);

// Admin Client (JWT — Admin Auth)
export const adminClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add admin secret header (header-based auth)
// Uses sessionStorage — secret is cleared when the tab closes, reducing persistence risk.
adminClient.interceptors.request.use(
  (config) => {
    const adminSecret = sessionStorage.getItem("adminSecret");
    if (adminSecret) {
      config.headers["x-admin-secret"] = adminSecret;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for 401/403 handling (admin auth)
adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn(
        "⚠️ Admin token expired or invalid. Redirecting to admin login...",
      );

      sessionStorage.removeItem("adminSecret");

      if (!window.location.pathname.includes("/admin-login")) {
        window.location.href = "/admin-login";
      }
    }
    return Promise.reject(error);
  },
);
