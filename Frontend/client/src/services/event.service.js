import apiClient from "./api.service";

const eventService = {
  getAllEvents: async () => {
    return apiClient.get("/api/cpsh/events/get-all-events");
  },
  getEventById: async (eventId) => {
    return apiClient.get(`/api/cpsh/events/get-single-event/${eventId}`);
  },

  getEventByMemberCode: async (memberCode) => {
    return apiClient.get(`/api/cpsh/members/participate/${memberCode}`);
  },

  getEventByParticipantCode: async (participantCode) => {
    return apiClient.get(`/api/cpsh/participants/participate/${encodeURIComponent(participantCode)}`);
  },

  createEvent: async (eventData) => {
    return apiClient.post("/api/cpsh/events/create", eventData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  generatePoster: async (prompt) => {
    return apiClient.post("/api/cpsh/events/generate-poster", { prompt }, { timeout: 60000 });
  },

  updateEvent: async (eventId, eventData) => {
    return apiClient.patch(`/api/cpsh/events/update/${eventId}`, eventData);
  },

  deleteEvent: async (eventId) => {
    return apiClient.delete(`/api/cpsh/events/delete/${eventId}`);
  },

  getMyHostedEvents: async () => {
    return apiClient.get("/api/cpsh/events/get-all-events");
  },


  getPublicEvents: async (search = "", category = "all") => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category && category !== "all") params.append("category", category);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get(`/api/cpsh/events/public${queryString}`);
  },
};

export default eventService;
