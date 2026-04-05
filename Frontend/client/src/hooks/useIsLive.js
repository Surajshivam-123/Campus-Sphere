import { useState, useEffect } from "react";

/**
 * Polls the backend to check if any match in the event is currently live.
 * @param {string} eventId
 * @returns {{ isLive: boolean, loading: boolean }}
 */
export default function useIsLive(eventId) {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) { setLoading(false); return; }

    const check = () =>
      fetch(`/api/v1/sports/cricket/matches/event/${eventId}/is-live`, { credentials: "include" })
        .then((r) => r.json())
        .then((res) => setIsLive(!!res?.data?.isLive))
        .catch(() => setIsLive(false))
        .finally(() => setLoading(false));

    check();
    // Re-check every 30 seconds so the button appears as soon as a match goes live
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [eventId]);

  return { isLive, loading };
}
