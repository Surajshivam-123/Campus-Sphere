import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdEventNote } from "react-icons/md";
import LoadingPage from "../LoadingPage";
import getAllEvents from "../../components/getallEvent";

export default function EventList() {
  const [allEvents, setallEvents] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      const result= await getAllEvents();
      setallEvents(result?.data || null);
    };
    loadEvents();
  }, []);
  if (allEvents === null) {
    return (
      <><LoadingPage/></>
    );
  }
  const handleEventClick = (event) => {
    if (event.category === "sports") {
      navigate(
        `/event/${event.eventName}/${event._id}/${event.category}/${event.sports}`
      );
    } else if (event.category === "workshop") {
      navigate(`/event/${event.eventName}/${event._id}/workshop`);
    } else {
      navigate(`/event/${event.eventName}/${event._id}/others`);
    }
  };

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
          <motion.div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#b8860b]/40 transition-colors cursor-pointer"
            whileHover={{ scale: 1.01 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            onClick={() => handleEventClick(event)}
          >
            {event.festivalName !== "" && (
              <h2 className="font-heading text-xl font-semibold text-[#1e3a5f] mb-2">
                {event.festivalName}
              </h2>
            )}
            <h2 className="font-heading text-lg font-semibold text-[#1e3a5f] mb-3">
              {event.eventName}
            </h2>
            <div className="w-8 h-px bg-[#b8860b]/40 mb-3" />
            <p className="text-[#374151] text-sm mb-1">
              <span className="font-medium text-[#1e3a5f]">Date:</span>{" "}
              {new Date(event.startDate).toDateString()}
            </p>
            <p className="text-[#374151] text-sm mb-1">
              <span className="font-medium text-[#1e3a5f]">Venue:</span> {event.location}
            </p>
            <p className="text-[#374151] text-sm mb-1">
              <span className="font-medium text-[#1e3a5f]">Category:</span> {event.category}
            </p>
            <p className="text-[#374151] text-sm mb-1">
              <span className="font-medium text-[#1e3a5f]">Organizer:</span> {event.organization}
            </p>
            <p className="text-[#374151] text-sm">
              <span className="font-medium text-[#1e3a5f]">Max participants:</span> {event.maxParticipants}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
