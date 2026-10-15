import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useFetch, useLazyFetch, useMutation } from "../../hooks/useFetch.js";
import apiClient from "../../services/api.service.js";

vi.mock("../../services/api.service.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("useFetch, useLazyFetch, useMutation Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useFetch", () => {
    it("should fetch data on mount and set state", async () => {
      const mockData = [{ id: 1, name: "Event 1" }];
      apiClient.get.mockResolvedValue({ success: true, data: mockData });

      const { result } = renderHook(() => useFetch("/api/events"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it("should handle API error gracefully", async () => {
      apiClient.get.mockResolvedValue({ success: false, message: "Fetch failed" });

      const { result } = renderHook(() => useFetch("/api/events"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe("Fetch failed");
    });
  });

  describe("useLazyFetch", () => {
    it("should not fetch until fetchData is triggered", async () => {
      apiClient.get.mockResolvedValue({ success: true, data: { status: "ok" } });

      const { result } = renderHook(() => useLazyFetch());

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();

      await act(async () => {
        await result.current.fetchData("/api/test");
      });

      expect(result.current.data).toEqual({ status: "ok" });
      expect(result.current.loading).toBe(false);
    });
  });

  describe("useMutation", () => {
    it("should perform mutation with requested HTTP method", async () => {
      apiClient.post.mockResolvedValue({ success: true, data: { created: true } });

      const { result } = renderHook(() => useMutation());

      let res;
      await act(async () => {
        res = await result.current.mutate("/api/items", "POST", { name: "item" });
      });

      expect(apiClient.post).toHaveBeenCalledWith("/api/items", { name: "item" }, {});
      expect(res).toEqual({ created: true });
      expect(result.current.data).toEqual({ created: true });
    });
  });
});
