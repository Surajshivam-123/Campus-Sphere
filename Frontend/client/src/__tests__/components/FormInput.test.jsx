import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import FormInput from "../../components/shared/FormInput.jsx";

describe("FormInput Component", () => {
  it("should render label and input field", () => {
    render(
      <FormInput
        label="Username"
        name="username"
        placeholder="Enter your username"
      />
    );

    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument();
  });

  it("should display required asterisk when required is true", () => {
    render(<FormInput label="Email" required={true} />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("should render error message only when touched and error are present", () => {
    const { rerender } = render(
      <FormInput
        label="Password"
        error="Password too short"
        touched={false}
      />
    );

    expect(screen.queryByText("Password too short")).not.toBeInTheDocument();

    rerender(
      <FormInput
        label="Password"
        error="Password too short"
        touched={true}
      />
    );

    expect(screen.getByText("Password too short")).toBeInTheDocument();
  });

  it("should render icon if provided", () => {
    render(
      <FormInput
        label="Search"
        icon={<span data-testid="search-icon">🔍</span>}
      />
    );

    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
  });
});
