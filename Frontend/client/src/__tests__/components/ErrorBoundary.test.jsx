import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import ErrorBoundary from "../../components/shared/ErrorBoundary.jsx";

const ProblemChild = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error("Simulated component explosion");
  }
  return <div>Normal Content</div>;
};

describe("ErrorBoundary Component", () => {
  // Suppress console.error in tests for intentional component errors
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it("should render children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Normal Content")).toBeInTheDocument();
  });

  it("should catch render error and display fallback UI", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Application Error")).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });

  it("should render custom fallback if provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom Error View</div>}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom Error View")).toBeInTheDocument();
  });

  it("should reset error state on reset button click", () => {
    const onReset = vi.fn();
    let throwError = true;

    const DynamicChild = () => {
      if (throwError) throw new Error("Boom");
      return <div>Recovered Content</div>;
    };

    const { rerender } = render(
      <ErrorBoundary onReset={onReset}>
        <DynamicChild />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    throwError = false;
    const tryAgainBtn = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(tryAgainBtn);

    expect(onReset).toHaveBeenCalled();
  });
});
