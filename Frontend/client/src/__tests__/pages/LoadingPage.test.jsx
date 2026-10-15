import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import LoadingPage from "../../pages/LoadingPage.jsx";

describe("LoadingPage Component", () => {
  it("should render loading text and animated container", () => {
    render(<LoadingPage />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});
