import { useState, useEffect } from "react";
import apiClient from "../services/api.service";

/**
 * Generic hook for fetching data from API
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @param {Array} dependencies - Dependencies to trigger refetch
 * @returns {Object} { data, loading, error, refetch }
 */
export const useFetch = (url, options = {}, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(url, options);

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || "Failed to fetch data");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook for fetching data with manual trigger
 * @returns {Object} { data, loading, error, fetchData }
 */
export const useLazyFetch = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (url, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(url, options);

      if (response.success) {
        setData(response.data);
        return response.data;
      } else {
        const errorMsg = response.message || "Failed to fetch data";
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "An error occurred";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
};

/**
 * Hook for mutations (POST, PUT, DELETE)
 * @returns {Object} { data, loading, error, mutate }
 */
export const useMutation = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (url, method = "POST", body = null, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      switch (method.toUpperCase()) {
        case "POST":
          response = await apiClient.post(url, body, options);
          break;
        case "PUT":
          response = await apiClient.put(url, body, options);
          break;
        case "PATCH":
          response = await apiClient.patch(url, body, options);
          break;
        case "DELETE":
          response = await apiClient.delete(url, options);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (response.success) {
        setData(response.data);
        return response.data;
      } else {
        const errorMsg = response.message || "Operation failed";
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "An error occurred";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, mutate };
};
