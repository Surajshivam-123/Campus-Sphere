import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import API_URL from "../../config/api";
import { formatDateTime } from "../../utils/helpers";
import useIsLive from "../../hooks/useIsLive";

export default function EventCard({ event, variant = "basic", additionalData = {}, index = 0, onLeave }) {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const isCricketEvent = event.category === "sports" && event.sports?.toLowerCase() === "cricket";
  const { isLive } = useIsLive(isCricketEvent ? event._id : null);

  const handleLeave = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to leave this event?")) return;
    setLeaving(true);
    try {
      const res = await fetch(
        `${API_URL}/api/cpsh/participants/delete-participant/${additionalData.participantId}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) onLeave?.();
    } catch (err) {
      console.error("Failed to leave event:", err);
    } finally {
      setLeaving(false);
    }
  };

  const handleClick = () => {
    const { identityNumber, participantCode, participantId } = additionalData;
    switch (variant) {
      case "participant":
      case "team":
        if (event.category === "sports" && event.sports === "cricket") {
          navigate(`/sports/cricket/event-details/${event._id}/${identityNumber}/${encodeURIComponent(event.participantCode)}/${participantId}`);
        } else if (event.category === "coding") {
          navigate(`/coding/contest/${event._id}`);
        } else {
          navigate(`/event-details/${identityNumber}/${encodeURIComponent(event.participantCode)}/${participantId}`);
        }
        break;
      case "hosted":
        if (event.category === "sports" && event.sports?.toLowerCase() === "cricket") {
          navigate(`/event/${event.eventName}/${event._id}/sports/cricket`);
        } else {
          navigate(`/hosted-event/${event._id}`);
        }
        break;
      default:
        navigate(`/get-event/${encodeURIComponent(event.memberCode)}`);
    }
  };

  const cardStyle = {
    backgroundColor: "var(--color-surface)",
    borderColor: "var(--color-border)",
  };

  const liveButton = isLive && (
    <button
      onClick={(e) => { e.stopPropagation(); navigate(`/sports/cricket/scoreboard/${event._id}`); }}
      className="mt-2 w-full flex items-center justify-center gap-2 py-2 text-white text-sm font-medium rounded transition"
      style={{ backgroundColor: "#16a34a" }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#15803d"}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#16a34a"}
    >
      <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />
      Watch Live
    </button>
  );

  return (
    <motion.div
      className="rounded-lg border transition-colors"
      style={cardStyle}
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = "color-mix(in srgb, var(--color-gold) 40%, transparent)"}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--color-border)"}
    >
      <div className="p-6 cursor-pointer" onClick={handleClick}>
        {event.festivalName && event.festivalName !== "" && (
          <p
            className="text-xs font-medium uppercase tracking-wider mb-1"
            style={{ color: "var(--color-gold)" }}
          >
            {event.festivalName}
          </p>
        )}
        <h2
          className="font-heading text-lg font-semibold mb-3"
          style={{ color: "var(--color-navy)" }}
        >
          {event.eventName}
        </h2>
        <div
          className="w-8 h-px mb-3"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)" }}
        />

        {variant !== "hosted" && event.description && (
          <p
            className="text-sm mb-3 leading-relaxed line-clamp-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {event.description}
          </p>
        )}

        <div className="space-y-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          <p>
            <span className="font-medium" style={{ color: "var(--color-navy)" }}>Date: </span>
            {formatDateTime(event.startDate)}
          </p>
          <p>
            <span className="font-medium" style={{ color: "var(--color-navy)" }}>Venue: </span>
            {event.location}
          </p>
          {variant === "hosted" && (
            <>
              <p>
                <span className="font-medium" style={{ color: "var(--color-navy)" }}>Category: </span>
                {event.category}
              </p>
              <p>
                <span className="font-medium" style={{ color: "var(--color-navy)" }}>Organizer: </span>
                {event.organization}
              </p>
              <p>
                <span className="font-medium" style={{ color: "var(--color-navy)" }}>Max participants: </span>
                {event.maxParticipants}
              </p>
            </>
          )}
        </div>
      </div>

      {(variant === "participant" || variant === "team") && (
        <div className="px-6 pb-4">
          <button
            onClick={handleLeave}
            disabled={leaving}
            className="btn-danger w-full"
          >
            {leaving ? "Leaving…" : "Leave event"}
          </button>
        </div>
      )}

      {isLive && (
        <div className="px-6 pb-4">
          {liveButton}
        </div>
      )}
    </motion.div>
  );
}
