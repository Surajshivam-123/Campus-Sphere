import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { MdEventNote } from "react-icons/md";
import LoadingPage from "../LoadingPage";
import eventService from "../../services/event.service";
import EventCard from "../../components/shared/EventCard";

export default function EventList() {
  const [allEvents, setallEvents] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      const result = await eventService.getAllEvents();
      setallEvents(result?.data || null);
    };
    loadEvents();
  }, []);

  if (allEvents === null) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] py-16 px-6">
      <motion.h1
        className="font-heading text-3xl font-semibold text-center text-[#1e3a5f] mb-10 flex justify-center items-center gap-2 tracking-tight"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MdEventNote className="text-[#b8860b] text-4xl" />
        Events you conducted
      </motion.h1>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {allEvents.map((event, index) => (
          <EventCard key={event._id || index} event={event} variant="hosted" index={index} />
        ))}
      </div>
    </div>
  );
}
