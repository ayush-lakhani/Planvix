import axios from "axios";

export const adminAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

adminAPI.interceptors.request.use((config) => {
  // sessionStorage: cleared automatically when the tab/browser closes
  const secret = sessionStorage.getItem("adminSecret");
  if (secret) {
    config.headers["x-admin-secret"] = secret;
  }
  return config;
});

adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
