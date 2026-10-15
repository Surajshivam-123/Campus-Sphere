import { describe, it, expect } from "vitest";
import {
  EVENT_TYPES,
  API_ENDPOINTS,
  ROUTES,
  STORAGE_KEYS,
  VALIDATION,
} from "../../utils/constants.js";

describe("Frontend Constants", () => {
  it("should have correct EVENT_TYPES", () => {
    expect(EVENT_TYPES.CRICKET).toBe("cricket");
    expect(EVENT_TYPES.CULTURAL).toBe("cultural");
    expect(EVENT_TYPES.WORKSHOP).toBe("workshop");
    expect(EVENT_TYPES.SPORTS).toBe("sports");
  });

  it("should have correct API_ENDPOINTS", () => {
    expect(API_ENDPOINTS.USERS).toBe("/api/cpsh/users");
    expect(API_ENDPOINTS.EVENTS).toBe("/api/cpsh/events");
    expect(API_ENDPOINTS.PARTICIPANTS).toBe("/api/cpsh/participants");
    expect(API_ENDPOINTS.MEMBERS).toBe("/api/cpsh/members");
    expect(API_ENDPOINTS.TEAMS).toBe("/api/cpsh/teams");
  });

  it("should have correct ROUTES", () => {
    expect(ROUTES.HOME).toBe("/");
    expect(ROUTES.LOGIN).toBe("/login");
    expect(ROUTES.REGISTER).toBe("/register");
    expect(ROUTES.PROFILE).toBe("/profile");
    expect(ROUTES.CREATE_EVENT).toBe("/create-event");
  });

  it("should have correct STORAGE_KEYS", () => {
    expect(STORAGE_KEYS.ACCESS_TOKEN).toBe("accessToken");
    expect(STORAGE_KEYS.USER).toBe("user");
  });

  it("should have correct VALIDATION limits", () => {
    expect(VALIDATION.MIN_PASSWORD_LENGTH).toBe(8);
    expect(VALIDATION.MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
    expect(VALIDATION.ALLOWED_IMAGE_TYPES).toContain("image/jpeg");
    expect(VALIDATION.ALLOWED_IMAGE_TYPES).toContain("image/png");
  });
});
