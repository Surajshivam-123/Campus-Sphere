import apiClient from "./api.service";

/**
 * Participant service for all participant-related API calls
 */
const participantService = {
  /**
   * Get participant by event ID
   */
  getParticipantByEventId: async (eventId) => {
    return apiClient.get(`/api/cpsh/participants/get-single-participant/${eventId}`);
  },

  /**
   * Get event details by participant code
   */
  getEventByParticipantCode: async (participantCode) => {
    return apiClient.get(`/api/cpsh/participants/participate/${encodeURIComponent(participantCode)}`);
  },

  /**
   * Delete participant
   */
  deleteParticipant: async (participantId) => {
    return apiClient.delete(`/api/cpsh/participants/delete-participant/${participantId}`);
  },

  /**
   * Get my participated events
   */
  getMyParticipatedEvents: async () => {
    return apiClient.get("/api/cpsh/participants/my-events");
  },
};

export default participantService;
