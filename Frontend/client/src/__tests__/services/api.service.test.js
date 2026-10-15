import { describe, it, expect, vi, beforeEach } from "vitest";
import apiClient, { setForceLogoutHandler } from "../../services/api.service.js";
import axios from "axios";

vi.mock("axios", async () => {
  const actual = await vi.importActual("axios");
  const mockAxiosInstance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn().mockReturnValue(mockAxiosInstance),
      post: vi.fn(),
    },
  };
});

describe("Frontend ApiService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should be defined and export setForceLogoutHandler", () => {
    expect(apiClient).toBeDefined();
    expect(typeof setForceLogoutHandler).toBe("function");
  });

  it("should allow setting a custom force logout handler", () => {
    const customLogout = vi.fn();
    setForceLogoutHandler(customLogout);
    // Setting handler should not throw
    expect(true).toBe(true);
  });
});
