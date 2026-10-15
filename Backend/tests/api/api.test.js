import { describe, it, expect, vi, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { Event } from "../../src/models/event.model.js";

describe("Backend API Integration Tests", () => {
  describe("Health & Metrics Endpoints", () => {
    it("GET /health should return 200 and OK status", async () => {
      const res = await request(app).get("/health");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "OK",
        message: "Server is running good.",
      });
    });

    it("GET /metrics should return 200 and Prometheus metrics", async () => {
      const res = await request(app).get("/metrics");

      expect(res.status).toBe(200);
      expect(res.text).toContain("campussphere_");
    });

    it("GET /nonexistent-route should return 404 with standard ApiError json", async () => {
      const res = await request(app).get("/nonexistent-route");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("not found");
    });
  });

  describe("User Authentication Endpoints", () => {
    it("POST /api/cpsh/users/register should fail validation if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/cpsh/users/register")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("POST /api/cpsh/users/login should fail if usermail or password is missing", async () => {
      const res = await request(app)
        .post("/api/cpsh/users/login")
        .send({ usermail: "test@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("required");
    });

    it("POST /api/cpsh/users/refresh-token should return 401 if no refresh token is provided", async () => {
      const res = await request(app)
        .post("/api/cpsh/users/refresh-token")
        .send({});

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("GET /api/cpsh/users/profile should return 401 if not authenticated", async () => {
      const res = await request(app).get("/api/cpsh/users/profile");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("POST /api/cpsh/users/send-otp should fail if email is missing", async () => {
      const res = await request(app)
        .post("/api/cpsh/users/send-otp")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("POST /api/cpsh/users/verify-otp should fail if email or otp is missing", async () => {
      const res = await request(app)
        .post("/api/cpsh/users/verify-otp")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Event Endpoints", () => {
    it("GET /api/cpsh/events/get-all-events should require authentication", async () => {
      const res = await request(app).get("/api/cpsh/events/get-all-events");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("POST /api/cpsh/events/create should require authentication", async () => {
      const res = await request(app)
        .post("/api/cpsh/events/create")
        .send({ eventName: "New Event" });

      expect(res.status).toBe(401);
    });

    it("GET /api/cpsh/events/public should return 200 with list of events", async () => {
      vi.spyOn(Event, "find").mockReturnValue({
        select: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([
              { _id: "evt1", eventName: "Public Event 1", category: "sports" },
            ]),
          }),
        }),
      });

      const res = await request(app).get("/api/cpsh/events/public");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("Protected Resource Endpoints Authorization", () => {
    it("GET /api/cpsh/participants/my-events should require authentication", async () => {
      const res = await request(app).get("/api/cpsh/participants/my-events");
      expect(res.status).toBe(401);
    });

    it("GET /api/cpsh/members/get-all-events should require authentication", async () => {
      const res = await request(app).get("/api/cpsh/members/get-all-events");
      expect(res.status).toBe(401);
    });

    it("POST /api/cpsh/clubs/create should require authentication", async () => {
      const res = await request(app).post("/api/cpsh/clubs/create").send({ name: "Club 1" });
      expect(res.status).toBe(401);
    });
  });
});
