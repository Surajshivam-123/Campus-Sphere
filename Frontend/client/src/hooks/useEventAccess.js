import { useState, useEffect } from "react";
import API_URL from "../config/api";
import fetchWithAuth from "../config/fetchWithAuth.js"
/**
 * Checks if the logged-in user has access to an event's matches.
 * Access = organiser | member | participant | cricket player in that event.
 */
export default function useEventAccess(eventId) {
  const [access, setAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) { setLoading(false); return; }

    // Probe the matches endpoint — 200 means access granted, 403 means denied
    fetch(`${API_URL}/api/cpsh/matches/event/${eventId}`, { credentials: "include" })
      .then((r) => setAccess(r.ok))
      .catch(() => setAccess(false))
      .finally(() => setLoading(false));
  }, [eventId]);

  return { access, loading };
}
