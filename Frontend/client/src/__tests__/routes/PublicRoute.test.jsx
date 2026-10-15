import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PublicRoute from "../../routes/PublicRoute.jsx";
import * as useAuthModule from "../../hooks/useAuth.jsx";

describe("PublicRoute Route Guard", () => {
  it("should render nothing when loading is true", () => {
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      isAuthenticated: false,
      loading: true,
    });

    const { container } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div>Login Form</div>
              </PublicRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText("Login Form")).not.toBeInTheDocument();
    expect(container.innerHTML).toBe("");
  });

  it("should redirect to /home when user is already authenticated", () => {
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div>Login Form</div>
              </PublicRoute>
            }
          />
          <Route path="/home" element={<div>Home Feed</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText("Login Form")).not.toBeInTheDocument();
    expect(screen.getByText("Home Feed")).toBeInTheDocument();
  });

  it("should render children when user is not authenticated", () => {
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      isAuthenticated: false,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <div>Login Form</div>
              </PublicRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Form")).toBeInTheDocument();
  });
});
