import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../../components/shared/Footer.jsx";

describe("Footer Component", () => {
  const renderFooter = () =>
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

  it("should render branding and copyright", () => {
    renderFooter();

    expect(screen.getByText("Campus Sphere")).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("should render navigation sections", () => {
    renderFooter();

    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Resources")).toBeInTheDocument();
    expect(screen.getByText("Company")).toBeInTheDocument();
  });

  it("should trigger toast on clicking under-construction links", () => {
    renderFooter();

    const helpCenterBtn = screen.getByText("Help Center");
    fireEvent.click(helpCenterBtn);

    expect(
      screen.getByText(/"Help Center" is under construction. Coming soon!/i)
    ).toBeInTheDocument();
  });
});
