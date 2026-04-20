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

    return apiClient.post("/api/cpsh/users/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * Login user
   */
  async login(credentials) {
    const response = await apiClient.post("/api/cpsh/users/login", credentials);

    // Interceptor unwraps axios response, so shape is: { statusCode, data: { user, accessToken, refreshToken }, message }
    if (response?.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout() {
    const response = await apiClient.post("/api/cpsh/users/logout");
    localStorage.removeItem("accessToken");
    return response;
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    return apiClient.get("/api/cpsh/users/profile");
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    const response = await apiClient.post("/api/cpsh/users/refresh-token");
    if (response.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }
    return response;
  }
}

export default new UserService();
