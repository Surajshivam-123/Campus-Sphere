import apiClient from "../services/api.service";

/**
 * Wrapper around fetchWithAuth that routes through the Axios apiClient.
 * This ensures that all components utilizing fetchWithAuth automatically
 * benefit from apiClient's request and response interceptors.
 */
export default async function fetchWithAuth(url, options = {}) {
  const method = (options.method || "GET").toLowerCase();
  
  const config = {
    method,
    headers: options.headers || {},
    timeout: options.timeout,
  };

  if (options.body) {
    if (typeof options.body === "string") {
      try {
        config.data = JSON.parse(options.body);
      } catch {
        config.data = options.body;
      }
    } else {
      config.data = options.body;
    }
  }

  // Extract relative URL if it starts with VITE_API_URL or a local origin fallback
  let relativeUrl = url;
  const apiUrl = import.meta.env.VITE_API_URL || "";
  if (apiUrl && url.startsWith(apiUrl)) {
    relativeUrl = url.substring(apiUrl.length);
  }

  try {
    const data = await apiClient(relativeUrl, config);
    
    // Return a mock Fetch response object
    return {
      ok: true,
      status: data?.statusCode || 200,
      json: async () => data,
      text: async () => typeof data === "string" ? data : JSON.stringify(data),
    };
  } catch (error) {
    // apiClient rejects with { message, status, errors }
    return {
      ok: false,
      status: error?.status || 500,
      json: async () => ({
        success: false,
        message: error?.message || "Something went wrong",
        errors: error?.errors,
      }),
      text: async () => error?.message || "Something went wrong",
    };
  }
}

