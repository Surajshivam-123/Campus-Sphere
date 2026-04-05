import { useFetch } from "./useFetch";
import { useList } from "./useApi";

/**
 * Custom hooks for event-related operations
 */

/**
 * Hook to fetch all events
 * @param {Object} filters - Filter parameters
 * @returns {Object} { events, loading, error, refetch }
 */
export const useEvents = (filters = {}) => {
  const { items, loading, error, refetch } = useList("/api/v1/events", filters);

  return {
    events: items,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch a single event by ID
 * @param {string} eventId - Event ID
 * @returns {Object} { event, loading, error, refetch }
 */
export const useEvent = (eventId) => {
  const { data, loading, error, refetch } = useFetch(
    eventId ? `/api/v1/events/${eventId}` : null
  );

  return {
    event: data,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch my hosted events
 * @returns {Object} { events, loading, error, refetch }
 */
export const useMyHostedEvents = () => {
  const { data, loading, error, refetch } = useFetch("/api/v1/events/my-hosted");

  return {
    events: data || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch my participated events
 * @returns {Object} { events, loading, error, refetch }
 */
export const useMyParticipatedEvents = () => {
  const { data, loading, error, refetch } = useFetch(
    "/api/v1/participants/my-events"
  );

  return {
    events: data || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch my member events
 * @returns {Object} { events, loading, error, refetch }
 */
export const useMyMemberEvents = () => {
  const { data, loading, error, refetch } = useFetch(
    "/api/cpsh/members/get-all-events"
  );

  return {
    events: data || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch events by type
 * @param {string} eventType - Event type (cricket, cultural, workshop)
 * @returns {Object} { events, loading, error, refetch }
 */
export const useEventsByType = (eventType) => {
  const { items, loading, error, refetch } = useList("/api/v1/events", {
    type: eventType,
  });

  return {
    events: items,
    loading,
    error,
    refetch,
  };
};
