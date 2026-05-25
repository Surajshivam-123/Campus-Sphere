import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Wraps public-only routes (login, register, landing).
 * - If authenticated → redirect to /home
 * - If not authenticated → show the page
 * - `landing` prop: marks the root "/" page (no redirect for guests)
 */
export default function PublicRoute({ children, landing = false }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
