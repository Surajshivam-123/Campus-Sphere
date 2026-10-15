import { describe, it, expect, vi, beforeEach } from "vitest";
import eventService from "../../src/services/event.service.js";
import { Event } from "../../src/models/event.model.js";
import { Member } from "../../src/models/members.model.js";
import ApiError from "../../src/utils/ApiError.js";
import * as redisUtils from "../../src/utils/redis.js";

vi.mock("../../src/models/event.model.js");
vi.mock("../../src/models/members.model.js");
vi.mock("../../src/models/participant.model.js");
vi.mock("../../src/models/eventMessage.model.js");
vi.mock("../../src/utils/redis.js", () => ({
  cacheGet: vi.fn(),
  cacheSet: vi.fn(),
  cacheDel: vi.fn(),
}));

describe("EventService (Backend)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createEvent", () => {
    it("should throw error if required fields are missing", async () => {
      await expect(
        eventService.createEvent({}, { _id: "user1", fullname: "John" })
      ).rejects.toThrow(ApiError);
    });

    it("should create event and add organizer to Member collection", async () => {
      const mockEventData = {
        eventName: "HackFest",
        organization: "CS Dept",
        startDate: "2026-11-20",
        description: "Coding contest",
        mode: "Online",
        category: "coding",
        maxParticipants: 100,
        posterUrl: "https://poster.url/img.png",
      };

      Event.findOne.mockResolvedValue(null);
      Event.create.mockResolvedValue({
        _id: "evt123",
        ...mockEventData,
        memberCode: "code1",
        participantCode: "code2",
      });
      Member.create.mockResolvedValue({});

      const result = await eventService.createEvent(
        mockEventData,
        { _id: "user1", fullname: "John Doe" }
      );

      expect(Event.create).toHaveBeenCalled();
      expect(Member.create).toHaveBeenCalledWith(
        expect.objectContaining({
          owner: "user1",
          role: "organizer",
          event: "evt123",
        })
      );
      expect(redisUtils.cacheDel).toHaveBeenCalled();
      expect(result._id).toBe("evt123");
    });
  });

  describe("getEventById", () => {
    it("should return cached event if present", async () => {
      const cached = { _id: "evt1", eventName: "Cached Fest" };
      redisUtils.cacheGet.mockResolvedValue(cached);

      const result = await eventService.getEventById("evt1");

      expect(result).toEqual(cached);
      expect(Event.findById).not.toHaveBeenCalled();
    });

    it("should query database and set cache if not cached", async () => {
      const dbEvent = { _id: "evt1", eventName: "DB Fest" };
      redisUtils.cacheGet.mockResolvedValue(null);
      Event.findById.mockResolvedValue(dbEvent);

      const result = await eventService.getEventById("evt1");

      expect(Event.findById).toHaveBeenCalledWith("evt1");
      expect(redisUtils.cacheSet).toHaveBeenCalled();
      expect(result).toEqual(dbEvent);
    });

    it("should throw 404 ApiError if event does not exist", async () => {
      redisUtils.cacheGet.mockResolvedValue(null);
      Event.findById.mockResolvedValue(null);

      await expect(eventService.getEventById("missing")).rejects.toThrow("Event not found");
    });
  });

  describe("deleteEvent", () => {
    it("should throw 403 if user is not organizer", async () => {
      Event.findById.mockResolvedValue({
        _id: "evt1",
        organizer: "differentUser",
      });

      await expect(
        eventService.deleteEvent("evt1", "requestingUser")
      ).rejects.toThrow("Only the event organizer can perform this action");
    });

    it("should delete event and bust cache when user is organizer", async () => {
      Event.findById.mockResolvedValue({
        _id: "evt1",
        organizer: "user1",
      });
      Event.findByIdAndDelete.mockResolvedValue(true);

      await eventService.deleteEvent("evt1", "user1");

      expect(Event.findByIdAndDelete).toHaveBeenCalledWith("evt1");
      expect(redisUtils.cacheDel).toHaveBeenCalled();
    });
  });
});
