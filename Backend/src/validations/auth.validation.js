import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    fullname: z
      .string()
      .trim()
      .min(1, "Full name is required"),

    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters"),

    email: z
      .string()
      .trim()
      .email("Invalid email address"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    usermail: z
      .string()
      .trim()
      .min(1, "Email or username is required"),

    password: z
      .string()
      .min(1, "Password is required"),
  }),
});