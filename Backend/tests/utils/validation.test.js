import { describe, it, expect } from "vitest";
import { validatePassword } from "../../src/utils/validation.js";

describe("Backend Password Validation Utility (SRP)", () => {
  it("should fail passwords shorter than 8 characters", () => {
    const res = validatePassword("Short1!");
    expect(res.isValid).toBe(false);
    expect(res.message).toContain("at least 8 characters");
  });

  it("should require uppercase letter", () => {
    const res = validatePassword("lowercase123!");
    expect(res.isValid).toBe(false);
    expect(res.message).toContain("uppercase letter");
  });

  it("should require lowercase letter", () => {
    const res = validatePassword("UPPERCASE123!");
    expect(res.isValid).toBe(false);
    expect(res.message).toContain("lowercase letter");
  });

  it("should require at least one number", () => {
    const res = validatePassword("NoNumberHere!");
    expect(res.isValid).toBe(false);
    expect(res.message).toContain("at least one number");
  });

  it("should require at least one special character", () => {
    const res = validatePassword("NoSpecialChar123");
    expect(res.isValid).toBe(false);
    expect(res.message).toContain("special character");
  });

  it("should pass strong password", () => {
    const res = validatePassword("StrongP@ssw0rd");
    expect(res.isValid).toBe(true);
  });
});
