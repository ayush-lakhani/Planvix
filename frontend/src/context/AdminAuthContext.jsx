/**
 * AdminAuthContext — Centralized admin authentication state
 * Admin secret is stored in sessionStorage (clears on tab close) to reduce persistence risk.
 * The interceptor attaches the x-admin-secret header automatically.
 */
import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const AdminAuthContext = createContext(null);

// Axios instance for admin endpoints
export const adminAxios = axios.create({
  baseURL: "",
  timeout: 30000,
});

// Attach admin secret to every request (header-based auth)
// Reads from sessionStorage — cleared automatically when the browser tab closes.
adminAxios.interceptors.request.use((config) => {
  const adminSecret = sessionStorage.getItem("adminSecret");
  if (adminSecret) {
    config.headers["x-admin-secret"] = adminSecret;
  }
  return config;
});

export function AdminAuthProvider({ children }) {
  const [adminToken, setAdminToken] = useState(() =>
    sessionStorage.getItem("adminSecret"),
  );
  const [loading, setLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // adminLogin: stores the validated secret under "adminSecret" key in sessionStorage.
  // sessionStorage is cleared when the tab closes, reducing the persistence window.
  const adminLogin = useCallback(async (secret) => {
    sessionStorage.setItem("adminSecret", secret);
    setAdminToken(secret);
    return secret;
  }, []);

  const adminLogout = useCallback(() => {
    setIsLoggingOut(true);
    sessionStorage.removeItem("adminSecret");
    setAdminToken(null);
  }, []);

  // Auto-logout on 401
  adminAxios.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401 && adminToken) {
        adminLogout();
      }
      return Promise.reject(error);
    },
  );

  return (
    <AdminAuthContext.Provider
      value={{
        adminToken,
        adminLogin,
        adminLogout,
        isLoggingOut,
        loading,
        setLoading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx)
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
};
