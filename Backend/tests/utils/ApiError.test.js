import { describe, it, expect } from "vitest";
import ApiError from "../../src/utils/ApiError.js";

describe("ApiError Utility", () => {
  it("should create an ApiError instance with default values", () => {
    const error = new ApiError(400);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Something went wrong");
    expect(error.data).toBeNull();
    expect(error.success).toBe(false);
    expect(error.error).toEqual([]);
    expect(error.stack).toBeDefined();
  });

  it("should create an ApiError with custom message, errors array, and status code", () => {
    const customErrors = [{ field: "email", message: "Email is required" }];
    const error = new ApiError(422, "Validation failed", customErrors);

    expect(error.statusCode).toBe(422);
    expect(error.message).toBe("Validation failed");
    expect(error.error).toEqual(customErrors);
    expect(error.success).toBe(false);
  });

  it("should use provided stack trace if supplied", () => {
    const customStack = "Custom stack trace string";
    const error = new ApiError(500, "Server error", [], customStack);

    expect(error.stack).toBe(customStack);
  });
});
