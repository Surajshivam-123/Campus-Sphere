import { describe, it, expect, vi } from "vitest";
import { validate } from "../../src/middlewares/validate.middleware.js";
import ApiError from "../../src/utils/ApiError.js";

describe("Validate Middleware", () => {
  it("should pass validation and update req data when schema resolves", async () => {
    const mockSchema = {
      parseAsync: vi.fn().mockResolvedValue({
        body: { username: "validUser" },
        query: {},
        params: { id: "123" },
      }),
    };

    const middleware = validate(mockSchema);
    const req = { body: { username: "validUser" }, query: {}, params: { id: "123" } };
    const res = {};
    const next = vi.fn();

    await middleware(req, res, next);

    expect(mockSchema.parseAsync).toHaveBeenCalled();
    expect(req.body.username).toBe("validUser");
    expect(next).toHaveBeenCalledWith();
  });

  it("should catch validation errors and forward ApiError(400) to next()", async () => {
    const mockSchema = {
      parseAsync: vi.fn().mockRejectedValue({
        errors: [
          { path: ["body", "email"], message: "Invalid email format" },
        ],
      }),
    };

    const middleware = validate(mockSchema);
    const req = { body: { email: "bad-email" }, query: {}, params: {} };
    const res = {};
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Validation failed");
    expect(error.error).toEqual([
      { field: "body.email", message: "Invalid email format" },
    ]);
  });
});
