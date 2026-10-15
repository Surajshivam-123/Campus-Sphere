import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyEventAccess, verifyEventOrganizer } from "../../src/middlewares/eventAccess.middleware.js";
import { Event } from "../../src/models/event.model.js";
import { Member } from "../../src/models/members.model.js";
import { Participant } from "../../src/models/participant.model.js";
import { Team } from "../../src/models/team.model.js";
import { Cricket_Player } from "../../src/sports/cricket/models/player.model.js";
import { Submission } from "../../src/sports/coding/models/submission.model.js";

vi.mock("../../src/models/event.model.js", () => ({
  Event: { findById: vi.fn() },
}));
vi.mock("../../src/models/members.model.js", () => ({
  Member: { exists: vi.fn() },
}));
vi.mock("../../src/models/participant.model.js", () => ({
  Participant: { exists: vi.fn() },
}));
vi.mock("../../src/models/team.model.js", () => ({
  Team: { find: vi.fn() },
}));
vi.mock("../../src/sports/cricket/models/player.model.js", () => ({
  Cricket_Player: { exists: vi.fn() },
}));
vi.mock("../../src/sports/coding/models/submission.model.js", () => ({
  Submission: { exists: vi.fn() },
}));

describe("Event Access Middleware", () => {
  const userId = "user123";
  const eventId = "event123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("verifyEventOrganizer", () => {
    it("should return 400 if no eventId can be resolved", async () => {
      const req = { params: {}, user: { _id: userId } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      await verifyEventOrganizer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 if event does not exist", async () => {
      const req = { params: { eventId }, user: { _id: userId } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      Event.findById.mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(null),
        }),
      });

      await verifyEventOrganizer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 if user is not the organizer", async () => {
      const req = { params: { eventId }, user: { _id: userId } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      Event.findById.mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({ organizer: "differentUser" }),
        }),
      });

      await verifyEventOrganizer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next() if user is the organizer", async () => {
      const req = { params: { eventId }, user: { _id: userId } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      Event.findById.mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({ organizer: userId }),
        }),
      });

      await verifyEventOrganizer(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("verifyEventAccess", () => {
    it("should grant access if user is organizer", async () => {
      const req = { params: { eventId }, user: { _id: userId } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      Event.findById.mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({ organizer: userId, scorerUpdater: null }),
        }),
      });

      await verifyEventAccess(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should grant access if user is member", async () => {
      const req = { params: { eventId }, user: { _id: userId } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      Event.findById.mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({ organizer: "otherOrganizer", scorerUpdater: null }),
        }),
      });
      Member.exists.mockResolvedValue(true);

      await verifyEventAccess(req, res, next);

      expect(Member.exists).toHaveBeenCalledWith({ owner: userId, event: eventId });
      expect(next).toHaveBeenCalled();
    });

    it("should grant access if user is participant", async () => {
      const req = { params: { eventId }, user: { _id: userId } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      Event.findById.mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({ organizer: "otherOrganizer", scorerUpdater: null }),
        }),
      });
      Member.exists.mockResolvedValue(false);
      Participant.exists.mockResolvedValue(true);

      await verifyEventAccess(req, res, next);

      expect(Participant.exists).toHaveBeenCalledWith({ owner: userId, event: eventId });
      expect(next).toHaveBeenCalled();
    });

    it("should return 403 if user has no role in event", async () => {
      const req = { params: { eventId }, user: { _id: userId } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      Event.findById.mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({ organizer: "otherOrganizer", scorerUpdater: null }),
        }),
      });
      Member.exists.mockResolvedValue(false);
      Participant.exists.mockResolvedValue(false);
      Team.find.mockReturnValue({
        distinct: vi.fn().mockResolvedValue([]),
      });
      Cricket_Player.exists.mockResolvedValue(false);
      Submission.exists.mockResolvedValue(false);

      await verifyEventAccess(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
