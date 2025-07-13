// src/pages/MyEvents.jsx
import EventCard from "./EventCard";

export default function MyEvents() {
  const participatedEvents = [
    {
      id: 1,
      name: "Coding Contest 2025",
      description: "A campus-wide competitive coding contest.",
      date: "2025-06-20",
      location: "Auditorium Hall"
    },
    {
      id: 2,
      name: "Sports Meet",
      description: "Annual sports event with inter-department matches.",
      date: "2025-05-15",
      location: "Main Stadium"
    },
    {
      id: 3,
      name: "AI Workshop",
      description: "Workshop on the future of AI and ML.",
      date: "2025-04-10",
      location: "Lab 3, Block C"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4">
      <h1 className="text-3xl font-bold text-center text-purple-800 mb-8">Events You Participated In</h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {participatedEvents.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
