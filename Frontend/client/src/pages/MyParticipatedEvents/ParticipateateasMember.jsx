import EventCard from "../../components/shared/EventCard";
import LoadingPage from "../LoadingPage";
import { useMyMemberEvents } from "../../hooks/useEvents";

export default function MemberEvents() {
  const { events, loading, error } = useMyMemberEvents();

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
        Events You Participated In as Member
      </h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event._id} event={event} variant="basic" />
        ))}
      </div>
    </div>
  );
}
