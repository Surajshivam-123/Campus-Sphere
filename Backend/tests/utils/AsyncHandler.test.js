import { describe, it, expect, vi } from "vitest";
import asyncHandler from "../../src/utils/AsyncHandler.js";

describe("AsyncHandler Utility", () => {
  it("should execute the wrapped async function when successful", async () => {
    const fn = vi.fn().mockResolvedValue("done");
    const wrapped = asyncHandler(fn);

    const req = {};
    const res = {};
    const next = vi.fn();

    await wrapped(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it("should catch rejected promise and pass error to next()", async () => {
    const error = new Error("Something went wrong");
    const fn = vi.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(fn);

    const req = {};
    const res = {};
    const next = vi.fn();

    await wrapped(req, res, next);

    // Promise catches async error and forwards to next
    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
