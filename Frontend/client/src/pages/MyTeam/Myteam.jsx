import EventCardTeam from "./EventCardTeam";
import LoadingPage from "../LoadingPage";
import { useMyParticipatedEvents } from "../../hooks/useEvents";

export default function MyTeams() {
  const { events, loading, error } = useMyParticipatedEvents();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20 px-4">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4">
      <h1 className="text-3xl font-bold text-center text-purple-800 mb-8">
        Events You Participated In as Team
      </h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCardTeam key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
}
