/**
 * Wrapper around fetch that automatically attaches the Authorization header
 * from localStorage when available, in addition to sending cookies.
 */
export default function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("accessToken");
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });
}
