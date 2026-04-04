import { Navigate } from "react-router-dom";

/**
 * Wraps public-only routes (login, register) — redirects to /home if already logged in.
 */
export default function PublicRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  if (token) {
    return <Navigate to="/home" replace />;
  }
  return children;
}
