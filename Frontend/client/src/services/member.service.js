import apiClient from "./api.service";

const memberService = {
  // Preview event by member code (GET)
  getEventByMemberCode: (memberCode) =>
    apiClient.get(`/api/cpsh/members/participate/${memberCode}`),

  // Submit join request (POST)
  requestJoinEvent: (memberCode) =>
    apiClient.post(`/api/cpsh/members/participate/${memberCode}`),

  // Organizer: get pending join requests for an event
  getJoinRequests: (eventId) =>
    apiClient.get(`/api/cpsh/members/join-requests/${eventId}`),

  // Organizer: approve or reject a request
  handleJoinRequest: (requestId, action) =>
    apiClient.patch(`/api/cpsh/members/join-requests/handle/${requestId}`, { action }),

  // Get all events the user is a member of
  getAllMemberEvents: () =>
    apiClient.get("/api/cpsh/members/get-all-events"),

  // Get all members of an event
  getMembers: (eventId) =>
    apiClient.get(`/api/cpsh/members/get-member/${eventId}`),
};

export default memberService;
