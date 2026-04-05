import apiClient from "./api.service";

/**
 * Event service for all event-related API calls
 */
const eventService = {
  /**
   * Get all events
   */
  getAllEvents: async () => {
    return apiClient.get("/api/cpsh/events/get-all-events");
  },

  /**
   * Get single event by ID
   */
  getEventById: async (eventId) => {
    return apiClient.get(`/api/cpsh/events/get-single-event/${eventId}`);
  },

  /**
   * Get event by member code
   */
  getEventByMemberCode: async (memberCode) => {
    return apiClient.get(`/api/cpsh/members/participate/${memberCode}`);
  },

  /**
   * Get event by participant code
   */
  getEventByParticipantCode: async (participantCode) => {
    return apiClient.get(`/api/cpsh/participants/participate/${encodeURIComponent(participantCode)}`);
  },

  /**
   * Create new event
   */
  createEvent: async (eventData) => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch("/api/cpsh/events/create", {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: eventData, // FormData — no Content-Type header, browser sets it with boundary
    });
    return response.json();
  },

  /**
   * Update event
   */
  updateEvent: async (eventId, eventData) => {
    return apiClient.patch(`/api/cpsh/events/update/${eventId}`, eventData);
  },

  /**
   * Delete event
   */
  deleteEvent: async (eventId) => {
    return apiClient.delete(`/api/cpsh/events/delete/${eventId}`);
  },

  /**
   * Get my hosted events
   */
  getMyHostedEvents: async () => {
    return apiClient.get("/api/cpsh/events/get-all-events");
  },
};

export default eventService;
