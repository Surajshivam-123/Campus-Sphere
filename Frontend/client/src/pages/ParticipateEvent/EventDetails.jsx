import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Info, Hash } from "lucide-react";
import { FaComments } from "react-icons/fa";
import participantService from "../../services/participant.service";
import { formatDateTime } from "../../utils/helpers";
import LoadingPage from "../LoadingPage";
import FloatingChatButton from "../../components/shared/FloatingChatButton";

export default function EventDetailsPage() {
  const navigate = useNavigate();
  const { identityNumber, participantCode, participantId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await participantService.getEventByParticipantCode(participantCode);
        if (result) setEventData(result?.data);
      } catch (error) {
        console.error("Error loading event:", error);
      }
    };
    load();
  }, [participantCode, identityNumber]);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to unregister from this event?")) return;
    setDeleting(true);
    try {
      await participantService.deleteParticipant(participantId);
      navigate("/my-events");
    } catch (error) {
      console.error("Error unregistering:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (!eventData) return <LoadingPage />;

  const details = [
    { icon: <Hash size={15} />, label: "Identity number", value: identityNumber },
    { icon: <Info size={15} />, label: "Event name", value: eventData.eventName },
    { icon: <CalendarDays size={15} />, label: "Date", value: formatDateTime(eventData.startDate) },
    { icon: <MapPin size={15} />, label: "Location", value: eventData.location },
    ...(eventData.description ? [{ icon: <Info size={15} />, label: "Description", value: eventData.description }] : []),
  ];

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <FloatingChatButton eventId={eventId} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto rounded-lg shadow-sm p-8 border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <h1
          className="font-heading text-2xl font-semibold mb-1"
          style={{ color: "var(--color-navy)" }}
        >
          Event Details
        </h1>
        <div
          className="w-8 h-px mb-6"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)" }}
        />

        <div className="space-y-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {details.map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0" style={{ color: "var(--color-navy)" }}>{icon}</span>
              <span>
                <span className="font-medium" style={{ color: "var(--color-navy)" }}>{label}: </span>
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => navigate(`/events/${eventData._id}/chat`)}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-white font-medium rounded text-sm transition"
            style={{ backgroundColor: "var(--color-navy)" }}
          >
            <FaComments size={14} /> Open Chat
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger"
          >
            {deleting ? "Unregistering…" : "Unregister"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
