import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import API_URL from "../../config/api";

/**
 * Unified EventCard component that handles all event card display scenarios
 * @param {Object} event - Event data
 * @param {string} variant - Card variant: 'basic' | 'participant' | 'team' | 'hosted'
 * @param {Object} additionalData - Additional data like participant info
 * @param {number} index - Index for animation delay
 */
export default function EventCard({ event, variant = 'basic', additionalData = {}, index = 0, onLeave }) {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const handleLeave = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to leave this event?")) return;
    setLeaving(true);
    try {
      const res = await fetch(
        `${API_URL}/api/cpsh/participants/delete-participant/${additionalData.participantId}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) {
        onLeave?.();
      }
    } catch (err) {
      console.error("Failed to leave event:", err);
    } finally {
      setLeaving(false);
    }
  };

  const handleClick = () => {
    const { identityNumber, participantCode, participantId } = additionalData;

    switch (variant) {
      case 'participant':
        if (event.category === 'sports' && event.sports === 'cricket') {
          navigate(`/cricket-event-details/${event._id}/${identityNumber}/${encodeURIComponent(event.participantCode)}/${participantId}`);
        } else {
          navigate(`/event-details/${identityNumber}/${encodeURIComponent(event.participantCode)}/${participantId}`);
        }
        break;

      case 'team':
        if (event.category === 'sports' && event.sports === 'cricket') {
          navigate(`/cricket-event-details/${event._id}/${identityNumber}/${encodeURIComponent(event.participantCode)}/${participantId}`);
        } else {
          navigate(`/event-details/${identityNumber}/${encodeURIComponent(event.participantCode)}/${participantId}`);
        }
        break;

      case 'hosted':
        if (event.category === 'sports') {
          navigate(`/event/${event.eventName}/${event._id}/${event.category}/${event.sports}`);
        } else if (event.category === 'workshop') {
          navigate(`/event/${event.eventName}/${event._id}/workshop`);
        } else {
          navigate(`/event/${event.eventName}/${event._id}/others`);
        }
        break;

      case 'basic':
      default:
        navigate(`/get-event/${encodeURIComponent(event.memberCode)}`);
        break;
    }
  };

  if (variant === 'hosted') {
    return (
      <motion.div
        className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#b8860b]/40 transition-colors cursor-pointer"
        whileHover={{ scale: 1.01 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        onClick={handleClick}
      >
        {event.festivalName && event.festivalName !== "" && (
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
    );
  }

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-white shadow-md rounded-xl p-4 w-full max-w-md mx-auto hover:shadow-xl transition duration-300"
    >
      {event.festivalName && event.festivalName !== '' && (
        <div className="text-purple-700 font-bold flex items-center mb-2">
          {event.festivalName}
        </div>
      )}
      <h2 className="text-xl font-bold text-purple-700">{event.eventName}</h2>
      <p className="text-gray-600 mt-2">{event.description}</p>
      <div className="flex justify-between mt-4 text-sm text-gray-500">
        <span>📅 {event.startDate}</span>
        <span>📍 {event.location}</span>
      </div>
      {(variant === 'participant' || variant === 'team') && (
        <button
          onClick={handleLeave}
          disabled={leaving}
          className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
        >
          {leaving ? "Leaving..." : "Leave Event"}
        </button>
      )}
    </div>
  );
}
