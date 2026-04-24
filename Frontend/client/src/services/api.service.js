import axios from "axios";
import API_URL from "../config/api";

/**
 * Axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let forceLogoutHandler = null;

export function setForceLogoutHandler(fn) {
  forceLogoutHandler = fn;
}

function triggerForceLogout() {
  if (forceLogoutHandler) {
    forceLogoutHandler();
  } else {
    localStorage.removeItem("accessToken");
    window.location.replace("/login");
  }
}

/**
 * Request interceptor - Add auth token to requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - Handle 401s with token refresh, force logout on failure
 */
apiClient.interceptors.response.use(
  (response) => {
    if (response.data) return response.data;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // No response at all — network-level failure (CORS block, DNS, server down, etc.)
    if (!error.response) {
      const message =
        error.code === "ECONNABORTED"
          ? "Request timed out. The server may be starting up — please try again in a moment."
          : "Unable to reach the server. Please check your connection and try again.";
      return Promise.reject({ message, status: undefined, errors: undefined });
    }

    // Handle 401 Unauthorized — attempt token refresh once
    // Skip refresh for auth endpoints (login, register) — there is no session yet
    const isAuthEndpoint = originalRequest.url?.includes("/login") || originalRequest.url?.includes("/register");

    if (error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_URL}/api/cpsh/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = response.data?.data?.accessToken;
        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }

        // No token in response — session is dead
        triggerForceLogout();
        return Promise.reject(error);
      } catch {
        // Refresh token also expired or invalid — force login
        triggerForceLogout();
        return Promise.reject(error);
      }
    }

    const errorMessage =
      error.response?.data?.message || error.message || "Something went wrong";

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      errors: error.response?.data?.errors,
    });
  }
);

export default apiClient;
