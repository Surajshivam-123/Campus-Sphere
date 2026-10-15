import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import OfflinePage from "../../pages/OfflinePage.jsx";

describe("OfflinePage Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render offline message and diagnostics", () => {
    render(<OfflinePage />);

    expect(screen.getByText("Where did the signal go?")).toBeInTheDocument();
    expect(screen.getByText(/Error: Connection Lost/i)).toBeInTheDocument();
    expect(screen.getByText("Diagnostics Status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /check connection & retry/i })).toBeInTheDocument();
  });

  it("should trigger checking state and retry on button click", () => {
    const onRetry = vi.fn();
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });

    render(<OfflinePage onRetry={onRetry} />);

    const button = screen.getByRole("button", { name: /check connection & retry/i });
    fireEvent.click(button);

    expect(screen.getByText("Checking System Connection...")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText("Connection restored! Redirecting...")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(onRetry).toHaveBeenCalled();
  });
});
