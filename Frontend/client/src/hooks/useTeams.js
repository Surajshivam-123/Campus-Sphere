import { useFetch } from "./useFetch";

/**
 * Custom hooks for team-related operations
 */

/**
 * Hook to fetch my teams
 * @returns {Object} { teams, loading, error, refetch }
 */
export const useMyTeams = () => {
  const { data, loading, error, refetch } = useFetch("/api/cpsh/teams/my-teams");

  return {
    teams: data || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch team by ID
 * @param {string} teamId - Team ID
 * @returns {Object} { team, loading, error, refetch }
 */
export const useTeam = (teamId) => {
  const { data, loading, error, refetch } = useFetch(
    teamId ? `/api/cpsh/teams/${teamId}` : null
  );

  return {
    team: data,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch teams for an event
 * @param {string} eventId - Event ID
 * @returns {Object} { teams, loading, error, refetch }
 */
export const useEventTeams = (eventId) => {
  const { data, loading, error, refetch } = useFetch(
    eventId ? `/api/cpsh/teams/event/${eventId}` : null
  );

  return {
    teams: data || [],
    loading,
    error,
    refetch,
  };
};
