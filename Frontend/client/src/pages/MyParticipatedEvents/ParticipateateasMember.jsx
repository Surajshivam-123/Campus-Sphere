import EventCard from "../../components/shared/EventCard";
import LoadingPage from "../LoadingPage";
import { motion } from "framer-motion";
import { useMyMemberEvents } from "../../hooks/useEvents";

export default function MemberEvents() {
  const { events, loading, error } = useMyMemberEvents();

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
        Events you joined as member
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
            👥
          </div>
          <p className="font-medium" style={{ color: "var(--color-text-secondary)" }}>No member events yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Use a member code to join an event.
          </p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event._id} event={event} variant="basic" />
          ))}
        </div>
      )}
    </div>
  );
}
