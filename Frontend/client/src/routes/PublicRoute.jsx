import { Navigate } from "react-router-dom";

function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

/**
 * Wraps public-only routes (login, register) — redirects to /home only if token is valid.
 */
export default function PublicRoute({ children }) {
  const token = localStorage.getItem("accessToken");

  if (token && isTokenValid(token)) {
    return <Navigate to="/home" replace />;
  }

  // Clean up expired token if present
  if (token) localStorage.removeItem("accessToken");

  return children;
}
