import { useState, useEffect } from "react";
import apiClient from "../services/api.service";

/**
 * Checks if the logged-in user has access to an event's matches.
 * Access = organiser | member | participant | cricket player in that event.
 */
export default function useEventAccess(eventId) {
  const [access, setAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) { setLoading(false); return; }

    // Probe the matches endpoint — success means access granted, failure means denied
    apiClient.get(`/api/cpsh/matches/event/${eventId}`)
      .then(() => setAccess(true))
      .catch(() => setAccess(false))
      .finally(() => setLoading(false));
  }, [eventId]);

  return { access, loading };
}

