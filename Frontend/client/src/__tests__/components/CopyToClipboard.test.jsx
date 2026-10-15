import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import CopyToClipboard from "../../components/shared/CopyToClipboard.jsx";

describe("CopyToClipboard Component", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("should render copy button with default text", () => {
    render(<CopyToClipboard textToCopy="ABCDE" />);
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
  });

  it("should copy text to clipboard on click and show copied state", async () => {
    render(<CopyToClipboard textToCopy="EVENT-CODE-123" />);

    const button = screen.getByRole("button", { name: /copy/i });
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("EVENT-CODE-123");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();
    });
  });
});
