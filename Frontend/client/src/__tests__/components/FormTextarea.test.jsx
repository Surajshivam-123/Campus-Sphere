import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import FormTextarea from "../../components/shared/FormTextarea.jsx";

describe("FormTextarea Component", () => {
  it("should render label and textarea", () => {
    render(
      <FormTextarea
        label="Description"
        name="description"
        placeholder="Enter event description"
      />
    );

    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter event description")).toBeInTheDocument();
  });

  it("should display required asterisk when required is true", () => {
    render(<FormTextarea label="Description" required={true} />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("should display error message when touched and error are set", () => {
    render(
      <FormTextarea
        label="Description"
        touched={true}
        error="Description is too short"
      />
    );

    expect(screen.getByText("Description is too short")).toBeInTheDocument();
  });

  it("should handle typing / onChange event", () => {
    const handleChange = vi.fn();
    render(
      <FormTextarea
        label="Description"
        onChange={handleChange}
      />
    );

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "New description text" } });

    expect(handleChange).toHaveBeenCalled();
  });
});
