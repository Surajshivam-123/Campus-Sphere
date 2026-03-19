import apiClient from "./api.service";

/**
 * User Service - API calls for user operations
 */
class UserService {
  /**
   * Register a new user
   */
  async register(userData) {
    const formData = new FormData();
    formData.append("fullname", userData.fullname);
    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    
    if (userData.avatar) {
      formData.append("avatar", userData.avatar);
    }

    return apiClient.post("/api/v1/users/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * Login user
   */
  async login(credentials) {
    const response = await apiClient.post("/api/v1/users/login", credentials);
    
    // Store token if returned
    if (response.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }
    
    return response;
  }

  /**
   * Logout user
   */
  async logout() {
    const response = await apiClient.post("/api/v1/users/logout");
    localStorage.removeItem("accessToken");
    return response;
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    return apiClient.get("/api/v1/users/profile");
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    return apiClient.post("/api/v1/users/refresh-token");
  }
}

export default new UserService();
