import { useState, useEffect } from "react";
import API_URL from "../config/api";
import fetchWithAuth from "../config/fetchWithAuth.js";
/**
 * Custom hook to fetch participant data for an event
 * @param {string} eventId - Event ID
 * @returns {Object} { participant, loading, error, refetch }
 */
export const useEventParticipant = (eventId) => {
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchParticipant = async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetchWithAuth(
        `${API_URL}/api/cpsh/participants/get-single-participant/${eventId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result?.data && result.data.length > 0) {
        setParticipant(result.data[0]);
      } else {
        setError("No participant data found");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch participant data");
      console.error("Error fetching participant:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipant();
  }, [eventId]);

  return {
    participant,
    loading,
    error,
    refetch: fetchParticipant,
  };
};
