import { describe, it, expect } from "vitest";
import {
  required,
  email,
  minLength,
  maxLength,
  passwordMatch,
  numberRange,
  positiveNumber,
  futureDate,
  compose,
  validateEventForm,
  validateLoginForm,
  validateRegisterForm,
} from "../../utils/validation.js";

describe("Frontend Validation Utils", () => {
  describe("required", () => {
    it("should return error message when value is empty, null, or undefined", () => {
      expect(required("")).toBe("This field is required");
      expect(required("   ")).toBe("This field is required");
      expect(required(null, "Username")).toBe("Username is required");
      expect(required(undefined)).toBe("This field is required");
    });

    it("should return null when value is provided", () => {
      expect(required("hello")).toBeNull();
      expect(required(123)).toBeNull();
    });
  });

  describe("email", () => {
    it("should return null for empty values (handled by required)", () => {
      expect(email("")).toBeNull();
      expect(email(null)).toBeNull();
    });

    it("should validate proper email format", () => {
      expect(email("invalid-email")).toBe("Please enter a valid email address");
      expect(email("test@")).toBe("Please enter a valid email address");
      expect(email("@domain.com")).toBe("Please enter a valid email address");
      expect(email("test@domain.com")).toBeNull();
    });
  });

  describe("minLength and maxLength", () => {
    it("should validate minLength", () => {
      expect(minLength("ab", 3, "Name")).toBe("Name must be at least 3 characters");
      expect(minLength("abc", 3, "Name")).toBeNull();
      expect(minLength("", 3)).toBeNull();
    });

    it("should validate maxLength", () => {
      expect(maxLength("abcdef", 5, "Code")).toBe("Code must be no more than 5 characters");
      expect(maxLength("abc", 5, "Code")).toBeNull();
      expect(maxLength("", 5)).toBeNull();
    });
  });

  describe("passwordMatch", () => {
    it("should validate matching passwords", () => {
      expect(passwordMatch("Pass123", "Pass456")).toBe("Passwords do not match");
      expect(passwordMatch("Pass123", "Pass123")).toBeNull();
    });
  });

  describe("numberRange and positiveNumber", () => {
    it("should validate numberRange", () => {
      expect(numberRange("abc", 1, 10, "Score")).toBe("Score must be a number");
      expect(numberRange(0, 1, 10, "Score")).toBe("Score must be between 1 and 10");
      expect(numberRange(15, 1, 10, "Score")).toBe("Score must be between 1 and 10");
      expect(numberRange(5, 1, 10, "Score")).toBeNull();
    });

    it("should validate positiveNumber", () => {
      expect(positiveNumber("abc", "Count")).toBe("Count must be a positive number");
      expect(positiveNumber(-5, "Count")).toBe("Count must be a positive number");
      expect(positiveNumber(0, "Count")).toBe("Count must be a positive number");
      expect(positiveNumber(10, "Count")).toBeNull();
    });
  });

  describe("futureDate", () => {
    it("should return null if value is empty", () => {
      expect(futureDate("")).toBeNull();
    });

    it("should validate date is in the future", () => {
      const pastDate = new Date(Date.now() - 1000000).toISOString();
      const futureDateVal = new Date(Date.now() + 100000000).toISOString();

      expect(futureDate(pastDate, "Event date")).toBe("Event date must be in the future");
      expect(futureDate(futureDateVal, "Event date")).toBeNull();
    });
  });

  describe("compose", () => {
    it("should return the first failing validator message", () => {
      const validator = compose(
        (v) => required(v, "Field"),
        (v) => minLength(v, 5, "Field")
      );

      expect(validator("")).toBe("Field is required");
      expect(validator("abc")).toBe("Field must be at least 5 characters");
      expect(validator("abcdef")).toBeNull();
    });
  });

  describe("Form Validators", () => {
    it("validateLoginForm should validate usermail and password", () => {
      const emptyErrors = validateLoginForm({});
      expect(emptyErrors.usermail).toBe("Email or username is required");
      expect(emptyErrors.password).toBe("Password is required");

      const validErrors = validateLoginForm({ usermail: "john", password: "secretPassword" });
      expect(Object.keys(validErrors).length).toBe(0);
    });

    it("validateRegisterForm should validate registration fields", () => {
      const invalid = validateRegisterForm({
        fullname: "J",
        username: "ab",
        email: "bademail",
        password: "123",
        confirmPassword: "456",
      });

      expect(invalid.fullname).toBe("Full name must be at least 2 characters");
      expect(invalid.username).toBe("Username must be at least 3 characters");
      expect(invalid.email).toBe("Please enter a valid email address");
      expect(invalid.password).toBe("Password must be at least 6 characters");
      expect(invalid.confirmPassword).toBe("Passwords do not match");

      const valid = validateRegisterForm({
        fullname: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        password: "securepassword",
        confirmPassword: "securepassword",
      });

      expect(Object.keys(valid).length).toBe(0);
    });

    it("validateEventForm should validate event fields", () => {
      const empty = validateEventForm({});
      expect(empty.eventName).toBe("Event name is required");
      expect(empty.organization).toBe("Organization is required");
      expect(empty.description).toBe("Description is required");
      expect(empty.startDate).toBe("Start date is required");
      expect(empty.eventLocation).toBe("Location is required");
      expect(empty.mode).toBe("Mode is required");
      expect(empty.category).toBe("Category is required");
      expect(empty.maxParticipants).toBe("Max participants is required");

      const valid = validateEventForm({
        eventName: "Annual Hackathon",
        organization: "Tech Society",
        description: "Join us for 24 hours of coding and innovation.",
        startDate: new Date(Date.now() + 86400000).toISOString(),
        eventLocation: "Campus Hall A",
        mode: "Offline",
        category: "coding",
        maxParticipants: 100,
      });

      expect(Object.keys(valid).length).toBe(0);
    });
  });
});
