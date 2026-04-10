import { Navigate } from "react-router-dom";

/**
 * Decodes a JWT and checks if it's expired (without verifying signature).
 */
function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is in seconds, Date.now() is in ms
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

/**
 * Wraps protected routes — redirects to /login if no token or token is expired.
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("accessToken");

  if (!token || !isTokenValid(token)) {
    localStorage.removeItem("accessToken");
    return <Navigate to="/login" replace />;
  }

  return children;
}
