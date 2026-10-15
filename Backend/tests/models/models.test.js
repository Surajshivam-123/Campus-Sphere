import { describe, it, expect, vi } from "vitest";
import { User } from "../../src/models/user.model.js";
import { Event } from "../../src/models/event.model.js";
import { Participant } from "../../src/models/participant.model.js";
import { Member } from "../../src/models/members.model.js";
import { Team } from "../../src/models/team.model.js";
import { Club } from "../../src/models/club.model.js";
import { Schedule } from "../../src/models/schedule.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("Backend Models", () => {
  describe("User Model", () => {
    it("should generate valid access token with user details", () => {
      const user = new User({
        fullname: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        avatar: "https://avatar.url/pic.jpg",
      });

      const token = user.generateAccessToken();
      expect(typeof token).toBe("string");

      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || "test_access_token_secret_which_is_long_enough_123456"
      );
      expect(decoded.username).toBe("johndoe");
      expect(decoded.email).toBe("john@example.com");
      expect(decoded.fullname).toBe("John Doe");
      expect(decoded.avatar).toBe("https://avatar.url/pic.jpg");
    });

    it("should generate valid refresh token with user id", () => {
      const user = new User({
        fullname: "Jane Doe",
        username: "janedoe",
        email: "jane@example.com",
      });

      const token = user.generateRefreshToken();
      expect(typeof token).toBe("string");

      const decoded = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET || "test_refresh_token_secret_which_is_long_enough_123456"
      );
      expect(decoded._id).toBe(user._id.toString());
    });

    it("should verify correct password using isPasswordCorrect", async () => {
      const plainPassword = "SecurePassword123!";
      const hashedPassword = await bcrypt.hash(plainPassword, 8);

      const user = new User({
        fullname: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
      });

      const isCorrect = await user.isPasswordCorrect(plainPassword);
      const isWrong = await user.isPasswordCorrect("WrongPassword123!");

      expect(isCorrect).toBe(true);
      expect(isWrong).toBe(false);
    });

    it("should return false if password is not set (e.g. Google auth user)", async () => {
      const user = new User({
        fullname: "Google User",
        username: "googleuser",
        email: "google@example.com",
        googleId: "google_12345",
      });

      const isCorrect = await user.isPasswordCorrect("any_password");
      expect(isCorrect).toBe(false);
    });
  });

  describe("Event Model Validation", () => {
    it("should validate required fields for Event", () => {
      const event = new Event({});
      const error = event.validateSync();

      expect(error.errors.eventName).toBeDefined();
      expect(error.errors.organization).toBeDefined();
      expect(error.errors.mode).toBeDefined();
      expect(error.errors.description).toBeDefined();
      expect(error.errors.category).toBeDefined();
      expect(error.errors.startDate).toBeDefined();
      expect(error.errors.poster).toBeDefined();
      expect(error.errors.memberCode).toBeDefined();
      expect(error.errors.participantCode).toBeDefined();
    });

    it("should set default values for maxParticipants and rules", () => {
      const event = new Event({
        eventName: "Hackathon",
        organization: "Tech Club",
        mode: "Online",
        description: "Annual hackathon",
        category: "coding",
        startDate: new Date(),
        poster: "http://image.url",
        memberCode: "mem12",
        participantCode: "par12",
      });

      expect(event.rules).toEqual([]);
      expect(event.maxParticipants).toBe(0);
      expect(event.scorerUpdater).toBeNull();
    });
  });

  describe("Participant Model Validation", () => {
    it("should require identityNumber", () => {
      const participant = new Participant({});
      const error = participant.validateSync();
      expect(error.errors.identityNumber).toBeDefined();
    });
  });

  describe("Team Model Validation", () => {
    it("should require name and teamCode", () => {
      const team = new Team({});
      const error = team.validateSync();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.teamCode).toBeDefined();
    });
  });

  describe("Club Model Validation", () => {
    it("should validate required fields and default category", () => {
      const club = new Club({});
      const error = club.validateSync();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.college).toBeDefined();
      expect(error.errors.founder).toBeDefined();
      expect(error.errors.clubCode).toBeDefined();
      expect(club.category).toBe("other");
      expect(club.isPublic).toBe(true);
    });
  });

  describe("Schedule Model Validation", () => {
    it("should validate required event and method enum", () => {
      const schedule = new Schedule({ method: "InvalidMethod" });
      const error = schedule.validateSync();
      expect(error.errors.event).toBeDefined();
      expect(error.errors.method).toBeDefined();
    });

    it("should accept valid method 'AI' or 'Manual'", () => {
      const scheduleAI = new Schedule({
        event: "507f191e810c19729de860ea",
        method: "AI",
        matches: [{ team1: "Team A", team2: "Team B" }],
      });
      const error = scheduleAI.validateSync();
      expect(error).toBeUndefined();
    });
  });
});
