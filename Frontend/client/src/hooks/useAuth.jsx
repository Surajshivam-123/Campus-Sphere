import { useState, useEffect, createContext, useContext, useCallback, useMemo } from "react";
import userService from "../services/user.service";
import { setForceLogoutHandler } from "../services/api.service";

const AuthContext = createContext(null);

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Called by the axios interceptor when both access + refresh tokens are dead
  const forceLogout = useCallback(() => {
    localStorage.removeItem("accessToken");
    setUser(null);
    // Use replace so the user can't go back to the protected page
    window.location.replace("/login");
  }, []);

  // Register the forceLogout handler with the axios interceptor on mount
  useEffect(() => {
    setForceLogoutHandler(forceLogout);
  }, [forceLogout]);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");

      // No token — not authenticated
      if (!token) {
        setLoading(false);
        return;
      }

      // Token expired client-side — try silent refresh first
      if (isTokenExpired(token)) {
        localStorage.removeItem("accessToken");
        try {
          await userService.refreshToken();
        } catch {
          setUser(null);
          setLoading(false);
          return;
        }
      }

      // Verify against backend — catches tampered/revoked tokens
      const response = await userService.getProfile();
      if (!response?.data) throw new Error("Invalid profile response");
      setUser(response?.data?.user || response?.data);
    } catch (err) {
      // Only clear auth on explicit 401 — not on network errors (backend down)
      if (err?.status === 401) {
        localStorage.removeItem("accessToken");
        setUser(null);
      } else {
        // Network error or server down — keep existing token, user stays logged in
        console.warn("Auth check failed (network?):", err?.message || err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (credentials) => {
    try {
      setError(null);
      const response = await userService.login(credentials);
      setUser(response.data.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await userService.register(userData);
      setUser(response.data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Tell backend to clear refreshToken from DB and clear cookies
      await userService.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      // Always clear local state regardless of API result
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      register,
      logout,
      checkAuth,
      isAuthenticated: !!user,
    }),
    [user, loading, error, login, register, logout, checkAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
