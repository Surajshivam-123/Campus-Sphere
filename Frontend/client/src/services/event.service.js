import apiClient from "./api.service";
import API_URL from "../config/api";

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
    // Use fetch for FormData
    const response = await fetch(`${API_URL}/api/cpsh/events/create`, {
      method: "POST",
      credentials: "include",
      body: eventData, // FormData object
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
