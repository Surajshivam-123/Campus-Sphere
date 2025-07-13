import React from "react";

const events = [
  {
    eventName: "TechFest 2025",
    eventDate: "2025-09-20",
    eventLocation: "Main Auditorium",
    category: "Coding",
    organizer: "Suraj Kumar",
    totalParticipants: 100,
  },
  {
    eventName: "Sports Meet 2024",
    eventDate: "2024-12-05",
    eventLocation: "Sports Ground",
    category: "Sports",
    organizer: "Ravi Sharma",
    totalParticipants: 80,
  },
  {
    eventName: "Culture Carnival",
    eventDate: "2024-08-15",
    eventLocation: "Open Stage",
    category: "Cultural",
    organizer: "Aditi Verma",
    totalParticipants: 150,
  },
];

export default function EventList() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-200 to-indigo-200 py-16 px-6">
      <h1 className="text-4xl font-bold text-center text-purple-800 mb-10">
        🎉 Events You Conducted
      </h1>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {events.map((event, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition-shadow duration-300"
          >
            <h2 className="text-2xl font-bold text-purple-700 mb-2">
              📅 {event.eventName}
            </h2>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">🕒 Date:</span>{" "}
              {new Date(event.eventDate).toDateString()}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">🏠 Venue:</span>{" "}
              {event.eventLocation}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">🎯 Category:</span>{" "}
              {event.category}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">📌 Organizer:</span>{" "}
              {event.organizer}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">👥 Max Participants:</span>{" "}
              {event.totalParticipants}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
