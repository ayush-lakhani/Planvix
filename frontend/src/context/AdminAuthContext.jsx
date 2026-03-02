/**
 * AdminAuthContext — Centralized admin authentication state
 * Admin secret is stored in sessionStorage (clears on tab close) to reduce persistence risk.
 * The interceptor attaches the x-admin-secret header automatically.
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
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

// Response interceptor registered ONCE at module level — not inside component
// This avoids stacking interceptors on every render
let _adminLogoutCallback = null;
adminAxios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && _adminLogoutCallback) {
      _adminLogoutCallback();
    }
    return Promise.reject(error);
  },
);

export function AdminAuthProvider({ children }) {
  const [adminToken, setAdminToken] = useState(() => {
    try {
      return sessionStorage.getItem("adminSecret") || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const adminLogout = useCallback(() => {
    setIsLoggingOut(true);
    sessionStorage.removeItem("adminSecret");
    setAdminToken(null);
  }, []);

  // Register the logout callback at module level so interceptor can call it
  useEffect(() => {
    _adminLogoutCallback = adminLogout;
    return () => {
      _adminLogoutCallback = null;
    };
  }, [adminLogout]);

  // adminLogin: stores the validated secret under "adminSecret" key in sessionStorage.
  // sessionStorage is cleared when the tab closes, reducing the persistence window.
  const adminLogin = useCallback(async (secret) => {
    sessionStorage.setItem("adminSecret", secret);
    setAdminToken(secret);
    return secret;
  }, []);

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
