import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { ThemeProvider, useTheme } from "../../hooks/useTheme.jsx";

describe("useTheme Hook & ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;

  it("should throw error if useTheme is used outside ThemeProvider", () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      "useTheme must be used within ThemeProvider"
    );
  });

  it("should initialize with default theme and allow toggling", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    const initialTheme = result.current.theme;
    expect(typeof initialTheme).toBe("string");

    act(() => {
      result.current.toggle();
    });

    const toggledTheme = result.current.theme;
    expect(toggledTheme).not.toBe(initialTheme);
    expect(result.current.isDark).toBe(toggledTheme === "dark");

    act(() => {
      result.current.toggle();
    });

    expect(result.current.theme).toBe(initialTheme);
  });
});
