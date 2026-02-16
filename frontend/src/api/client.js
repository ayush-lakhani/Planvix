import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Public Client (No Auth)
export const publicClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authenticated Client (JWT)
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ Token expired or invalid. Redirecting to login...');
      
      // Clear ALL auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('adminSecret');
      
      // Force redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Admin Client (Secret Header)
export const adminClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Admin Secret
adminClient.interceptors.request.use(
  (config) => {
    // You might want to store this in a separate storage key or environment variable
    // For now, assuming it might be input by the user or stored in session
    const adminSecret = localStorage.getItem('adminSecret'); 
    if (adminSecret) {
      config.headers['x-admin-secret'] = adminSecret;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
