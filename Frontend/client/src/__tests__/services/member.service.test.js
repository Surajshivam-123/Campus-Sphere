import { describe, it, expect, vi, beforeEach } from "vitest";
import memberService from "../../services/member.service.js";
import apiClient from "../../services/api.service.js";

vi.mock("../../services/api.service.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("MemberService (Frontend)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getEventByMemberCode should call participate endpoint with code", async () => {
    apiClient.get.mockResolvedValue({ data: {} });
    await memberService.getEventByMemberCode("mem123");
    expect(apiClient.get).toHaveBeenCalledWith("/api/cpsh/members/participate/mem123");
  });

  it("requestJoinEvent should post to participate endpoint with code", async () => {
    apiClient.post.mockResolvedValue({ data: {} });
    await memberService.requestJoinEvent("mem123");
    expect(apiClient.post).toHaveBeenCalledWith("/api/cpsh/members/participate/mem123");
  });

  it("getJoinRequests should call join-requests endpoint for event", async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    await memberService.getJoinRequests("event123");
    expect(apiClient.get).toHaveBeenCalledWith("/api/cpsh/members/join-requests/event123");
  });

  it("handleJoinRequest should patch action (approve/reject)", async () => {
    apiClient.patch.mockResolvedValue({ data: { success: true } });
    await memberService.handleJoinRequest("req123", "approve");
    expect(apiClient.patch).toHaveBeenCalledWith(
      "/api/cpsh/members/join-requests/handle/req123",
      { action: "approve" }
    );
  });

  it("getAllMemberEvents should call get-all-events endpoint", async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    await memberService.getAllMemberEvents();
    expect(apiClient.get).toHaveBeenCalledWith("/api/cpsh/members/get-all-events");
  });

  it("getMembers should call get-member endpoint for event", async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    await memberService.getMembers("event123");
    expect(apiClient.get).toHaveBeenCalledWith("/api/cpsh/members/get-member/event123");
  });
});
