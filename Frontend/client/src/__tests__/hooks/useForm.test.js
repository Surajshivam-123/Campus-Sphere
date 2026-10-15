import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useForm } from "../../hooks/useForm.js";

describe("useForm Hook", () => {
  it("should initialize with provided initialValues", () => {
    const { result } = renderHook(() =>
      useForm({ username: "john", email: "" }, vi.fn())
    );

    expect(result.current.values).toEqual({ username: "john", email: "" });
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should update form values on handleChange", () => {
    const { result } = renderHook(() =>
      useForm({ username: "" }, vi.fn())
    );

    act(() => {
      result.current.handleChange({
        target: { name: "username", value: "alice", type: "text" },
      });
    });

    expect(result.current.values.username).toBe("alice");
  });

  it("should update touched and validate on handleBlur", () => {
    const validate = vi.fn().mockReturnValue({ username: "Username is required" });
    const { result } = renderHook(() =>
      useForm({ username: "" }, vi.fn(), validate)
    );

    act(() => {
      result.current.handleBlur({
        target: { name: "username" },
      });
    });

    expect(result.current.touched.username).toBe(true);
    expect(result.current.errors.username).toBe("Username is required");
  });

  it("should prevent submission and set errors if validation fails", async () => {
    const validate = vi.fn().mockReturnValue({ email: "Email is required" });
    const onSubmit = vi.fn();

    const { result } = renderHook(() =>
      useForm({ email: "" }, onSubmit, validate)
    );

    const preventDefault = vi.fn();
    await act(async () => {
      await result.current.handleSubmit({ preventDefault });
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(result.current.errors.email).toBe("Email is required");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should call onSubmit when validation passes", async () => {
    const validate = vi.fn().mockReturnValue({});
    const onSubmit = vi.fn().mockResolvedValue(true);

    const { result } = renderHook(() =>
      useForm({ email: "test@example.com" }, onSubmit, validate)
    );

    const preventDefault = vi.fn();
    await act(async () => {
      await result.current.handleSubmit({ preventDefault });
    });

    expect(onSubmit).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should reset form values to initial values", () => {
    const initialValues = { username: "initial" };
    const { result } = renderHook(() => useForm(initialValues, vi.fn()));

    act(() => {
      result.current.setFieldValue("username", "changed");
      result.current.setFieldError("username", "some error");
    });

    expect(result.current.values.username).toBe("changed");
    expect(result.current.errors.username).toBe("some error");

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
  });
});
