import EventCard from "../../components/shared/EventCard";

// Re-export the shared EventCard with basic variant
export default function EventCardBasic({ event }) {
  return <EventCard event={event} variant="basic" />;
}
