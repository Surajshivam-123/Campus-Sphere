import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingPage from "../LoadingPage";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Info, Star } from "lucide-react";
import eventService from "../../services/event.service";

export default function EventDetailsMemberPage() {
  const { memberCode } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const result = await eventService.getEventByMemberCode(memberCode);
        if (result.success) setEventData(result.data);
      } catch (err) {
        console.error("Error loading event:", err);
      }
    };
    loadEvent();
  }, [memberCode]);

  if (!eventData) return <div><LoadingPage /></div>;

  const isCricket = eventData.category === 'sports' && eventData.sports?.toLowerCase() === 'cricket';

  return (
    <div className="bg-purple-600 min-h-screen flex justify-center items-center">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-2xl mx-auto mt-10 bg-gradient-to-br from-white to-blue-50 shadow-xl rounded-3xl border border-blue-100"
    >
      <div className="flex items-center gap-3 mb-6">
        <Star className="text-purple-500" size={30} />
        <h1 className="text-3xl font-bold text-purple-700">Event Details</h1>
      </div>

      <div className="space-y-5 text-gray-700 text-base">
        <div className="flex items-center gap-2">
          <Star className="text-blue-500" />
          <p><strong className="text-gray-900">Event Name:</strong> {eventData.eventName}</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="text-green-500" />
          <p><strong className="text-gray-900">Date:</strong> {eventData.startDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="text-red-500" />
          <p><strong className="text-gray-900">Location:</strong> {eventData.location}</p>
        </div>
        <div className="flex items-start gap-2">
          <Info className="text-indigo-500 mt-1" />
          <p><strong className="text-gray-900">Description:</strong> {eventData.description}</p>
        </div>
      </div>

      {isCricket && (
        <button
          onClick={() => navigate(`/cricket-scoreboard/${eventData._id}`)}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />
          Watch Live
        </button>
      )}
    </motion.div></div>
  );
}
