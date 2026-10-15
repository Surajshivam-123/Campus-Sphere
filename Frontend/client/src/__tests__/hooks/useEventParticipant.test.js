import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useEventParticipant } from "../../hooks/useEventParticipant.js";
import fetchWithAuth from "../../config/fetchWithAuth.js";

vi.mock("../../config/fetchWithAuth.js", () => ({
  default: vi.fn(),
}));

describe("useEventParticipant Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should stop loading and return null if no eventId is provided", () => {
    const { result } = renderHook(() => useEventParticipant(null));
    expect(result.current.loading).toBe(false);
    expect(result.current.participant).toBeNull();
  });

  it("should fetch participant data successfully", async () => {
    const mockParticipant = { _id: "part1", identityNumber: "ID-123" };
    fetchWithAuth.mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        data: [mockParticipant],
      }),
    });

    const { result } = renderHook(() => useEventParticipant("event123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.participant).toEqual(mockParticipant);
    expect(result.current.error).toBeNull();
  });

  it("should handle error when participant data is not found or API fails", async () => {
    fetchWithAuth.mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        data: [],
      }),
    });

    const { result } = renderHook(() => useEventParticipant("event123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.participant).toBeNull();
    expect(result.current.error).toBe("No participant data found");
  });
});
