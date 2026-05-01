import { useNavigate } from "react-router-dom";
import { FaComments, FaCrown } from "react-icons/fa";

/**
 * FloatingChatButton
 *
 * Props:
 *  - eventId  {string|null}  — shows event-chat floating button
 *  - teamId   {string|null}  — shows team-chat floating button (captain/member)
 *  - isCaptain {boolean}     — controls the tooltip label only
 */
export default function FloatingChatButton({ eventId, teamId, isCaptain }) {
  const navigate = useNavigate();

  // Neither provided → render nothing
  if (!eventId && !teamId) return null;

  // Both provided → stack two buttons
  if (eventId && teamId) {
    return (
      <>
        {/* Event chat — bottom-right */}
        <button
          id="btn-event-chat"
          onClick={() => navigate(`/events/${eventId}/chat`)}
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:shadow-2xl transition-all hover:scale-110 border-2 border-white"
          style={{ backgroundColor: "#1e3a5f" }}
          title="Open Event Chat"
        >
          <FaComments size={20} />
        </button>

        {/* Team chat — above the event chat button */}
        <button
          id="btn-team-chat"
          onClick={() => navigate(`/teams/${teamId}/chat`)}
          className="fixed bottom-24 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:shadow-2xl transition-all hover:scale-110 border-2 border-white"
          style={{ backgroundColor: "#b8860b" }}
          title={isCaptain ? "Open Team Chat (Captain)" : "Open Team Chat"}
        >
          <FaCrown size={18} />
        </button>
      </>
    );
  }

  // Only event chat
  if (eventId) {
    return (
      <button
        id="btn-event-chat"
        onClick={() => navigate(`/events/${eventId}/chat`)}
        className="fixed bottom-6 right-6 z-[9999] w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl hover:shadow-2xl transition-all hover:scale-110 border-2 border-white"
        style={{ backgroundColor: "#1e3a5f" }}
        title="Open Event Chat"
      >
        <FaComments size={24} />
      </button>
    );
  }

  // Only team chat
  return (
    <button
      id="btn-team-chat"
      onClick={() => navigate(`/teams/${teamId}/chat`)}
      className="fixed bottom-6 right-6 z-[9999] w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl hover:shadow-2xl transition-all hover:scale-110 border-2 border-white"
      style={{ backgroundColor: "#b8860b" }}
      title={isCaptain ? "Open Team Chat (Captain)" : "Open Team Chat"}
    >
      <FaCrown size={22} />
    </button>
  );
}
