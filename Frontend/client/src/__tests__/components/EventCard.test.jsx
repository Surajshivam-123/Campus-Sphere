import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import EventCard from "../../components/shared/EventCard.jsx";

vi.mock("../../hooks/useIsLive", () => ({
  default: vi.fn().mockReturnValue({ isLive: false }),
}));

describe("EventCard Component", () => {
  const mockEvent = {
    _id: "evt123",
    eventName: "Annual Hackathon",
    festivalName: "TechFest 2026",
    description: "Build innovative software in 24 hours",
    startDate: "2026-11-20T10:00:00Z",
    location: "Main Auditorium",
    category: "coding",
    memberCode: "MEM123",
    participantCode: "PART123",
    organization: "Computer Society",
    maxParticipants: 150,
  };

  it("should render event details in basic variant", () => {
    render(
      <MemoryRouter>
        <EventCard event={mockEvent} variant="basic" />
      </MemoryRouter>
    );

    expect(screen.getByText("TechFest 2026")).toBeInTheDocument();
    expect(screen.getByText("Annual Hackathon")).toBeInTheDocument();
    expect(screen.getByText("Build innovative software in 24 hours")).toBeInTheDocument();
    expect(screen.getByText("Main Auditorium")).toBeInTheDocument();
  });

  it("should render Leave Event button when variant is participant", () => {
    render(
      <MemoryRouter>
        <EventCard
          event={mockEvent}
          variant="participant"
          additionalData={{ participantId: "p1", identityNumber: "ID1" }}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /leave event/i })).toBeInTheDocument();
  });

  it("should render extra organizer info when variant is hosted", () => {
    render(
      <MemoryRouter>
        <EventCard event={mockEvent} variant="hosted" />
      </MemoryRouter>
    );

    expect(screen.getByText("Computer Society")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
  });
});
