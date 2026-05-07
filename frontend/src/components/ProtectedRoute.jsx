import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardSkeleton from "./DashboardSkeleton";

/**
 * ProtectedRoute — Guards routes against unauthenticated access.
 * Uses reactive AuthContext state to prevent redirect loops and staleness.
 */
const ProtectedRoute = ({ children }) => {
  const { token, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!token || !user) {
    // Redirect to login but save the current location we were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
