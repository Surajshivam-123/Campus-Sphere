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
    <div className="min-h-screen bg-gradient-to-r from-purple-200 to-indigo-200 py-16 px-6">
      <motion.h1
        className="text-4xl font-bold text-center text-purple-800 mb-12 flex justify-center items-center gap-2"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <MdEventNote className="text-purple-600 text-5xl" />
        Events You Conducted
      </motion.h1>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {allEvents.map((event, index) => (
          <motion.div
            key={index}
            className="bg-white shadow-xl rounded-xl p-6 hover:shadow-2xl transition-shadow duration-300 cursor-pointer border border-purple-100 hover:scale-[1.02]"
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            onClick={() => handleEventClick(event)}
          >
            {event.festivalName !== "" && (
              <h2 className="text-3xl font-extrabold text-purple-700 mb-2">
                {event.festivalName}
              </h2>
            )}
            <h2 className="text-2xl font-bold text-purple-700 mb-2">
              {event.eventName}
            </h2>
            <p className="text-gray-700 mb-1">
              <span className="font-semibold">🕒 Date:</span>{" "}
              {new Date(event.startDate).toDateString()}
            </p>
            <p className="text-gray-700 mb-1">
              <span className="font-semibold">🏠 Venue:</span> {event.location}
            </p>
            <p className="text-gray-700 mb-1">
              <span className="font-semibold">🎯 Category:</span>{" "}
              {event.category}
            </p>
            <p className="text-gray-700 mb-1">
              <span className="font-semibold">📌 Organizer:</span>{" "}
              {event.organization}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">👥 Max Participants:</span>{" "}
              {event.maxParticipants}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
