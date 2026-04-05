import { useState, useEffect } from "react";
import API_URL from "../config/api";

/**
 * Returns whether the current logged-in user is the assigned scorer for an event.
 * @param {string} eventId
 * @returns {{ isScorer: boolean, loading: boolean }}
 */
export default function useScorerRole(eventId) {
  const [isScorer, setIsScorer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    const check = async () => {
      try {
        const [eventRes, profileRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/events/get-single-event/${eventId}`, { credentials: "include" }),
          fetch(`${API_URL}/api/v1/users/profile`, { credentials: "include" }),
        ]);
        const eventData = await eventRes.json();
        const profileData = await profileRes.json();
        const userId = profileData?.data?._id?.toString();
        const scorer = eventData?.data?.scorerUpdater?.toString();
        setIsScorer(!!userId && !!scorer && userId === scorer);
      } catch (e) {
        console.log("useScorerRole error", e);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [eventId]);

  return { isScorer, loading };
}
