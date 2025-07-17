import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import getAllEvents from "../../components/getallEvent";

export default function EventList() {
  const [allEvents, setallEvents] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const loadEvents = async () => {
      const result = await getAllEvents();
      setallEvents(result?.data || null); // ✅ triggers re-render
    };

    loadEvents();
  }, []);
  const handleEventClick = (event) => {
    if (event.category == "sports") {
      navigate(`/event/${event.eventName}/${event._id}/${event.category}/${event.sports}`);
    } else if (event.category == "workshop") {
      navigate(`/event/${event.eventName}/${event._id}/workshop`);
    } else {
      navigate(`/event/${event.eventName}/${event._id}/others`);
    }
    };
    console.log("all events:", allEvents);
    if (allEvents === null) {
      return <div>No Events Hosted</div>;
    }
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-200 to-indigo-200 py-16 px-6">
      <h1 className="text-4xl font-bold text-center text-purple-800 mb-10">
        🎉 Events You Conducted
      </h1>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {allEvents.map((event, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
            onClick={()=>handleEventClick(event)}
          >
            {event.festivalName !== "" && (
              <h2 className="text-3xl font-bold text-purple-700 mb-2">
                {event.festivalName}
              </h2>
            )}
            <h2 className="text-2xl font-bold text-purple-700 mb-2">
              {event.eventName}
            </h2>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">🕒 Date:</span>{" "}
              {new Date(event.startDate).toDateString()}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">🏠 Venue:</span> {event.location}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">🎯 Category:</span>{" "}
              {event.category}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">📌 Organizer:</span>{" "}
              {event.organization}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">👥 Max Participants:</span>{" "}
              {event.maxParticipants}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
