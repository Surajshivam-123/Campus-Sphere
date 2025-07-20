// src/components/EventCard.jsx
export default function EventCard({ event }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 w-full max-w-md mx-auto hover:shadow-xl transition duration-300">
      {event.fullname!=='' &&(
        <div className="text-purple-700 font-bold flex items-center mb-2">{event.festivalName}</div>
      )}
      <h2 className="text-xl font-bold text-purple-700">{event.eventName}</h2>
      <p className="text-gray-600 mt-2">{event.description}</p>
      <div className="flex justify-between mt-4 text-sm text-gray-500">
        <span>📅 {event.startDate}</span>
        <span>📍 {event.location}</span>
      </div>
    </div>
  );
}
