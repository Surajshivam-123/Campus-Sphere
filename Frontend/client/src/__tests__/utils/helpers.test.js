import { describe, it, expect, vi } from "vitest";
import {
  formatDate,
  formatDateTime,
  truncateText,
  isValidEmail,
  isStrongPassword,
  formatFileSize,
  debounce,
  deepClone,
  isEmpty,
  capitalize,
  generateId,
} from "../../utils/helpers.js";

describe("Frontend Helper Utils", () => {
  describe("formatDate and formatDateTime", () => {
    it("should return empty string if no date is provided", () => {
      expect(formatDate(null)).toBe("");
      expect(formatDate(undefined)).toBe("");
      expect(formatDateTime(null)).toBe("");
    });

    it("should format valid dates to readable string", () => {
      const date = "2026-10-15T00:00:00Z";
      expect(formatDate(date)).toContain("October");
      expect(formatDate(date)).toContain("2026");
      expect(formatDateTime(date)).toContain("2026");
    });
  });

  describe("truncateText", () => {
    it("should return original text if within maxLength", () => {
      expect(truncateText("Short text", 20)).toBe("Short text");
      expect(truncateText("", 10)).toBe("");
    });

    it("should truncate text and append ellipsis if exceeding maxLength", () => {
      const longText = "This is a very long string that should be truncated";
      const result = truncateText(longText, 10);
      expect(result).toBe("This is a ...");
    });
  });

  describe("isValidEmail", () => {
    it("should validate valid and invalid email addresses", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("not-an-email")).toBe(false);
      expect(isValidEmail("user@.com")).toBe(false);
    });
  });

  describe("isStrongPassword", () => {
    it("should require at least 8 chars, 1 uppercase, 1 lowercase, and 1 number", () => {
      expect(isStrongPassword("Weak1")).toBe(false);
      expect(isStrongPassword("alllowercase1")).toBe(false);
      expect(isStrongPassword("ALLUPPERCASE1")).toBe(false);
      expect(isStrongPassword("NoNumbersHere!")).toBe(false);
      expect(isStrongPassword("StrongPassword123")).toBe(true);
    });
  });

  describe("formatFileSize", () => {
    it("should format file sizes with appropriate units", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1024 * 1024)).toBe("1 MB");
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
    });
  });

  describe("debounce", () => {
    it("should debounce function calls", () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 200);

      debouncedFn("a");
      debouncedFn("b");
      debouncedFn("c");

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(200);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith("c");

      vi.useRealTimers();
    });
  });

  describe("deepClone", () => {
    it("should create an independent deep copy of an object", () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      cloned.b.c = 99;
      expect(original.b.c).toBe(2);
    });
  });

  describe("isEmpty", () => {
    it("should check if an object is empty", () => {
      expect(isEmpty({})).toBe(true);
      expect(isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe("capitalize", () => {
    it("should capitalize the first letter and lowercase the rest", () => {
      expect(capitalize("")).toBe("");
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("wORLD")).toBe("World");
    });
  });

  describe("generateId", () => {
    it("should generate random string id", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(typeof id1).toBe("string");
      expect(id1.length).toBeGreaterThan(0);
      expect(id1).not.toBe(id2);
    });
  });
});
