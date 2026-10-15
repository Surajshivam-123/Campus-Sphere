import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  submitJoinRequest,
  respondToRequest,
  getPendingRequests,
} from "../../src/services/joinRequest.service.js";
import { JoinRequest } from "../../src/models/joinRequest.model.js";
import { Member } from "../../src/models/members.model.js";
import { Cricket_Player } from "../../src/sports/cricket/models/player.model.js";
import { ClubMember } from "../../src/models/clubMember.model.js";
import * as socketModule from "../../src/socket.js";
import * as redisModule from "../../src/utils/redis.js";

vi.mock("../../src/models/joinRequest.model.js");
vi.mock("../../src/models/members.model.js");
vi.mock("../../src/sports/cricket/models/player.model.js");
vi.mock("../../src/models/clubMember.model.js");
vi.mock("../../src/models/user.model.js");
vi.mock("../../src/models/event.model.js");
vi.mock("../../src/utils/redis.js", () => ({
  cacheDel: vi.fn().mockResolvedValue(true),
}));
vi.mock("../../src/socket.js", () => ({
  getIO: vi.fn().mockReturnValue({
    to: vi.fn().mockReturnValue({
      emit: vi.fn(),
    }),
  }),
}));

describe("JoinRequestService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitJoinRequest", () => {
    it("should return conflict if request is already pending", async () => {
      JoinRequest.findOne.mockResolvedValue({
        status: "pending",
      });

      const result = await submitJoinRequest("member", {
        eventId: "event1",
        requesterId: "req1",
        requesterName: "John",
      });

      expect(result).toEqual({ conflict: true, status: "pending" });
    });

    it("should create new join request if not already pending", async () => {
      JoinRequest.findOne.mockResolvedValue(null);
      JoinRequest.deleteMany.mockResolvedValue({});
      JoinRequest.create.mockResolvedValue({
        _id: "joinReq1",
        type: "member",
        event: "event1",
        requester: "req1",
      });

      const result = await submitJoinRequest("member", {
        eventId: "event1",
        requesterId: "req1",
        requesterName: "John",
        organizerId: "org1",
        eventName: "Annual Meet",
      });

      expect(result.joinReq).toBeDefined();
      expect(result.joinReq._id).toBe("joinReq1");
    });
  });

  describe("respondToRequest", () => {
    it("should return notFound if request does not exist", async () => {
      JoinRequest.findById.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockReturnValue({
            populate: vi.fn().mockResolvedValue(null),
          }),
        }),
      });

      const result = await respondToRequest("invalidId", "approve", "org1");
      expect(result).toEqual({ notFound: true });
    });

    it("should return alreadyHandled if status is not pending", async () => {
      JoinRequest.findById.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockReturnValue({
            populate: vi.fn().mockResolvedValue({
              _id: "req1",
              status: "approved",
            }),
          }),
        }),
      });

      const result = await respondToRequest("req1", "approve", "org1");
      expect(result).toEqual({ alreadyHandled: true, status: "approved" });
    });

    it("should return forbidden if responder is not authorized", async () => {
      JoinRequest.findById.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockReturnValue({
            populate: vi.fn().mockResolvedValue({
              _id: "req1",
              type: "member",
              status: "pending",
              event: { organizer: "otherOrganizer" },
            }),
          }),
        }),
      });

      const result = await respondToRequest("req1", "approve", "unauthorizedUser");
      expect(result).toEqual({ forbidden: true });
    });
  });

  describe("getPendingRequests", () => {
    it("should query pending requests with appropriate filters and return lean list", async () => {
      const mockList = [{ _id: "req1", requester: { fullname: "Bob" } }];
      JoinRequest.find.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue(mockList),
          }),
        }),
      });

      const result = await getPendingRequests("member", { eventId: "event1" });

      expect(JoinRequest.find).toHaveBeenCalledWith({
        type: "member",
        event: "event1",
        status: "pending",
      });
      expect(result).toEqual(mockList);
    });
  });
});
