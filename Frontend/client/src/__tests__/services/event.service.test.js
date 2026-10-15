import { describe, it, expect, vi, beforeEach } from "vitest";
import eventService from "../../services/event.service.js";
import apiClient from "../../services/api.service.js";

vi.mock("../../services/api.service.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("EventService (Frontend)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllEvents should call /api/cpsh/events/get-all-events", async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    await eventService.getAllEvents();
    expect(apiClient.get).toHaveBeenCalledWith("/api/cpsh/events/get-all-events");
  });

  it("getEventById should call single event endpoint with ID", async () => {
    apiClient.get.mockResolvedValue({ data: { id: "123" } });
    await eventService.getEventById("123");
    expect(apiClient.get).toHaveBeenCalledWith("/api/cpsh/events/get-single-event/123");
  });

  it("createEvent should post multipart data", async () => {
    const formData = new FormData();
    formData.append("eventName", "Test Fest");
    apiClient.post.mockResolvedValue({ data: { id: "123" } });

    await eventService.createEvent(formData);

    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/cpsh/events/create",
      formData,
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  });

  it("updateEvent should patch event endpoint", async () => {
    const updateData = { eventName: "Updated Name" };
    apiClient.patch.mockResolvedValue({ data: { success: true } });

    await eventService.updateEvent("123", updateData);

    expect(apiClient.patch).toHaveBeenCalledWith(
      "/api/cpsh/events/update/123",
      updateData
    );
  });

  it("deleteEvent should delete event endpoint", async () => {
    apiClient.delete.mockResolvedValue({ success: true });
    await eventService.deleteEvent("123");
    expect(apiClient.delete).toHaveBeenCalledWith("/api/cpsh/events/delete/123");
  });

  it("getPublicEvents should build query parameters properly", async () => {
    apiClient.get.mockResolvedValue({ data: [] });

    await eventService.getPublicEvents("hackathon", "coding");

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/cpsh/events/public?search=hackathon&category=coding"
    );
  });
});
