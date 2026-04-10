import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdEventNote } from "react-icons/md";
import LoadingPage from "../LoadingPage";
import eventService from "../../services/event.service";
import EventCard from "../../components/shared/EventCard";

export default function EventList() {
  const [allEvents, setAllEvents] = useState(null);

  useEffect(() => {
    const load = async () => {
      const result = await eventService.getAllEvents();
      setAllEvents(result?.data || []);
    };
    load();
  }, []);

  if (allEvents === null) return <LoadingPage />;

  return (
    <div
      className="min-h-screen py-16 px-6"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <motion.h1
        className="font-heading text-3xl font-semibold text-center mb-10 flex justify-center items-center gap-2 tracking-tight"
        style={{ color: "var(--color-navy)" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MdEventNote style={{ color: "var(--color-gold)", fontSize: "2rem" }} />
        Events you conducted
      </motion.h1>

      {allEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-2xl"
            style={{ backgroundColor: "var(--color-surface-2)" }}
          >
            📋
          </div>
          <p className="font-medium" style={{ color: "var(--color-text-secondary)" }}>No events yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Create your first event to get started.</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {allEvents.map((event, index) => (
            <EventCard key={event._id || index} event={event} variant="hosted" index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
