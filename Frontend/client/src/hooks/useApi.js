import { useState } from "react";
import { useFetch, useLazyFetch, useMutation } from "./useFetch";

/**
 * Specialized hooks for common API patterns
 */

/**
 * Hook for fetching a list of items
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Object} { items, loading, error, refetch }
 */
export const useList = (endpoint, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  const { data, loading, error, refetch } = useFetch(url, {}, [
    JSON.stringify(params),
  ]);

  return {
    items: data || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching a single item by ID
 * @param {string} endpoint - API endpoint
 * @param {string} id - Item ID
 * @returns {Object} { item, loading, error, refetch }
 */
export const useItem = (endpoint, id) => {
  const url = id ? `${endpoint}/${id}` : null;
  const { data, loading, error, refetch } = useFetch(url);

  return {
    item: data,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for creating an item
 * @returns {Object} { create, loading, error, data }
 */
export const useCreate = () => {
  const { data, loading, error, mutate } = useMutation();

  const create = async (endpoint, itemData) => {
    return mutate(endpoint, "POST", itemData);
  };

  return { create, loading, error, data };
};

/**
 * Hook for updating an item
 * @returns {Object} { update, loading, error, data }
 */
export const useUpdate = () => {
  const { data, loading, error, mutate } = useMutation();

  const update = async (endpoint, id, itemData) => {
    return mutate(`${endpoint}/${id}`, "PUT", itemData);
  };

  return { update, loading, error, data };
};

/**
 * Hook for deleting an item
 * @returns {Object} { deleteItem, loading, error, data }
 */
export const useDelete = () => {
  const { data, loading, error, mutate } = useMutation();

  const deleteItem = async (endpoint, id) => {
    return mutate(`${endpoint}/${id}`, "DELETE");
  };

  return { deleteItem, loading, error, data };
};

/**
 * Hook for paginated data
 * @param {string} endpoint - API endpoint
 * @param {number} initialPage - Initial page number
 * @param {number} pageSize - Items per page
 * @returns {Object} { items, loading, error, page, totalPages, nextPage, prevPage, goToPage }
 */
export const usePagination = (endpoint, initialPage = 1, pageSize = 10) => {
  const [page, setPage] = useState(initialPage);

  const { data, loading, error, refetch } = useFetch(
    `${endpoint}?page=${page}&limit=${pageSize}`,
    {},
    [page]
  );

  const nextPage = () => {
    if (data?.pagination?.page < data?.pagination?.pages) {
      setPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= (data?.pagination?.pages || 1)) {
      setPage(pageNumber);
    }
  };

  return {
    items: data?.items || data || [],
    loading,
    error,
    page,
    totalPages: data?.pagination?.pages || 1,
    total: data?.pagination?.total || 0,
    nextPage,
    prevPage,
    goToPage,
    refetch,
  };
};

/**
 * Hook for search functionality
 * @param {string} endpoint - API endpoint
 * @param {string} initialQuery - Initial search query
 * @returns {Object} { results, loading, error, search, query, setQuery }
 */
export const useSearch = (endpoint, initialQuery = "") => {
  const [query, setQuery] = useState(initialQuery);
  const { data, loading, error, fetchData } = useLazyFetch();

  const search = async (searchQuery = query) => {
    if (searchQuery.trim()) {
      await fetchData(`${endpoint}?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return {
    results: data || [],
    loading,
    error,
    search,
    query,
    setQuery,
  };
};
