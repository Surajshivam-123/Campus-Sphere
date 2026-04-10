import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingPage from "../LoadingPage";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Info } from "lucide-react";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { formatDateTime } from "../../utils/helpers";
import useIsLive from "../../hooks/useIsLive";
import memberService from "../../services/member.service";

export default function EventDetailsMemberPage() {
  const { memberCode } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isLive } = useIsLive(eventData?._id ?? null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await memberService.getEventByMemberCode(memberCode);
        if (result.success) setEventData(result.data);
      } catch (err) {
        console.error("Error loading event:", err);
      }
    };
    load();
  }, [memberCode]);

  const handleRequestJoin = async () => {
    setError(""); setLoading(true);
    try {
      const result = await memberService.requestJoinEvent(memberCode);
      if (result?.success) {
        setStatus("pending");
      } else {
        if (result?.data?.status) setStatus(result.data.status);
        else setError(result?.message || "Could not send request.");
      }
    } catch (err) {
      if (err?.message) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!eventData) return <LoadingPage />;

  const details = [
    { icon: <Info size={15} />, label: "Event name", value: eventData.eventName },
    { icon: <CalendarDays size={15} />, label: "Date", value: formatDateTime(eventData.startDate) },
    { icon: <MapPin size={15} />, label: "Location", value: eventData.location },
    ...(eventData.description ? [{ icon: <Info size={15} />, label: "Description", value: eventData.description }] : []),
  ];

  const statusMessages = {
    pending: { icon: <FaCheckCircle />, text: "Request sent — waiting for organizer approval.", type: "warning" },
    approved: { icon: <FaCheckCircle />, text: "You are already a member of this event.", type: "success" },
    rejected: { icon: <FaExclamationTriangle />, text: "Your request was rejected by the organizer.", type: "error" },
  };

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
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

        <div className="space-y-4 text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
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

        <div className="space-y-3">
          {status && statusMessages[status] && (
            <div className={`alert-${statusMessages[status].type} flex items-center gap-2`}>
              {statusMessages[status].icon}
              {statusMessages[status].text}
            </div>
          )}
          {error && (
            <div className="alert-error flex items-center gap-2">
              <FaExclamationTriangle className="shrink-0" /> {error}
            </div>
          )}
          {status === null && !error && (
            <button
              onClick={handleRequestJoin}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Sending request…" : "Request to join"}
            </button>
          )}
          {isLive && (
            <button
              onClick={() => navigate(`/sports/cricket/scoreboard/${eventData._id}`)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-white font-medium rounded text-sm transition"
              style={{ backgroundColor: "var(--color-success)" }}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />
              Watch Live
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
