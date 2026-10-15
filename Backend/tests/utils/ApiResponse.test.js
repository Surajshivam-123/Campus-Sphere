import { describe, it, expect } from "vitest";
import ApiResponse from "../../src/utils/ApiResponse.js";

describe("ApiResponse Utility", () => {
  it("should create an ApiResponse instance with default message", () => {
    const data = { user: "john_doe" };
    const response = new ApiResponse(200, data);

    expect(response.statusCode).toBe(200);
    expect(response.data).toEqual(data);
    expect(response.message).toBe("Success");
    expect(response.success).toBe(true);
  });

  it("should mark success as true when statusCode < 400", () => {
    const response201 = new ApiResponse(201, { id: 1 }, "Created");
    expect(response201.success).toBe(true);
    expect(response201.statusCode).toBe(201);
    expect(response201.message).toBe("Created");
  });

  it("should mark success as false when statusCode >= 400", () => {
    const response400 = new ApiResponse(400, null, "Bad Request");
    expect(response400.success).toBe(false);

    const response500 = new ApiResponse(500, null, "Internal Server Error");
    expect(response500.success).toBe(false);
  });
});
