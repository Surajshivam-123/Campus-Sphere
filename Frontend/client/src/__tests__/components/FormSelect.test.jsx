import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import FormSelect from "../../components/shared/FormSelect.jsx";

describe("FormSelect Component", () => {
  const options = ["Cricket", "Football", "Coding"];

  it("should render label and default option", () => {
    render(
      <FormSelect
        label="Category"
        name="category"
        options={options}
        defaultLabel="Choose a category"
      />
    );

    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Choose a category")).toBeInTheDocument();
    expect(screen.getByText("Cricket")).toBeInTheDocument();
    expect(screen.getByText("Football")).toBeInTheDocument();
    expect(screen.getByText("Coding")).toBeInTheDocument();
  });

  it("should display required asterisk when required is true", () => {
    render(<FormSelect label="Category" required={true} options={options} />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("should render error message when touched and error are set", () => {
    render(
      <FormSelect
        label="Category"
        options={options}
        touched={true}
        error="Category is required"
      />
    );

    expect(screen.getByText("Category is required")).toBeInTheDocument();
  });

  it("should handle onChange event", () => {
    const handleChange = vi.fn();
    render(
      <FormSelect
        label="Category"
        options={options}
        onChange={handleChange}
      />
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Cricket" } });

    expect(handleChange).toHaveBeenCalled();
  });
});
