import EventCardParticipant from "./EventCardParticipant";
import LoadingPage from "../LoadingPage";
import { motion } from "framer-motion";
import { useMyParticipatedEvents } from "../../hooks/useEvents";

export default function MyEvents() {
  const { events, loading, error, refetch } = useMyParticipatedEvents();

  if (loading) return <LoadingPage />;

  return (
    <div
      className="min-h-screen pt-24 pb-12 px-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-heading text-3xl font-semibold text-center mb-10 tracking-tight"
        style={{ color: "var(--color-navy)" }}
      >
        Events you participated in
      </motion.h1>

      {error && (
        <div className="alert-error max-w-md mx-auto mb-8">{error}</div>
      )}

      {!error && events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-2xl"
            style={{ backgroundColor: "var(--color-surface-2)" }}
          >
            🎟️
          </div>
          <p className="font-medium" style={{ color: "var(--color-text-secondary)" }}>No events yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Join an event using your invitation code.
          </p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCardParticipant key={event._id} event={event} onLeave={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}
