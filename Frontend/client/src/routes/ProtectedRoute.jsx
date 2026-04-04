import { Navigate } from "react-router-dom";

/**
 * Wraps protected routes — redirects to /login if no token in localStorage.
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
