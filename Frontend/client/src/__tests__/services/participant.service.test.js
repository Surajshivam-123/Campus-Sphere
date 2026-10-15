import { describe, it, expect, vi, beforeEach } from "vitest";
import participantService from "../../services/participant.service.js";
import apiClient from "../../services/api.service.js";

vi.mock("../../services/api.service.js", () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("ParticipantService (Frontend)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getParticipantByEventId should call single participant endpoint", async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    await participantService.getParticipantByEventId("evt123");
    expect(apiClient.get).toHaveBeenCalledWith("/api/cpsh/participants/get-single-participant/evt123");
  });

  it("getEventByParticipantCode should encode participant code", async () => {
    apiClient.get.mockResolvedValue({ data: {} });
    await participantService.getEventByParticipantCode("code/123");
    expect(apiClient.get).toHaveBeenCalledWith("/api/cpsh/participants/participate/code%2F123");
  });

  it("deleteParticipant should call delete endpoint", async () => {
    apiClient.delete.mockResolvedValue({ success: true });
    await participantService.deleteParticipant("part123");
    expect(apiClient.delete).toHaveBeenCalledWith("/api/cpsh/participants/delete-participant/part123");
  });

  it("getMyParticipatedEvents should call my-events endpoint", async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    await participantService.getMyParticipatedEvents();
    expect(apiClient.get).toHaveBeenCalledWith("/api/cpsh/participants/my-events");
  });
});
